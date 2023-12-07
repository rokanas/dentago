/**
 * The Availability Service is a Node.js application designed for the Dentago distributed system. 
 */
//TODO: refactor and modularise the functionality into multiple components

const mongoose = require('mongoose');
const mqtt = require('mqtt');

// Import schemas
const Clinic = require('./models/clinic');
const Timeslot = require('./models/timeslot');

// Variables
require('dotenv').config();
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/DentagoTestDB';

// TODO: change to the non-public mosquitto broker once implemented
const broker = 'mqtt://test.mosquitto.org/:1883';
const topic = 'dentago/availability/'
const client = mqtt.connect(broker);


/**
 * Connect to MongoDB
 */
mongoose.connect(mongoUri).then(() => {
    //console.log(`Connected to MongoDB with URI: ${mongoUri}`);
    console.log('Connected to MongoDB');

}).catch((error) => {
    //console.error(`Failed to connect to MongoDB with UrI: ${mongoUri}`);
    console.error('Failed to connect to MongoDB');
    console.error(error.stack);
    process.exit(1);
});


/**
 * Connect to MQTT broker and subscribe the general Availability service topic
 */
client.on('connect', () => {
    console.log("Connected to MQTT broker");

    client.subscribe(topic, (error) => {
        if (!error) {
            console.log("Subscribed to messages on: " + topic);
        }
    });
});

/**
 * Handle incoming messages asynchronously
 */
client.on('message', async (topic, message) => {
    try {
        const payload = JSON.parse(message);
        const reqID = payload.reqID;
        const clinicId = payload.clinicID;
        const responseTopic = topic + reqID; // Append recipient address

        const clinic = await Clinic.findOne({ clinicId: clinicId });
        
        if (!clinic) {
            client.publish(responseTopic);
            throw new Error('Clinic not found');
        }

        const timeslots = await Timeslot.find({ timeslotClinic: clinic._id })
            .populate('timeslotDentist', 'dentistName').exec();

        client.publish(responseTopic, JSON.stringify(timeslots));
    } catch (error) {
        console.log("Error when processing MQTT message: ", error);
    }
});

/**
 * Handle errors
 */
client.on('error', (error) => {
    console.error('MQTT connection error: ', error);
});

/**
 * Handle unexpected disconnections
 */
client.on('close', () => {
    // "\n" due to Windows cmd prompt
    console.log('\nClient disconnected from MQTT broker');
});

/**
 * Handle reconnection to broker
 */
client.on('reconnect', () => {
    console.log('Reconnected to MQTT broker');
}); 

/**
 * Handle application shutdown 
 * SIGINT is the signal sent when terminating the process by pressing 'ctrl+c'
 */
// TODO: Can we remove the "Terminate batch job y/n?" prompt?
process.on('SIGINT', () => {
    console.log('Closing MQTT connection...');
    // End MQTT connection and exit process using success codes for both
    client.end({ reasonCode: 0x00 }, () => {
        console.log('MQTT connection closed');
        process.exit(0);
    });
});
