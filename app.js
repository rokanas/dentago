/**
 * Some of the mongodb setup was taken from https://git.chalmers.se/courses/dit342/2023/group-15-web
 */

/**
 * CONSTRAINTS: THE DENTIST CLI WILL HAVE TO TAKE CARE OF THE JSON VALIDATION
 */

// Dependencies
const mongoose = require('mongoose');
const mqtt = require('mqtt');

require('dotenv').config();

const Clinic = require('./models/clinic');
const Timeslot = require('./models/timeslot');
const Patient = require('./models/patient');
const Dentist = require('./models/dentist');
const Notification = require('./models/notification');

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI || process.env.MONGODB_LOCAL_URI;

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
    createClinic: 'dentago/dentist/creation/clinics/',
    createDentist: 'dentago/dentist/creation/dentists/',
    createTimeslot: 'dentago/dentist/creation/timeslots/',
    assignDentist: 'dentago/dentist/assignment/timeslot/',
    bookingNotification: 'dentago/booking/+/+/SUCCESS', // TODO: Check this with david
    dentistMonitor: 'dentago/monitor/dentist/ping',
    getClinics: 'dentago/dentist/clinics/',
    getTimeslots: 'dentago/dentist/timeslot/',
    getTimeslotsDentist: 'dentago/dentist/timeslots/dentist',


    // TODO: Remove this
    testPatients: 'dentago/test/patients'
}

// TODO: Add status for logging
// Generalized mqtt message format for the CLI
function createCLIResponseMessage(message, content) {
    return {
        message: message,
        content: content
    };
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
            createClinic(topic, payload);
            break;
        case MQTT_TOPICS['createDentist']:
            createDentist(topic, payload);
            break;
        case MQTT_TOPICS['createTimeslot']:
            createTimeslot(topic, payload);
            break;
        case MQTT_TOPICS['assignDentist']:
            assignDentist(topic, payload);
            break;
        case MQTT_TOPICS['dentistMonitor']:
            handlePing();
            break;
        case MQTT_TOPICS['getClinics']:
            getAllClinics(topic, payload);
            break;
        case MQTT_TOPICS['getTimeslots']:
            getAllTimeslots(topic, payload);
            break;
        case MQTT_TOPICS['testPatients']:
            createPatient(payload);
            break;
        case MQTT_TOPICS['getTimeslotsDentist']:
            getAllTimeslotsDentist(topic, payload);
        default:
            handleBookingNotification(topic, payload);
            break;
    }
});

client.on('error', (err) => {
    console.error(err);
    process.exit(1);
});

async function createClinic(topic, payload) {
    try {
        const request = JSON.parse(payload);
        const objClinic = request['clinic'];
        const reqId = request['reqId'];

        const newClinic = new Clinic(objClinic);

        await newClinic.save();

        // Success message
        const successMessage = createCLIResponseMessage('Clinic created!', JSON.parse(JSON.stringify(newClinic)));

        console.log(successMessage);
        let resTopic = `${topic}${reqId}`
        client.publish(resTopic, JSON.stringify(successMessage));
    }
    catch (error) {
        // TODO: I don't like handling parsing in the catch block but I can't think of any other choice
        if (error.code === 11000) {
            console.error('Error: Clinic with this id already exists');
            const errorMessage = createCLIResponseMessage('Error: Clinic with this id already exists', []);

            const request = JSON.parse(payload);
            const reqId = request['reqId'];

            let resTopic = topic;

            if (reqId) {
                resTopic += reqId;
            }

            client.publish(resTopic, JSON.stringify(errorMessage));
        } else {
            console.error('Error: ' + error.message);
            const errorMessage = createCLIResponseMessage(`Error: ${error.message}`, []);

            const request = JSON.parse(payload);
            const reqId = request['reqId'];

            let resTopic = topic;

            if (reqId) {
                resTopic += reqId;
            }

            client.publish(resTopic, JSON.stringify(errorMessage));
        }
    }
}

