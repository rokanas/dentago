const Patient = require('../models/patient');
const Notification = require('../models/notification');

async function handleNotification(topic, payload) {
    try {
        // topic: dentago/notifications/userId -> topic.split('/)[2] = userId
        let patientId = topic.split('/')[2];

        // Create notification
        const userNotification = new Notification(JSON.parse(payload));
        userNotification.save();

        // Find patient
        const patient = await Patient.findOne({ id: patientId }).exec();

        // Update data
        patient.notifications.push(userNotification);
        await patient.save();

        // console.log(result);

    } catch (error) {
        console.log(error);
    }
};

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
    handleNotification
}