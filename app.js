/**
 * Some of the mongodb setup was taken from https://git.chalmers.se/courses/dit342/2023/group-15-web
 */

// Dependencies
const mongoose = require('mongoose');
const mqtt = require('mqtt');
require('dotenv').config();

const { createClinic, createDentist, createTimeslot, assignDentist } = require('./utils/entityManager');

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
    createTimeslot: 'dentago/creation/timeslot',
    assignDentist: 'dentago/assignment/timeslot',
    bookingNotification: 'dentago/booking/+/+/SUCCESS', //+reqId/+clinicId/+status
    dentistMonitor: 'dentago/monitor/dentist/ping'
}

const ECHO_TOPIC = 'dentago/monitor/dentist/echo';

const MQTT_OPTIONS = {
    // Placeholder to add options in the future
    keepalive: 0
}

const client = mqtt.connect('mqtt://test.mosquitto.org', MQTT_OPTIONS);

client.on('connect', () => {
    console.log('MQTT successfully connected!');

    let topicList = [];

    Object.values(MQTT_TOPICS).forEach(element => {
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
        case MQTT_TOPICS['createTimeslot']:
            createTimeslot(payload);
            break;
        case MQTT_TOPICS['assignDentist']:
            assignDentist(payload);
            break;
        case MQTT_TOPICS['dentistMonitor']:
            handlePing(topic);
            break;
        default:
            handleBookingNotification(topic, payload);
            break;
    }
});

client.on('error', (err) => {
    console.error(err);
    process.exit(1);
});

async function handleBookingNotification(topic, payload) {

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
        if (clinicId.length === 0 || status.length === 0) {
            throw new Error('Invalid topic data');
        }

        let resTopic = `dentago/booking/${clinicId}/`;
        resTopic += status;
        
        let instruction = JSON.parse(payload.toString())['instruction'];

        console.log(`Send booking notification for clinic: ${clinicId} with status: ${status} | ${instruction}`);

        client.publish(resTopic, `Booking ${status}`);

    } catch (error) {
        console.log(error);
    }
}

async function handlePing(topic) {
    try {
        // TODO: Make this a variable maybe
        client.publish(ECHO_TOPIC, `echo echo echo`);
    } catch (error) {
        console.log(error);
    }
}
