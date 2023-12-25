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
/*=================  AVAILABILITY SERVICE ================== */

// get all timeslots
router.get('/clinics/:clinic_id/timeslots', authenticateToken, async (req, res) => {       // TODO: add time frame in request parameters (and in function body)
    try {
        // extract clinic ID from request parameter     
        const clinicId = req.params.clinic_id;

        // generate random request ID
        const reqId = generateId();

        // create payload as JSON string containing clinic and request IDs
        const pubPayload = `{
                             "status": { "message": "Request for available timeslots" },
                             "clinicId": "${clinicId}", 
                             "reqId": "${reqId}"
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

        res.status(subPayload.status.code).json({ Message: subPayload.status.message, Timeslots: subPayload.timeslots });

    } catch(err) {
        res.status(500).json({ Error: err.message });  // internal server error
    }
});

// export the router
module.exports = router;