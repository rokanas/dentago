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
const Patient = require('./models/patient');

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


// Date-Time formatters (looking up the right locale every time we need to format a Date is very inefficient so instead we create Formatter objects with the correct settings)
// converts UTC time to Swedish local time
const swedishTimeFormatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Stockholm',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
});

// converts UTC time to an English String-representation of the current weekday according to Swedish local time
const dayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'Europe/Stockholm' }); 


// Connect to the MQTT broker
const broker = 'mqtt://test.mosquitto.org/:1883';
const client = mqtt.connect(broker);

// MQTT subscriber-topics
const MQTT_SUB_TOPICS = {
    AVAILABILITY: 'dentago/availability/',
    RECOMMENDATION: 'dentago/availability/recommendation/',
    MONITOR_SUB:  'dentago/monitor/availability/ping'
};

// MQTT publisher-topics
const MONITOR_PUB = 'dentago/monitor/availability/echo';


// Order Timelots by Clinic in key-value pairs (unused)
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
                const startDate = new Date(payload.startDate);
                const endDate = new Date(payload.endDate);

                // Check if any of the provided dates are invalid
                if (isNaN(startDate) || isNaN(endDate) || startDate >= endDate) {
                    let errorMessage = 'Invalid Date input: expecting YYYY-MM-DDTHH:mm';
                    if (startDate >= endDate) errorMessage = "Invalid Date input: startDate >= endDate";
                    responseObject.status.code = 403;
                    responseObject.status.message = errorMessage;

                    client.publish(responseTopic, JSON.stringify(responseObject));
                    throw new Error(errorMessage);
                }

                // Return only available Timeslots for a specific clinic
                responseObject.timeslots = await Timeslot.find({ 
                    clinic: clinicId,
                    dentist:    { $ne: null },
                    startTime:  { $gt: startDate },
                    endTime:    { $lt: endDate }
                }).populate('dentist');

                // Assign status code and message
                responseObject.status.code = 200;
                responseObject.status.message = (responseObject.timeslots.length === 0) ? "No available Timeslots found." : "Available Timeslots found.";

                // Publish the result
                client.publish(responseTopic, JSON.stringify(responseObject));
                console.log(`Timeslot(s) forwarded to requesting ID: ${reqId}`);

            } catch (error) {
                console.log("Error when processing MQTT message: ", error);
            }
            break;

        // Incoming request for recommended timeslot data according to user preference
        case MQTT_SUB_TOPICS['RECOMMENDATION']:
            try {
                const payload = JSON.parse(message);
                const reqId = payload.reqId;
                const patientId = payload.patientId;
                const responseTopic = topic + reqId; // Append recipient address
                const responseObject = {
                    status: { 
                        code: null, 
                        message: ''
                    },
                    timeslots: []
                };

                // Check if the Patient exists
                const patient = await Patient.findOne({ _id: patientId });
                
                // if patient is not found in database, return 403
                if (!patient) {
                    // update attributes of responseObject
                    responseObject.status.code = 403;
                    responseObject.status.message = 'Access forbidden: invalid patient ID';

                    // publish responseObject to patient API and discontinue
                    client.publish(responseTopic, JSON.stringify(responseObject));
                    break;
                }

                // Set the time ranges for DB query
                const startDate = new Date(payload.startDate);
                const endDate = new Date(payload.endDate);

                // Check if any of the provided dates are invalid
                if (isNaN(startDate) || isNaN(endDate) || startDate >= endDate) {
                    let errorMessage = 'Invalid Date input: expecting YYYY-MM-DDTHH:mm';
                    if (startDate >= endDate) errorMessage = "Invalid Date input: startDate >= endDate";
                    responseObject.status.code = 403;
                    responseObject.status.message = errorMessage;

                    client.publish(responseTopic, JSON.stringify(responseObject));
                    throw new Error(errorMessage);
                }

                // fetch only available timeslots (where patient == null)
                const timeslots = await Timeslot.find({ 
                    patient:    null,
                    dentist:    { $ne: null },
                    startTime:  { $gt: startDate },
                    endTime:    { $lt: endDate }
                });

                // extract preferences object from patient resource
                const preferences = patient.schedulePreferences.toObject();

                // call function to filter timeslots according to patient preferences
                const recommendations = await generateRecommendations(preferences, timeslots);

                // add recommendations to responeObject
                responseObject.timeslots = recommendations;

                // Assign status code and message
                responseObject.status.code = 200;
                responseObject.status.message = (responseObject.timeslots.length === 0) ? "No Timeslot recommendations found." : "Timeslot recommendations found.";

                // Publish the result
                client.publish(responseTopic, JSON.stringify(responseObject));
                console.log(`Recommendation forwarded to requesting ID: ${reqId}`);

            } catch (error) {
                console.log("Error when processing MQTT message: ", error);
            }

            break;

        // Received ping from Monitor-service
        case MQTT_SUB_TOPICS['MONITOR_SUB']:
            client.publish(MONITOR_PUB);
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

            // parse name of day
            const day = dayFormatter.format(timeslot.startTime);
            
            // check if the timeslot's day is present in patient preferences
            if (days.includes(day)) {
                // if so, extract the patient's preferred times
                const preferredTimes = preferences[day];
        
                // extract hour from timeslot's startTime 
                const startHour = new Date(swedishTimeFormatter.format(timeslot.startTime)).getHours();
                
                // include/exclude timeslot depending on whether start time corresponds to patient's preferred time
                return preferredTimes.includes(startHour);
                
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