async function createDentist(topic, payload) {
    // Parse the payload
    try {
        const request = JSON.parse(payload);
        const objDentist = request['dentist'];
        const reqId = request['reqId'];

        // Find object ID
        const clinic = await Clinic.findOne({ id: objDentist['clinic'] }).exec();

        if (clinic === null) {
            throw new Error('Clinic not found');
        }

        const newDentist = new Dentist({
            id: objDentist['id'],
            name: objDentist['name'],
            password: objDentist['password'],
            clinic: clinic._id,
        });

        await newDentist.save();

        // Success message
        const successMessage = createCLIResponseMessage('Dentist created!', JSON.parse(JSON.stringify(newDentist)));

        console.log(successMessage);
        let resTopic = `${topic}${reqId}`
        client.publish(resTopic, JSON.stringify(successMessage));
    }
    catch (error) {
        if (error.code === 11000) {
            console.error('Error: Dentist with this id already exists');
            const errorMessage = createCLIResponseMessage('Error: Dentist with this id already exists', []);

            const request = JSON.parse(payload);
            const reqId = request['reqId'];

            let resTopic = topic;

            if (reqId) {
                resTopic += reqId;
            }

            console.log(resTopic);

            client.publish(resTopic, JSON.stringify(errorMessage));
        } else {
            console.error('Error: ' + error.message);
            const errorMessage = createCLIResponseMessage(`Error: ${error.message}`, []);

            const request = JSON.parse(payload);
            const reqId = request['reqId'];

            let resTopic = topic;

            if (reqId) {
                resTopic += reqId;
            }

            console.log(resTopic);

            client.publish(resTopic, JSON.stringify(errorMessage));
        }
    }
}

async function createTimeslot(topic, payload) {

    // Parse the payload
    try {
        const request = JSON.parse(payload);
        const objTimeslot = request['timeslot'];
        const reqId = request['reqId'];

        // const objTimeslot = JSON.parse(payload);

        const clinic = await Clinic.findOne({ id: objTimeslot['clinic'] }).exec();

        if (clinic === null) {
            throw new Error("Clinic not found");
        }

        let clinicId = clinic._id;

        // If a dentist is provided
        let dentist = null;
        if (objTimeslot['dentist'] != null) {
            // Query the dentist
            dentist = await Dentist.findOne({ id: objTimeslot['dentist'] }).exec();

            // If a dentist was provided but the id was not found
            if (dentist === null) {
                throw new Error("Dentist not found");
            }
        }

        let dentistId = dentist === null ? null : dentist._id; // Get the dentist_id

        // TODO: DELETE AFTER TESTING | CREATE ANOTHER ENDPOINT FOR TIMESLOTS WITH PATIENTS (TESTING)
        // let patient = await Patient.findOne({ id: objTimeslot['patient'] }).exec();

        const newTimeslot = new Timeslot({
            clinic: clinicId,
            dentist: dentistId,
            // patient: patient._id,
            patient: null,
            startTime: objTimeslot['startTime'],
            endTime: objTimeslot['endTime'],
        });

        await newTimeslot.save();

        // Success message
        const successMessage = createCLIResponseMessage('Timeslot created!', JSON.parse(JSON.stringify(newTimeslot)));

        console.log(successMessage);
        let resTopic = `${topic}${reqId}`
        client.publish(resTopic, JSON.stringify(successMessage));
    }
    catch (error) {
        // Forward error here
        console.error('Error: ' + error.message);
        const errorMessage = createCLIResponseMessage(`Error: ${error.message}`, []);

        const request = JSON.parse(payload);
        const reqId = request['reqId'];

        let resTopic = topic;

        if (reqId) {
            resTopic += reqId;
        }

        client.publish(resTopic, JSON.stringify(errorMessage));
    }
}

