const express = require("express");
const mqtt = require('/mqtt.js');
const router = express.Router();

router.use(express.json());

/*====================  ROUTE HANDLERS  ==================== */

// get all timeslots
router.get('/:clinic_id/timeslots', async (req, res) => {
    try {
        // TODO: add function logic
        const pubTopic = 'dentago/availability/req';

        // topic to listen to availability service
        const subTopic = 'dentago/availability/res';

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
