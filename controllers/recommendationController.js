const express = require('express');
const Patient = require('../models/patient');
const Timeslot = require('../models/timeslot');
const router = express.Router();

// function that returns timeslots filtered according to patient preferences
async function generateRecommendations(preferences, timeslots) {
    try {
        // extract non-empty days from preferences object
        const days = Object.keys(preferences).filter(
            (day) =>
            Array.isArray(preferences[day]) &&  // check that attribute is an array of times
            preferences[day].length > 0         // check that day contains > 0 preferred hours
        );

        // filter timeslots aaccording to patient preferences
        const recommendedTimeslots = timeslots.filter((timeslot) => {

            // parse name of day from timeslot's startTime
            const day = timeslot.startTime.toLocaleDateString('en-US', { weekday: 'long' });
            
            // check if the timeslot's day is present in patient preferences
            if (days.includes(day)) {
                // if so, extract the patient's preferred times
                const recommendedTimes = preferences[day];
        
                // extract hour from timeslot's startTime
                const startHour = timeslot.startTime.getUTCHours();
                
                // include/exclude timeslot depending on whether start time corresponds to patient's preferred time
                return recommendedTimes.includes(startHour);
                
            } else {
                // if the timeslot's day is not present in patient preferences, exclude it
                return false;
            }
        });

        // return array of timeslot objects
        return recommendedTimeslots;
    
    } catch(err) {
        // log error
        console.log(err.message);
    }
}

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

        // fetch timeslots (placeholder)
        // TODO: relocate function to availability service
        const timeslots = await Timeslot.find();
        
        // call function to filter timeslots according to patient preferences
        const recommendations = await generateRecommendations(preferences, timeslots);
        
        // return array of recommendations objects
        res.status(200).json({ recommendations: recommendations });

    } catch(err) {
        res.status(500).json({ Error: err.message }); // internal server error
    }
});


// export the router
module.exports = router;
