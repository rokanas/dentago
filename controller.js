const express = require("express");
const router = express.Router();

router.use(express.json());

// get all timeslots
router.get('/:clinic_id/timeslots', async (req, res) => {
    try {
        // TODO: add function logic
    } catch(err) {
        res.status(500).json({error: err.message});  // internal server error
    }
});

// book timeslot
router.patch('/:clinic_id/timeslots/:slot_id', async (req, res) => {
    try {
        // TODO: add function logic
    } catch(err) {
        res.status(500).json({error: err.message});  // internal server error
    }
});

// export the router
module.exports = router;
