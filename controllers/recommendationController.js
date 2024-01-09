const express = require('express');
const Patient = require('../models/patient');
const generateId = require('../utils/generateId.js');
const delay = require('../utils/delay.js');
const messageManager = require('../utils/messageManager.js');
const mqtt = require('../mqtt.js');
const authenticateToken = require('../utils/authenticateToken.js');
const router = express.Router();


/*====================  ROUTE HANDLERS  ==================== */
/*===================  RECOMMENDATIONS ===================== */

// save patient schedule preferences
router.patch('/patients/:patient_id/preferences', authenticateToken, async (req, res) => {
    try {
        // extract recommendations from request body
        const preferences = req.body.preferredTimeWindow;

        // extract user id from request parameters
        const patientId = req.params.patient_id;

        // find patient in DB using provided id
        const patient = await Patient.findOne({ _id: patientId });
        
        // if patient is not found in database, return 404
        if(!patient) {
            return res.status(404).json({ Message: "Access forbidden: invalid patient ID"});
        }

        // update the patient's preferences and save the resource
        patient.schedulePreferences = preferences;
        await patient.save();
        console.log(JSON.stringify(patient));

        // respond with relevant status code and message
        res.status(200).json({ Message: "Patient preferences saved successfully" });

    } catch(err) {
        res.status(500).json({Error: err.message});  // internal server error
    }
}); 

// define default time range for timeslot recommendation query (when not specified in payload)
const DEFAULT_RANGE_DAYS = 7;

// get list of recommended timeslots
router.get('/patients/:patient_id/recommendations', authenticateToken, async (req, res) => {
    try {
        // extract patient id from request parameter
        const patientId = req.params.patient_id;

        // extract timeslot time range from query parameters
        const startDate = req.query.startDate ? req.query.startDate : new Date();   // if query parameter empty, set startDate to time of request
        let endDate = req.query.endDate;

        // if no endDate is specified in query parameters
        if(!endDate) {
            // set endDate to startDate
            endDate = new Date(startDate)

            // push endDate forward by 1 week (by default)
            endDate.setDate(startDate.getDate() + DEFAULT_RANGE_DAYS);   

            // reset hours to ensure query doesn't return timeslots in a range of 8 date days       
            endDate.setHours(0, 0, 0, 0);   
        }

        // generate random request ID
        const reqId = generateId();

        // create payload as JSON string containing patient ID and time range for recommendations
        const pubPayload = `{
                             "status": { "message": "Request for timeslot recommendations" },
                             "patientId": "${patientId}", 
                             "reqId": "${reqId}",
                             "startDate": "${startDate}",
                             "endDate": "${endDate}"
                            }`;
        
        // publish payload to availability service
        const pubTopic = 'dentago/availability/recommendation/';
        mqtt.publish(pubTopic, pubPayload);

        // subscribe to topic to receive timeslots payload
        const subTopic = pubTopic + reqId; // include reqID in topic to ensure correct incoming payload
        mqtt.subscribe(subTopic);

        // promise to wait for the message to arrive by adding new listener to message event manager
        const subPayloadPromise = new Promise(resolve => {
            messageManager.addListener(reqId, function recommendationEndpoint(data) {
                resolve(data);
            });
        });

        // store payload once promise is resolved, or time out after a delay
        const subPayload = await Promise.race([subPayloadPromise, delay(10000)]).then(data => {
    
            // unsubscribe from the topic after receiving the message or timing out
            mqtt.unsubscribe(subTopic);

            // remove listener from the message event manager
            messageManager.removeListener(reqId);
    
            // return message payload
            return data;
        });

        // if no payload received in time
        if(!subPayload) {
            return res.status(504).json({ Error: 'Request timeout: no response received from availability service'})
        }

        res.status(subPayload.status.code).json({ Message: subPayload.status.message, Timeslots: subPayload.timeslots });

    } catch(err) {
        res.status(500).json({ Error: err.message }); // internal server error
    }
});

// export the router
module.exports = router;
