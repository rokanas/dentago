const express = require('express');
const mqtt = require('../mqtt.js');
const generateId = require('../utils/generateId.js');
const delay = require('../utils/delay.js');
const messageManager = require('../utils/messageManager.js');
const authenticateToken = require('../utils/authenticateToken.js');
const router = express.Router();

// define default time range for timeslot availability query (when not specified in payload)
const DEFAULT_RANGE_DAYS = 7; 

/*====================  ROUTE HANDLERS  ==================== */
/*=================  AVAILABILITY SERVICE ================== */

// get all timeslots
router.get('/clinics/:clinic_id/timeslots', authenticateToken, async (req, res) => {       // TODO: add time frame in request parameters (and in function body)
    try {
        // extract clinic id from request parameters    
        const clinicId = req.params.clinic_id;

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

        // create payload as JSON string containing clinic and request IDs
        const pubPayload = `{
                             "status": { "message": "Request for available timeslots" },
                             "clinicId": "${clinicId}", 
                             "reqId": "${reqId}",
                             "startDate": "${startDate}",
                             "endDate": "${endDate}"
                            }`;

        // publish payload to availability service
        const pubTopic = 'dentago/availability/';
        mqtt.publish(pubTopic, pubPayload);

        // subscribe to topic to receive timeslots payload
        const subTopic = 'dentago/availability/' + reqId; // include reqID in topic to ensure correct incoming payload
        mqtt.subscribe(subTopic);

        // promise to wait for the message to arrive by adding new listener to message event manager
        const subPayloadPromise = new Promise(resolve => {
            messageManager.addListener(reqId, function availabilityEndpoint(data) {
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

        // respond with relevant status code, message and timeslots
        res.status(subPayload.status.code).json({ Message: subPayload.status.message, Timeslots: subPayload.timeslots });

    } catch(err) {
        res.status(500).json({ Error: err.message });  // internal server error
    }
});

// export the router
module.exports = router;