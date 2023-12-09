/**
 * The Availability Service is a Node.js application designed for the Dentago distributed system,
 * responsible for retrieving and publishing available Timeslots from the MongoDB.
 */

const mongoose = require('mongoose');
const mqtt     = require('mqtt');

// Import schemas
const Clinic   = require('./models/clinic');
const Timeslot = require('./models/timeslot');
const Dentist  = require('./models/dentist');

// Variables
require('dotenv').config();
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/DentagoTestDB';

// TODO: change to the non-public mosquitto broker once implemented
const broker = 'mqtt://test.mosquitto.org/:1883';
const client = mqtt.connect(broker);

// MQTT subscriber-topics
const MQTT_SUB_TOPICS = {
    AVAILABILITY: 'dentago/availability/',
    MONITOR_SUB:  'dentago/monitor/availability/ping'
};

// MQTT publisher-topics
const MONITOR_PUB = 'dentago/monitor/availability/echo';

// Connect to MongoDB
mongoose.connect(mongoUri).then(() => {
    //console.log(`Connected to MongoDB with URI: ${mongoUri}`);
    console.log('Connected to MongoDB');

}).catch((error) => {
    //console.error(`Failed to connect to MongoDB with UrI: ${mongoUri}`);
    console.error('Failed to connect to MongoDB');
    console.error(error.stack);
    process.exit(1);
});

// Order Timelots by Clinic in key-value pairs
function orderByClinic(timeslots) {
    const timeslotsByClinic = {};
    timeslots.forEach((timeslot) => {
        const clinicName = timeslot.clinic.name;
        if (!timeslotsByClinic[clinicName]) {
            timeslotsByClinic[clinicName] = [];
        }
        timeslotsByClinic[clinicName].push(JSON.stringify(timeslot));
    });
    return timeslotsByClinic;
};


// Connect to MQTT broker and subscribe to the topics
client.on('connect', () => {
    console.log('Connected to MQTT broker');

    client.subscribe(Object.values(MQTT_SUB_TOPICS), (error, granted) => {
        if(!error) {
            granted.forEach(key => {
                console.log(`Subscribed to messages on: ${key.topic}`);
            });
        }
    });
});

// Handle incoming messages asynchronously
client.on('message', async (topic, message) => {
    switch (topic) {
        // Incoming request for Timeslot data
        case MQTT_SUB_TOPICS['AVAILABILITY']:
            try {
                const payload = JSON.parse(message);
                const reqID = payload.reqID;
                const clinicId = payload.clinicID;
                const responseTopic = topic + reqID; // Append recipient address
        
                // Fetch the desired Clinics
                const clinic = await Clinic.find({ id: {$in: clinicId} });
                if (clinic.length === 0) {
                    client.publish(responseTopic);
                    throw new Error('Clinic not found');
                }

                // Fetch all the Timeslots for the Clinics
                const timeslots = await Timeslot.find({ clinic: {$in: clinic} })
                    .populate('dentist', 'name').populate('clinic', 'name').exec();
                
                // Order the Timelots by Clinic
                const timeslotsByClinic = orderByClinic(timeslots);

                // Publish the ordered Timeslots
                client.publish(responseTopic, JSON.stringify(timeslotsByClinic));

            } catch (error) {
                console.log("Error when processing MQTT message: ", error);
            }
            break;

        // Received ping from Monitor-service
        case MQTT_SUB_TOPICS['MONITOR_SUB']:
            client.publish(MONITOR_PUB);
            console.log('Pong!');
            break;

        // Show error in case of unhandled topic
        default:
            console.error(`TopicError: Message received at unhandled topic "${topic}"`);
    }
});

// Handle uncaught MQTT errors
client.on('error', (error) => {
    console.error('MQTT connection error: ', error);
});

// Handle unexpected disconnections
client.on('close', () => {
    console.log('\nClient disconnected from MQTT broker'); // "\n" due to Windows cmd prompt
});

// Handle reconnection to broker
client.on('reconnect', () => {
    console.log('Reconnected to MQTT broker');
}); 

// Handle application shutdown gracefully
// SIGINT is the signal sent when terminating the process by pressing 'ctrl+c'
process.on('SIGINT', () => {
    console.log('Closing MQTT connection...');
    // End MQTT connection and exit process using success codes for both
    client.end({ reasonCode: 0x00 }, () => {
        console.log('MQTT connection closed');
        process.exit(0);
    });
});