async function assignDentist(topic, payload) {
    console.log('assign dentist');
    try {
        const objPayload = JSON.parse(payload);

        const reqId = objPayload['reqId'];
        const objTimeslot = objPayload['timeslotUpdate'];

        const timeslotId = objTimeslot.timeslot;
        const dentistId = objTimeslot.dentist;

        let dentistObjId = null;

        // Check timeslot has a proper mongo_id
        if (timeslotId.length !== 24)
            throw new Error('Invalid timeslot format');

        // Find the timeslot
        const timeslot = await Timeslot.findById(timeslotId).exec();

        if (!timeslot)
            throw new Error('Timeslot not found');


        // If a dentist is provided, assign the slot
        if (dentistId !== null) {
            // console.log('ASSIGN APPOINTMENT');

            if (timeslot.dentist !== null)
                throw new Error('Timeslot already assigned');

            // Find the dentist
            const dentist = await Dentist.findOne({ id: dentistId }).exec();

            if (!dentist)
                throw new Error('Dentist not found');

            // Update the timeslot with the found dentist
            dentistObjId = dentist['_id'];

            timeslot.dentist = dentistObjId;

            const result = await timeslot.save();

            // TODO: Forward success message here
            console.log(result);

            // Success message
            const successMessage = createCLIResponseMessage('Dentist assigned!', JSON.parse(JSON.stringify(result)));

            console.log(successMessage);
            let resTopic = `${topic}${reqId}`
            client.publish(resTopic, JSON.stringify(successMessage));
        }
        // Otherwise, cancel the slot
        else {
            /**
             * When canceling an appointment,
             * if there is a patient assigned, the patient is removed
             * and a notification is forwarded to the client API.
            */
            // console.log('CANCEL APPOINTMENT');

            if (timeslot.dentist === null)
                throw new Error('Timeslot already unassigned');

            // Unassign the dentist
            timeslot.dentist = null;

            // If there is a patient assigned to it, remove it
            let patient_id = timeslot.patient;

            if (patient_id != null) {
                timeslot.patient = null;

                const patient = await Patient.findById(patient_id).exec();
                let resTopic = `dentago/notifications/${patient.id}`;

                // Forward cancel notification
                const newNotification = new Notification({
                    category: 'CANCEL',
                    message: 'Sorry, your appointment was cancelled :(',
                    timeslots: timeslotId,
                });

                client.publish(resTopic, JSON.stringify(newNotification));
            }

            const result = await timeslot.save();

            // TODO: Forward success message here
            console.log(result);

            // Success message
            const successMessage = createCLIResponseMessage('Dentist unassigned!', JSON.parse(JSON.stringify(result)));

            console.log(successMessage);
            let resTopic = `${topic}${reqId}`
            client.publish(resTopic, JSON.stringify(successMessage));
        }
    } catch (error) {
        // TODO: forward errors here
        console.error(`Error: ${error.message}`);

        // Forward error here
        // console.error('Error: ' + error.message);
        const errorMessage = createCLIResponseMessage(`Error: ${error.message}`, []);

        const request = JSON.parse(payload);
        const reqId = request['reqId'];

        let resTopic = topic;

        if (reqId) {
            resTopic += reqId;
        }

        client.publish(resTopic, JSON.stringify(errorMessage));
    }
}

