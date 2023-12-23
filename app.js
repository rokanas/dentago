/**************************************************************************************************
 * The Availability Service is a Node.js application designed for the Dentago distributed system.
 * It is responsible for fetching and publishing available Timeslots from the MongoDB.
***************************************************************************************************/

const mongoose = require('mongoose');
const mqtt     = require('mqtt');

require('dotenv').config();

// Import schemas
const Clinic   = require('./models/clinic');
const Timeslot = require('./models/timeslot');
const Dentist  = require('./models/dentist');   // Necessary to populate the query result (unused as of now)


// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/DentagoTestDB';

mongoose.connect(mongoUri).then(() => {
    //console.log(`Connected to MongoDB with URI: ${mongoUri}`);
    console.log('Connected to MongoDB');

}).catch((error) => {
    //console.error(`Failed to connect to MongoDB with UrI: ${mongoUri}`);
    console.error('Failed to connect to MongoDB');
    console.error(error.stack);
    process.exit(1);
});


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


// Other Variables
const DEFAULT_RANGE_DAYS = 7; // Default time range for query unless specified in payload


// Order Timelots by Clinic in key-value pairs 
function orderByClinic(timeslots) {
    const timeslotsByClinic = {};
    timeslots.forEach((timeslot) => {
        const clinicName = timeslot.clinic.name;
        if (!timeslotsByClinic[clinicName]) {
            timeslotsByClinic[clinicName] = [];
        }
        timeslotsByClinic[clinicName].push(JSON.stringify(timeslot));   // TODO: fix! This creates a stringified JSON inside the regular JS object
        //                                                                 - which causes issues when calling JSON.stringify on it the second time
    });
    return timeslotsByClinic;
};


//=================================== MQTT Event-Listeners ===================================//

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
                const reqId = payload.reqId;
                const clinicId = payload.clinicId;
                const responseTopic = topic + reqId; // Append recipient address
                const responseObject = {
                    reqId: reqId,
                    status: { 
                        code: null, 
                        message: ''
                    },
                    timeslots: []
                };

                // Check if the Clinic exists
                const exists = await Clinic.exists({ _id: clinicId });
                if (!exists) {
                    const errorMessage = 'Invalid clinic ID. Clinic not found.';
                    responseObject.status.code = 403;
                    responseObject.status.message = errorMessage;

                    client.publish(responseTopic, JSON.stringify(responseObject));
                    throw new Error(errorMessage);
                }

                // Set the time ranges for DB query
                const startDate = (payload.startDate) ? new Date(payload.startDate) : new Date();   // Set start search range to payload specified or current time
                const endDate = (payload.endDate) ? new Date(payload.endDate) : new Date();         // Set end search range to payload specified or default range
                
                if (!payload.endDate) {                                             // If no endDate is specified in message payload
                    endDate.setDate(startDate.getDate() + DEFAULT_RANGE_DAYS);      // Default range of 1 week
                    endDate.setHours(0, 0, 0, 0);                                   // Reset hours to ensure query doesn't return Timeslots in a range of 8 date days
                }

                // Check if any of the provided dates are invalid
                if (isNaN(startDate) || isNaN(endDate) || startDate >= endDate) {
                    let errorMessage = 'Invalid Date input: expecting YYYY-MM-DDTHH:mm';
                    if (startDate >= endDate) errorMessage = "Invalid Date input: startDate >= endDate";
                    responseObject.status.code = 403;
                    responseObject.status.message = errorMessage;

                    client.publish(responseTopic, JSON.stringify(responseObject));
                    throw new Error(errorMessage);
                }

                // TODO: remove
                console.log(payload.startDate)
                console.log(payload.endDate)
                console.log(startDate)
                console.log(endDate)

                // Return only available Timeslots for a specific clinic
                responseObject.timeslots = await Timeslot.find({ 
                    clinic: clinicId,
                    dentist:    { $ne: null },
                    startTime:  { $gt: startDate },
                    endTime:    { $lt: endDate }
                });

                // Assign status code and message
                if (responseObject.timeslots.length === 0) {
                    responseObject.status.code = 404;
                    responseObject.status.message = "No available Timeslots found.";
                } else {
                    responseObject.status.code = 200;
                    responseObject.status.message = "Available Timeslots found.";
                }

                // Publish the result
                client.publish(responseTopic, JSON.stringify(responseObject));
                console.log(responseObject);


                /****************************************************************************************
                 * Logic to fetch all Timeslots from multiple Clinics in one query (no longer used)     *
                 * Orders the Timeslots in key-value pairs, where key = Clinic's own ID (not Mongo _id) *
                 * **************************************************************************************
                // Fetch the desired Clinic(s)
                const clinic = await Clinic.find({ id: {$in: clinicId} });
                if (clinic.length === 0) {
                    const errorMessage = 'Invalid clinic ID. Clinic(s) not found';
                    responseObject.status.code = 403;
                    responseObject.status.message = errorMessage;
                    throw new Error(errorMessage);
                } 

                // Fetch all the Timeslots for the Clinics 
                const timeslots = await Timeslot.find({ clinic: {$in: clinic} }).exec();
                
                // Order the Timelots by Clinic
                //const timeslotsByClinic = orderByClinic(timeslots);
                ****************************************************************************************/

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
