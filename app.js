// TODO: 
/**
 *      - Add endpoint for creating slots [Partially done]
 *      - Add endpoint for registering dentists in a slot
 * - EXTRA:
 *      - We might need the dentist ID as a payload for the notification
 */

/**
 * Some of the mongodb setup was taken from https://git.chalmers.se/courses/dit342/2023/group-15-web
 */

// Dependencies
const mongoose = require('mongoose');
const mqtt = require('mqtt');
require('dotenv').config();

const { createClinic, createDentist, createSlot } = require('./utils/entityCreation');

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/DentagoTestDB';

mongoose.connect(mongoURI).then(() => {
    console.log(`Connected to MongoDB!\n`);
}).catch((err) => {
    console.error(`Failed to connect to MongoDB with URI: ${mongoURI}`);
    console.error(err.stack);
    process.exit(1);
});

// MQTT
// TODO: define QOS here
const MQTT_TOPICS = {
    createClinic: 'dentago/creation/clinics',
    createDentist: 'dentago/creation/dentists',
    createSlot: 'dentago/creation/slots', //TODO: rename to createTimeslot for consistency
    bookingNotification: 'dentago/booking/+/+/+' //+reqId/+clinicId/+status
}

const MQTT_OPTIONS = {
    // Placeholder to add options in the future
    keepalive: 0
}

const client = mqtt.connect('mqtt://test.mosquitto.org', MQTT_OPTIONS);

client.on('connect', () => {
    console.log('MQTT successfully connected!');

    let topicList = [];

    Object.values(MQTT_TOPICS).forEach(element => {
        //    console.log(element);
        topicList.push(element);
    });

    // Subscribe to topics
    client.subscribe(topicList, (err) => {
        if (err) console.log('MQTT connection error: ' + err);
    });
});

client.on('message', (topic, payload) => {

    switch (topic) {
        case MQTT_TOPICS['createClinic']:
            createClinic(payload);
            break;
        case MQTT_TOPICS['createDentist']:
            createDentist(payload);
            break;
        case MQTT_TOPICS['createSlot']:
            createSlot(payload);
            break;
        default:
            handleBookingNotification(topic);
            break;
    }
});

client.on('error', (err) => {
    console.error(err);
    process.exit(1);
});

async function handleBookingNotification(topic) {

    // Forwards the request to a specific client that subscribed to their respective topic
    try {
        const topicArray = topic.split('/');

        /**
         * Example message: dentago/booking/reqId/clinicId/approved.
         *                     0  /   1   /   2   /  3  /    4
         * Since the subscribed topic uses + as a wildcard,
         * the size of the topicArray will always be correct
         */

        const clinicId = topicArray[3];
        const status = topicArray[4];

        // Check valid message
        if (clinicId.length === 0 || status.length === 0 || !(status === 'SUCCESS' || status === 'FAILURE')) {
            throw new Error('Invalid topic data');
        }

        let resTopic = `dentago/booking/${clinicId}/`;
        resTopic += status;
        
        console.log(`Send booking notification for clinic: ${clinicId} with status: ${status}`);

        client.publish(resTopic, `Booking ${status}`);

    } catch (error) {
        console.log(error);
    }
}