async function handleBookingNotification(topic, payload) {
    // TODO: Ask david how the notification works

    // Forwards the request to a specific client that subscribed to their respective topic
    try {
        const topicArray = topic.split('/');

        /**
         * Example message: dentago/booking/+/+/SUCCESS.
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

        let resTopic = `dentago/booking/${clinicId}`;
        resTopic += status;

        let instruction = JSON.parse(payload.toString())['instruction'];
        let timeslot = JSON.parse(payload.timeslot);

        const dentistNotification = { timeslot: timeslot, instruction: instruction };

        console.log(`Send booking notification for clinic: ${clinicId} with status: ${status} | ${instruction}`);

        client.publish(resTopic, dentistNotification);

    } catch (error) {
        console.log(error.message);
    }
}

async function handlePing() {
    try {
        client.publish(ECHO_TOPIC, `echo echo echo`);
    } catch (error) {
        console.log(error.message);
    }
}

// TODO: test
async function getAllClinics(topic, payload) {
    console.log('Get all clinics');

    try {
        const clinics = await Clinic.find().exec();
        const jsonPayload = JSON.parse(payload);
        const reqId = jsonPayload.reqId;
        // client.publish(returnTopic, JSON.stringify(clinics));

        // Success message
        const successMessage = createCLIResponseMessage('Get all clinics!', JSON.parse(JSON.stringify(clinics)));

        console.log(successMessage);
        let resTopic = `${topic}${reqId}`
        client.publish(resTopic, JSON.stringify(successMessage));
    } catch (error) {
        // TODO: forward errors here
        console.error(`Error: ${error.message}`);

        // Forward error here
        const errorMessage = createCLIResponseMessage(`Error: ${error.message}`, []);

        const request = JSON.parse(payload);
        const reqId = request['reqId'];

        let resTopic = topic;

        if (reqId) {
            resTopic += reqId;
        }

        client.publish(resTopic, JSON.stringify(errorMessage));
    }
}

// TODO: test
async function getAllTimeslots(topic, payload) {
    console.log('Get all Timeslots for a Clinic');

    try {
        const jsonPayload = JSON.parse(payload);
        const reqId = jsonPayload.reqId;
        const clinicId = jsonPayload.clinicId;
        const returnTopic = topic + reqId;
        const timeslots = await Timeslot.find({ clinic: clinicId });
        // client.publish(returnTopic, JSON.stringify(timeslots));

        // Success message
        const successMessage = createCLIResponseMessage('Get all clinics!', JSON.parse(JSON.stringify(timeslots)));

        console.log(successMessage);
        let resTopic = `${topic}${reqId}`
        client.publish(resTopic, JSON.stringify(successMessage));
    } catch (error) {
        // Forward error here
        const errorMessage = createCLIResponseMessage(`Error: ${error.message}`, []);

        const request = JSON.parse(payload);
        const reqId = request['reqId'];

        let resTopic = topic;

        if (reqId) {
            resTopic += reqId;
        }

        client.publish(resTopic, JSON.stringify(errorMessage));
    }
}

// TODO: test this too
async function getAllTimeslotsDentist(topic, payload) {
    console.log('Get all Timeslots for a Dentist');

    try {
        const jsonPayload = JSON.parse(payload);
        const reqId = jsonPayload.reqId;
        const dentistId = jsonPayload.dentistId;
        const timeslots = await Timeslot.find({ dentist: dentistId });
        // client.publish(returnTopic, JSON.stringify(timeslots));

        // Success message
        const successMessage = createCLIResponseMessage('Get all clinics!', JSON.parse(JSON.stringify(timeslots)));

        console.log(successMessage);
        let resTopic = `${topic}${reqId}`
        client.publish(resTopic, JSON.stringify(successMessage));
    } catch (error) {
        // Forward error here
        const errorMessage = createCLIResponseMessage(`Error: ${error.message}`, []);

        const request = JSON.parse(payload);
        const reqId = request['reqId'];

        let resTopic = topic;

        if (reqId) {
            resTopic += reqId;
        }

        client.publish(resTopic, JSON.stringify(errorMessage));
    }
}

// TODO: Remove patient creation since it is just for testing
async function createPatient(payload) {
    console.log('Create patient');
    // Parse the payload
    try {
        const objPatient = JSON.parse(payload);
        const newPatient = new Patient(objPatient);

        newPatient.save().then(() => {
            console.log('Patient created');
        }).catch((err) => {
            // Mongoose error code
            if (err.code === 11000) console.error('ERROR! Patient with this id already exists | ' + err);
            else console.error(err);
        });
    }
    catch (error) {
        console.log(error);
    }
}
