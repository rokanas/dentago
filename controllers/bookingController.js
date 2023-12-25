const express = require('express');
const mqtt = require('../mqtt.js');
const generateId = require('../utils/generateId.js');
const delay = require('../utils/delay.js');
const messageManager = require('../utils/messageManager.js');
const authController = require('./authController.js');
const router = express.Router();

// extract token authentication method from authController file
const authenticateToken = authController.authenticateToken

/*====================  ROUTE HANDLERS  ==================== */
/*===================  BOOKING SERVICE ===================== */

// book / cancel timeslot
router.patch('/clinics/:clinic_id/timeslots/:slot_id', authenticateToken, async (req, res) => {
    try {
        // extract clinic and slot IDs from request parameter     
        const slotId = req.params.slot_id;
        const clinicId = req.params.clinic_id;

        // extract content from request body
        // content is a JSON string containing instruction (BOOK or CANCEL) and patient ID
        const instruction = req.body.instruction;
        const patientId = req.body.patient_id;

        // generate random request ID
        const reqId = generateId();
        
        // create payload as JSON string
        const pubPayload = `{
                             "status": { "message": "Request to ${instruction} timeslot" },
                             "instruction": "${instruction}", 
                             "slotId": "${slotId}",  
                             "clinicId": "${clinicId}", 
                             "patientId": "${patientId}", 
                             "reqId": "${reqId}"
                            }`;

        // publish payload to booking service
        const pubTopic = 'dentago/booking/';
        mqtt.publish(pubTopic, pubPayload);

        // subscribe to topic to receive timeslots payload
        const subTopic = 'dentago/booking/' + reqId + '/' + clinicId + '/#'; // include reqID in topic to ensure correct incoming payload
        mqtt.subscribe(subTopic);

        // promise to wait for the message to arrive by adding new listener to message event manager
        const subPayloadPromise = new Promise(resolve => {
            messageManager.addListener(reqId, function bookingEndpoint(data) {
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
            return res.status(504).json({ Error: 'Request timeout: no response received from booking service'})
        }

        // respond with relevant status code and message
        res.status(subPayload.status.code).json({ Message: subPayload.status.message, Data: subPayload.data });

    } catch(err) {
        res.status(500).json({Error: err.message});  // internal server error
    }
});

// export the router
module.exports = router;