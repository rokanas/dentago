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

const { createCLIResponseMessage, createCLIResponseLoginMessage, HTTP_STATUS_CODES } = require('./utils/utils');


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
    dentistMonitor: 'dentago/monitor/dentist/ping',
    getClinics: 'dentago/dentist/clinics/',
    getTimeslots: 'dentago/dentist/timeslot/',
    loginDentist: 'dentago/dentist/login/',
    echo: 'dentago/monitor/dentist/echo'
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
        case MQTT_TOPICS['loginDentist']:
            loginDentist(topic, payload);
            break;
        default:
            console.error(`TopicError: Message received at unhandled topic "${topic}"`);
            break;
    }
});

client.on('error', (err) => {
    console.error(err);
    process.exit(1);
});

process.on('SIGINT', () => {
    console.log('Closing MQTT connection...');

    // End MQTT connection and exit process using success codes for both
    client.end({ reasonCode: 0x00 }, () => {
        console.log('MQTT connection closed');
        process.exit(0);
    });
});

async function createClinic(topic, payload) {
    try {
        const request = JSON.parse(payload);
        const objClinic = request['clinic'];
        const reqId = request['reqId'];

        const newClinic = new Clinic(objClinic);

        await newClinic.save();

        // Success message
        const successMessage = createCLIResponseMessage(`Clinic created with ID ${objClinic.id}!`, JSON.parse(JSON.stringify(newClinic)), HTTP_STATUS_CODES.created);

        console.log(successMessage);
        let resTopic = `${topic}${reqId}`
        client.publish(resTopic, JSON.stringify(successMessage));
    }
    catch (error) {
        // TODO: I don't like handling parsing in the catch block but I can't think of any other choice
        if (error.code === 11000) {
            console.error('Error: Clinic with this ID already exists');
            const errorMessage = createCLIResponseMessage('Error: Clinic with this ID already exists', [], HTTP_STATUS_CODES.conflict);

            try {
                const request = JSON.parse(payload);
                const reqId = request['reqId'];

                let resTopic = topic;

                if (reqId) {
                    resTopic += reqId;
                }

                client.publish(resTopic, JSON.stringify(errorMessage));
            }
            catch (error) {
                console.error(error);
            }

        } else {
            console.error('Error: ' + error.message);
            const errorMessage = createCLIResponseMessage(`Error: ${error.message}`, [], HTTP_STATUS_CODES.badRequest);

            try {
                const request = JSON.parse(payload);
                const reqId = request['reqId'];

                let resTopic = topic;

                if (reqId) {
                    resTopic += reqId;
                }

                client.publish(resTopic, JSON.stringify(errorMessage));
            }
            catch (error) {
                console.error(error);
            }
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
        const successMessage = createCLIResponseMessage(`Dentist created with ID ${newDentist.id}!`, JSON.parse(JSON.stringify(newDentist)), HTTP_STATUS_CODES.created);

        console.log(successMessage);
        let resTopic = `${topic}${reqId}`
        client.publish(resTopic, JSON.stringify(successMessage));
    }
    catch (error) {
        if (error.code === 11000) {
            console.error('Error: Dentist with this ID already exists');
            const errorMessage = createCLIResponseMessage('Error: Dentist with this ID already exists', [], HTTP_STATUS_CODES.conflict);

            try {
                const request = JSON.parse(payload);
                const reqId = request['reqId'];

                let resTopic = topic;

                if (reqId) {
                    resTopic += reqId;
                }

                console.log(resTopic);

                client.publish(resTopic, JSON.stringify(errorMessage));
            }
            catch (error) {
                console.error(error)
            }
        } else {
            console.error('Error: ' + error.message);
            const errorMessage = createCLIResponseMessage(`Error: ${error.message}`, [], HTTP_STATUS_CODES.badRequest);

            try {
                const request = JSON.parse(payload);
                const reqId = request['reqId'];

                let resTopic = topic;

                if (reqId) {
                    resTopic += reqId;
                }

                console.log(resTopic);

                client.publish(resTopic, JSON.stringify(errorMessage));
            }
            catch (error) {
                console.error(error);
            }
        }
    }
}

async function createTimeslot(topic, payload) {

    // Parse the payload
    try {
        const request = JSON.parse(payload);
        const objTimeslot = request['timeslot'];
        const reqId = request['reqId'];

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

            // If a dentist was provided but the ID was not found
            if (dentist === null) {
                throw new Error("Dentist not found");
            }
        }

        let dentistId = dentist === null ? null : dentist._id; // Get the dentist_id

        const newTimeslot = new Timeslot({
            clinic: clinicId,
            dentist: dentistId,
            patient: null,
            startTime: objTimeslot['startTime'],
            endTime: objTimeslot['endTime'],
        });

        await newTimeslot.save();

        // Success message
        const successMessage = createCLIResponseMessage(`Timeslot created for clinic ${objTimeslot['clinic']}!`, JSON.parse(JSON.stringify(newTimeslot)), HTTP_STATUS_CODES.created);

        console.log(successMessage);
        let resTopic = `${topic}${reqId}`
        client.publish(resTopic, JSON.stringify(successMessage));
    }
    catch (error) {
        // Forward error here
        console.error('Error: ' + error.message);
        const errorMessage = createCLIResponseMessage(`Error: ${error.message}`, [], HTTP_STATUS_CODES.badRequest);

        try {
            const request = JSON.parse(payload);
            const reqId = request['reqId'];

            let resTopic = topic;

            if (reqId) {
                resTopic += reqId;
            }

            client.publish(resTopic, JSON.stringify(errorMessage));
        }
        catch (error) {
            console.error(error);
        }
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

            console.log(result);

            // Success message
            const successMessage = createCLIResponseMessage(`Dentist ${dentistId} assigned to timeslot with ID ${timeslotId}!`, JSON.parse(JSON.stringify(result)), HTTP_STATUS_CODES.ok);

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

            console.log(result);

            // Success message
            const successMessage = createCLIResponseMessage(`Dentist unassigned from timeslot with ID ${timeslotId}!`, JSON.parse(JSON.stringify(result)), HTTP_STATUS_CODES.ok);

            console.log(successMessage);
            let resTopic = `${topic}${reqId}`
            client.publish(resTopic, JSON.stringify(successMessage));
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);

        const errorMessage = createCLIResponseMessage(`Error: ${error.message}`, [], HTTP_STATUS_CODES.badRequest);

        try {
            const request = JSON.parse(payload);
            const reqId = request['reqId'];

            let resTopic = topic;

            if (reqId) {
                resTopic += reqId;
            }

            client.publish(resTopic, JSON.stringify(errorMessage));
        }
        catch (error) {
            console.error(error)
        }
    }
}

