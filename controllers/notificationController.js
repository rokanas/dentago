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

// export the router
module.exports = handleNotification;