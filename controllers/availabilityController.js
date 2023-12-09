const express = require('express');
const mqtt = require('../mqtt.js');
const utils = require('../utils');
const authController = require('./authController.js');
const router = express.Router();

// extract token authentication method from authController file
const authenticateToken = authController.authenticateToken

/*====================  ROUTE HANDLERS  ==================== */
/*=================  AVAILABILITY SERVICE ================== */

// get all timeslots
router.get('/clinics/:clinic_id/timeslots', authenticateToken, async (req, res) => {       // TODO: add time frame in request parameters (and in function body)
    try {
        // extract clinic ID from request parameter     
        const clinicId = req.params.clinic_id;

        // generate random request ID
        const reqId = utils.generateId();

        // create payload as JSON string containing clinic and request IDs
        const pubPayload = `{
                             "clinicID": "${clinicId}", 
                             "reqID": "${reqId}"
                            }`;

        // publish payload to availability service
        const pubTopic = 'dentago/availability/';
        mqtt.publish(pubTopic, pubPayload);

        // subscribe to topic to receive timeslots payload
        const subTopic = 'dentago/availability/' + reqId; // include reqID in topic to ensure correct incoming payload
        let subPayload = await mqtt.subscribe(subTopic);
        subPayload = JSON.parse(subPayload);
        res.status(200).json({ Data: subPayload });

    } catch(err) {
        res.status(500).json({ Error: err.message });  // internal server error
    }
});

// export the router
module.exports = router;