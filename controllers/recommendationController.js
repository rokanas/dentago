const express = require('express');
const Patient = require('../models/patient');
const router = express.Router();

async function parsePreferences(preferences) {
    // extract non-empty days from preferences object
    const days = Object.keys(preferences).filter(
        (day) =>
        Array.isArray(preferences[day]) &&
        preferences[day].length > 0
    );
  
    return days;
};

/*====================  ROUTE HANDLERS  ==================== */
/*===================  RECOMMENDATIONS ===================== */

// save patient schedule preferences
router.patch('/patients/:patient_id/preferences', async (req, res) => {
    try {
        // extract recommendations from request body
        const preferences = req.body;

        // extract user id from request parameters
        const patientId = req.params.patient_id;

        // find patient in DB using provided id
        const patient = await Patient.findOne({ id: patientId });
        
        // if patient is not found in databse, return 403
        if(!patient) {
            return res.status(403).json({ Message: "Access forbidden: invalid patient ID"});
        }

        // update the patient's preferences and save the resource
        patient.schedulePreferences = preferences;
        await patient.save();

        // respond with relevant status code and message
        res.status(200).json({ Message: "Patient preferences saved successfully" });

    } catch(err) {
        res.status(500).json({Error: err.message});  // internal server error
    }
}); 

// get list of recommended timeslots
router.get('/patients/:patient_id/recommendations', async (req, res) => {
    try {
        // extract patient id from request parameter
        const patientId = req.params.patient_id;

        // find patient in DB using provided id
        const patient = await Patient.findOne({ id: patientId });

        // if patient is not found in databse, return 403
        if(!patient) {
            return res.status(403).json({ Message: "Access forbidden: invalid patient ID"});
        }

        // extract preferences object from patient resource
        const preferences = patient.schedulePreferences.toObject();
        
        const days = await parsePreferences(preferences);
        res.status(200).json({ days: days });

    } catch(err) {
        res.status(500).json({ Error: err.message }); // internal server error
    }
});


// export the router
module.exports = router;
