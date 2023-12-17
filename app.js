/**
 * Some of the mongodb setup was taken from https://git.chalmers.se/courses/dit342/2023/group-15-web
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
    createClinic: 'dentago/dentist/creation/clinics', // Checked
    createDentist: 'dentago/dentist/creation/dentists', // Checked 
    createTimeslot: 'dentago/dentist/creation/timeslots', // Checked
    assignDentist: 'dentago/dentist/assignment/timeslot', // Checked
    bookingNotification: 'dentago/booking/+/+/SUCCESS', // TODO: Check this with david
    dentistMonitor: 'dentago/monitor/dentist/ping', // Checked
    getClinics: 'dentago/dentist/clinics/', // Checked
    getTimeslots: 'dentago/dentist/timeslot/', // Checked


    // TODO: Remove this
    testPatients: 'dentago/test/patients'
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
        case MQTT_TOPICS['getClinics']:
            getAllClinics(topic, payload);
            break;
        case MQTT_TOPICS['getTimeslots']:
            getAllTimeslots(topic, payload);
            break;
        case MQTT_TOPICS['testPatients']:
            createPatient(payload);
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

async function createClinic(payload) {
    // Parse the payload
    try {
        const objClinic = JSON.parse(payload);
        const newClinic = new Clinic(objClinic);

        newClinic.save().then(() => {
            console.log('Clinic created');
        }).catch((err) => {
            // Mongoose error code
            if (err.code === 11000) console.error('ERROR! Clinic with this id already exists | ' + err);
            else console.error(err);
        });
    }
    catch (error) {
        console.log(error);
    }
}

async function createDentist(payload) {
    // Parse the payload
    try {
        const objDentist = JSON.parse(payload);
        // Find object ID
        const test = await Clinic.findOne({ id: objDentist['clinic'] }).exec();

        const newDentist = new Dentist({
            id: objDentist['id'],
            name: objDentist['name'],
            password: objDentist['password'],
            clinic: test._id,
        });

        newDentist.save().then(() => {
            console.log('Dentist created');
        }).catch((err) => {
            if (err.code === 11000) console.error('ERROR! Dentist with this id already exists | ' + err);
            else console.error(err);
        });
    }
    catch (error) {
        console.log(error);
    }
}

async function createTimeslot(payload) {

    // Parse the payload
    try {
        const objTimeslot = JSON.parse(payload);

        const clinic = await Clinic.findOne({ id: objTimeslot['clinic'] }).exec();
        let clinicId = clinic._id;

        // If a dentist is provided
        let dentist = null;
        if (objTimeslot['dentist'] != null) {
            // Query the dentist
            dentist = await Dentist.findOne({ id: objTimeslot['dentist'] }).exec();

            // If a dentist was provided but the id was not found
            if (dentist === null) {
                throw new Error("ERROR: Dentist not found");
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

        newTimeslot.save().then(() => {
            console.log('Timeslot created');
        }).catch((err) => {
            console.error(err);
        });
    }
    catch (error) {
        console.log(error);
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

async function assignDentist(payload) {

    // The payload will consist of a Stringified Json in the form of {"timeslot": "123095124", "dentist": "dentistId"}
    try {
        const objPayload = JSON.parse(payload);
        const timeslotId = objPayload.timeslot;
        const dentistId = objPayload.dentist;

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

            // Optional: log the updated slot
            console.log(result);
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

            // Optional: log the updated slot
            console.log(result);
        }
    } catch (error) {
        console.error(`ERROR: ${error.message}`);
        // TODO: forward errors to the dentist CLI
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

async function getAllClinics(topic, message) {
    console.log('Get all clinics');

    try {
        const clinics = await Clinic.find().exec();
        const payload = JSON.parse(message);
        const reqId = payload.reqId;
        const returnTopic = topic + reqId;
        client.publish(returnTopic, JSON.stringify(clinics))
    } catch (error) {
        console.log(error);
    }
}

async function getAllTimeslots(topic, message) {
    console.log('Get all Timeslots for a Clinic');

    try {
        const payload = JSON.parse(message);
        const reqId = payload.reqId;
        const clinicId = payload.clinicId;
        const returnTopic = topic + reqId;
        const timeslots = await Timeslot.find({ clinic: clinicId });
        client.publish(returnTopic, JSON.stringify(timeslots));
    } catch (error) {
        console.log(error);
    }
}
