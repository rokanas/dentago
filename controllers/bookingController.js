const express = require('express');
const mqtt = require('../mqtt.js');
const generateId = require('../utils/generateId.js');
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

        // Promise to wait for the message to arrive
        const subPayloadPromise = new Promise(resolve => {
            messageManager.addListener(reqId, function bookingEndpoint(data) {
                resolve(data);
            });
        });

        const subPayload = await Promise.race([subPayloadPromise, delay(10000)]).then(result => {
 
            // unsubscribe from the topic after receiving the message or a timeout
            mqtt.unsubscribe(subTopic);
    
            // Optionally, return a modified result if needed
            return result;
        });

        // respond with relevant status code and message
        res.status(subPayload.status.code).json({ Message: subPayload.status.message, Data: subPayload.data });

    } catch(err) {
        res.status(500).json({Error: err.message});  // internal server error
    }
});

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// export the router
module.exports = router;