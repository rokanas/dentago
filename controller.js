const express = require("express");
const crypto = require("crypto");
const mqtt = require('./mqtt.js');
const router = express.Router();
router.use(express.json());

// TODO: Response from server timeouts

// generate random ID for each request
function generateID() {
    const id = crypto.randomBytes(8).toString("hex");
    return id;
}

/*====================  ROUTE HANDLERS  ==================== */

// get all timeslots
router.get('/:clinic_id/timeslots', async (req, res) => {       // TODO: add time frame in request parameters (and in function body)
    try {
        // extract clinic ID from request parameter     
        const clinicID = req.params.clinic_id;

        // generate random request ID
        const reqID = generateID();

        // create payload as JSON string containing clinic and request IDs
        const pubPayload = `{"clinicID": "${clinicID}", "reqID": "${reqID}"}`;

        // publish payload to availability service
        const pubTopic = 'dentago/availability/';
        mqtt.publish(pubTopic, pubPayload);

        // subscribe to topic to receive timeslots payload
        const subTopic = 'dentago/availability/' + reqID; // include reqID in topic to ensure correct incoming payload
        const payload = await mqtt.subscribe(subTopic);
        res.status(200).json({ data: payload });

    } catch(err) {
        res.status(500).json({error: err.message});  // internal server error
    }
});

// book timeslot
router.patch('/:clinic_id/timeslots/:slot_id', async (req, res) => {
    try {

        // extract clinic and slot IDs from request parameter     
        const clinicID = req.params.clinic_id;
        const slotID = req.params.slot_id;

        // extract user ID from request body
        const userID = req.body.user_id;

        // generate random request ID
        const reqID = generateID();
        
        // create payload as JSON string containing clinic, user and request IDs
        const pubPayload = `{"clinicID": "${clinicID}", "slotID": "${slotID}", "userID": "${userID}", "reqID": "${reqID}"}`;

        // publish payload to booking service
        const pubTopic = 'dentago/booking/';
        mqtt.publish(pubTopic, pubPayload);

        // subscribe to topic to receive timeslots payload
        const subTopic = 'dentago/booking/' + reqID; // include reqID in topic to ensure correct incoming payload
        const payload = await mqtt.subscribe(subTopic);
        res.status(200).json({ data: payload });

    } catch(err) {
        res.status(500).json({error: err.message});  // internal server error
    }
});

// export the router
module.exports = router;