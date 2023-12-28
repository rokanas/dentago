const express = require('express');
const Patient = require('../models/patient');
const Clinic = require('../models/clinic');
const Notification = require('../models/notification');
const authenticateToken = require('../utils/authenticateToken.js');
const router = express.Router();


async function handleNotification(topic, payload) {
    try {
        // topic: dentago/notifications/userId -> topic.split('/)[2] = userId
        let patientId = topic.split('/')[2];

        // Create notification
        const userNotification = new Notification(payload);

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

// when previosuly booked timeslot is freed up, generate notification for users that have it in their schedulePreferences
async function generateRecNotification(timeslot, message) {
    try { 
        // find clinic that timeslot belongs to
        const clinic = await Clinic.findOne({ _id: timeslot.clinic });

        // convert timeslot start time into date object
        const parsedDate = new Date(timeslot.startTime);

        // parse name of day from timeslot's start time
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

        // extract cancelled patient id by parsing booking cancellation confirmation message
        const messageParts = message.split(' ');
        const cancelledPatientId = messageParts[messageParts.length - 1];

        // fetch array of patients
        const patients = await Patient.find();

        // loop through each patient
        for(const patient of patients) {
            // ignore patient that cancelled appointment & patients without saved preferences 
            if (patient._id.toString() !== cancelledPatientId && patient.schedulePreferences !== null) {
                // extract preferences object from patient resource
                const preferences = patient.schedulePreferences.toObject();

                // extract non-empty days from patient preferences object
                const days = Object.keys(preferences).filter(
                    (day) =>
                    Array.isArray(preferences[day]) &&  // check that attribute is an array of times
                    preferences[day].length > 0         // check that day contains > 0 preferred hours
                );

                // check if the timeslot's day is present in patient preferences
                if (days.includes(timeslotDay)) {
                    // if so, extract the patient's preferred times
                    const preferredTimes = preferences[timeslotDay];
                    
                    // save notification for patient if timeslot start time corresponds to patient's preferred time
                    if(preferredTimes.includes(timeslotHour)) {
                        patient.notifications.push(recNotification);
                        await patient.save();
                    }
                }
            }
        }

    } catch (err) {
        // internal error
        console.log("Error generating recommendation notification: " + err.message);
    } 
}

/*====================  ROUTE HANDLERS  ==================== */
/*=====================  NOTIFICATIONS ===================== */

router.get('/patients/:patient_id/notifications', authenticateToken, async (req, res) => {
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