async function handlePing() {
    try {
        client.publish(MQTT_TOPICS.echo, `echo echo echo`);
    } catch (error) {
        console.log(error.message);
    }
}

async function getAllClinics(topic, payload) {
    console.log('Get all clinics');

    try {
        const clinics = await Clinic.find().exec();
        const jsonPayload = JSON.parse(payload);
        const reqId = jsonPayload.reqId;

        // Success message
        const successMessage = createCLIResponseMessage('Get all clinics!', JSON.parse(JSON.stringify(clinics)), HTTP_STATUS_CODES.ok);

        console.log(successMessage);
        let resTopic = `${topic}${reqId}`
        client.publish(resTopic, JSON.stringify(successMessage));
    } catch (error) {
        console.error(`Error: ${error.message}`);

        // Forward error here
        const errorMessage = createCLIResponseMessage(`Error: ${error.message}`, [], HTTP_STATUS_CODES.badRequest);

        try {
            const request = JSON.parse(payload);
            const reqId = request['reqId'];

            let resTopic = topic;

            if (reqId) {
                resTopic += reqId;
            }

            client.publish(resTopic, JSON.stringify(errorMessage));
        }
        catch (error) {
            console.error(error);
        }
    }
}

// Get all timeslots for a clinic and a dentist if requested
async function getAllTimeslots(topic, payload) {
    console.log('Get all Timeslots for a Clinic');

    try {
        const jsonPayload = JSON.parse(payload);
        const reqId = jsonPayload.reqId;
        const clinicId = jsonPayload.clinicId;
        const dentistId = jsonPayload.dentistId;

        const dentist = await Dentist.findOne({ id: dentistId });

        const clinic = await Clinic.findOne({ id: clinicId });

        let timeslots = null;
        
        // Success message
        let successMessage = null;

        if (dentist)
        {
            timeslots = await Timeslot.find({ clinic: clinic._id, dentist: dentist._id });
            successMessage = createCLIResponseMessage(`Get all timeslots for clinic ${clinicId} and dentist ${dentist.id}!`, JSON.parse(JSON.stringify(timeslots)), HTTP_STATUS_CODES.ok);
        }
        else {
            timeslots = await Timeslot.find({ clinic: clinic._id });
            successMessage = createCLIResponseMessage(`Get all timeslots for clinic ${clinicId}!`, JSON.parse(JSON.stringify(timeslots)), HTTP_STATUS_CODES.ok);
        }

        console.log(successMessage);
        let resTopic = `${topic}${reqId}`;

        console.log(resTopic);

        client.publish(resTopic, JSON.stringify(successMessage));
    } catch (error) {
        // Forward error here
        const errorMessage = createCLIResponseMessage(`Error: ${error.message}`, [], HTTP_STATUS_CODES.badRequest);

        try {
            const request = JSON.parse(payload);
            const reqId = request['reqId'];

            let resTopic = topic;

            if (reqId) {
                resTopic += reqId;
            }

            client.publish(resTopic, JSON.stringify(errorMessage));
        }
        catch (error) {
            console.error(error);
        }
    }
}

async function loginDentist(topic, payload) {
    console.log("Log in dentist attempt");
    try {
        const jsonPayload = JSON.parse(payload);
        const dentistId = jsonPayload['id'];
        const dentistPassword = jsonPayload['password'];
        const reqId = jsonPayload['reqId'];

        if (!dentistId || !dentistPassword) {
            throw new Error('Incomplete fields');
        }

        const dentist = await Dentist.findOne({ id: dentistId, password: dentistPassword }).populate('clinic').exec();

        if (!dentist)
            throw new Error('Dentist not found');

        // Success message
        const successMessage = createCLIResponseLoginMessage('Dentist logged in!', JSON.parse(JSON.stringify(dentist)), HTTP_STATUS_CODES.ok, 'success');

        let resTopic = `${topic}${reqId}`;

        client.publish(resTopic, JSON.stringify(successMessage));

    }
    catch (error) {
        // Forward error here
        const errorMessage = createCLIResponseMessage(`Error: ${error.message}`, [], HTTP_STATUS_CODES.badRequest);

        let request = null;
        let reqId = null;

        try {
            request = JSON.parse(payload);
            reqId = request['reqId'];

            let resTopic = topic;

            if (reqId) {
                resTopic += reqId;
            }

            client.publish(resTopic, JSON.stringify(errorMessage));
        } catch (error) {
            console.error(error);
        }
    }
}
