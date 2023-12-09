const express = require('express');
const mqtt = require('../mqtt.js');
const utils = require('../utils');
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
        const reqId = utils.generateId();
        
        // create payload as JSON string
        const pubPayload = `{
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
        let subPayload = await mqtt.subscribe(subTopic);
        
        // parse MQTT message to JSON
        subPayload = JSON.parse(subPayload);

        // respond with relevant status code and message
        res.status(subPayload.status.code).json({ Message: subPayload.status.message, Data: subPayload.data });

    } catch(err) {
        res.status(500).json({Error: err.message});  // internal server error
    }
});

// export the router
module.exports = router;