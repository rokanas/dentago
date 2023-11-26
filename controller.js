const express = require("express");
const mqtt = require('/mqtt.js');
const router = express.Router();

router.use(express.json());

/*====================  ROUTE HANDLERS  ==================== */

// get all timeslots
router.get('/:clinic_id/timeslots', async (req, res) => {
    try {
        // publish clinic ID to availability service
        const clinicID = req.params.clinic_id;
        const pubTopic = 'dentago/availability/req';
        mqtt.publish(pubTopic, clinicID);

        // subscribe to topic to receive timeslots payload
        const subTopic = 'dentago/availability/res';
        mqtt.subscribe(subTopic, (payload) => {
          // respond with timeslots and unsubscribe
          res.status(200).json({data: payload});
          mqtt.unsubscribe(subTopic);
        });

    } catch(err) {
        res.status(500).json({error: err.message});  // internal server error
    }
});

// book timeslot
router.patch('/:clinic_id/timeslots/:slot_id', async (req, res) => {
    try {
        // TODO: add function logic
        const pubTopic = 'dentago/booking/req';

        // topic to listen to availability service
        const subTopic = 'dentago/booking/res';

        // subscribe to topic to receive timeslots payload
        client.subscribe(subTopic, (err) => {
            if (!err) {
                console.log(`Subscribed to topic: ${subTopic}`);
            } else {
                console.error('Subscription failed', err);
            }
        });
            
        // TODO: add response 
        
    } catch(err) {
        res.status(500).json({error: err.message});  // internal server error
    }
});

// export the router
module.exports = router;
