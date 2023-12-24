const express = require('express');
const Patient = require('../models/patient');
const Clinic = require('../models/clinic');
const Notification = require('../models/notification');
const router = express.Router();

async function handleNotification(topic, payload) {
    try {
        // topic: dentago/notifications/userId -> topic.split('/)[2] = userId
        let patientId = topic.split('/')[2];

        // Create notification
        const userNotification = new Notification(payload);
        userNotification.save();

        // Find patient
        const patient = await Patient.findOne({ id: patientId }).exec();

        // Update data
        patient.notifications.push(userNotification);
        await patient.save();

        // console.log(result);

    } catch (err) {
        console.log("Error handling notification: " + err.message);
    }
};

async function generateRecNotification(timeslot, message) {
    try { 
        const clinic = await Clinic.findOne({ _id: timeslot.clinic });

        const parsedDate = new Date(timeslot.startTime);
        // parse name of day from timeslot's startTime
        const timeslotDay = parsedDate.toLocaleDateString('en-US', { weekday: 'long' });

        // parse timeslot's startTime
        const timeslotYear = parsedDate.getFullYear();
        const timeslotMonth = parsedDate.getMonth() + 1; // add 1 to correct function's default mapping (jan-dec = 0-11 by default)
        const timeslotDate = parsedDate.getDate();
        const timeslotHour = parsedDate.getUTCHours();

        // create notification
        const recNotification = new Notification({
            category: "RECOMMENDATION",
            message: `New timeslot available at ${clinic.name} on ${timeslotYear}/${timeslotMonth}/${timeslotDate} at ${timeslotHour}:00`,
            timeslots: timeslot._id,
            read: false
        })
        const messageParts = message.split(' ');
        const cancelledPatientId = messageParts[messageParts.length - 1];

        const patients = await Patient.find();

        for(const patient of patients) {
            // ignore patient that cancelled appointment & patients without saved preferences 
            if (patient._id.toString() !== cancelledPatientId && patient.schedulePreferences !== null) {
                // extract preferences object from patient resource
                const preferences = patient.schedulePreferences.toObject();

                // extract non-empty days from preferences object
                const days = Object.keys(preferences).filter(
                    (day) =>
                    Array.isArray(preferences[day]) &&  // check that attribute is an array of times
                    preferences[day].length > 0         // check that day contains > 0 preferred hours
                );

                // check if the timeslot's day is present in patient preferences
                if (days.includes(timeslotDay)) {
                    // if so, extract the patient's preferred times
                    const preferredTimes = preferences[timeslotDay];
                    
                    // include/exclude timeslot depending on whether start time corresponds to patient's preferred time
                    if(preferredTimes.includes(timeslotHour)) {
                        patient.notifications.push(recNotification);
                        await patient.save();
                    }
                }
            }
        }

    } catch (err) {
        console.log("Error generating recommendation notification: " + err.message);
    } 
}

/*====================  ROUTE HANDLERS  ==================== */
/*=====================  NOTIFICATIONS ===================== */

// TODO: add the authentication again
router.get('/patients/:patient_id/notifications', async (req, res) => {
    try {

        const patient = await Patient.findOne({ id: req.params.patient_id });

        if(!patient) {
            return res.status(404).json({ Message: "Patient not found" });
        }

        const patientNotifications = patient.notifications;
        let allNotifications = [];
        
        // Iterate through all the notifications
        const notificationPromises = patientNotifications.map(async (notification) => {
            const currentNotification = await Notification.findById(notification);
            allNotifications.push(currentNotification);
        });

        await Promise.all(notificationPromises);

        res.status(200).json(allNotifications); // request successful
    } catch(err) {
        res.status(500).json({ Error: err.message });  // internal server error
    }
});

// export the router
module.exports = {
    router,
    handleNotification,
    generateRecNotification
}