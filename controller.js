const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require ("jsonwebtoken");
const mqtt = require('./mqtt.js');
const Clinic = require('./models/clinic');
const Dentist = require('./models/dentist');
const Patient = require('./models/patient');
const router = express.Router();

router.use(express.json());

// TODO: Response from server timeouts

// define correct length for mongo object IDs
const OBJ_ID_LENGTH = 24;

// generate random ID for each request
function generateId() {
    const id = crypto.randomBytes(8).toString("hex");
    return id;
}

// middleware for jwt token authentication
function authenticateToken(req, res, next) {
    // token comes from auth portion of request header
    const authHeader = req.headers['authorization'];

    // if we have auth header, return token portion, otherwise return undefined
    const token = authHeader && authHeader.split(' ')[1];   // split space between bearer and token in auth header

    // if token is undefined, return 401 unauthorized
    if(token == null) {
        return res.sendStatus(401).json({ Error: "Access unauthorized: no valid authentication credentials" });
    }

    // verify validity of access token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        // if request has access token but token is no longer valid, return 403 forbidden
        if(err) {
            return res.status(403).json({ Error: "Access forbidden: authentication credentials invalid" });
        }
        // if access token is valid, proceed with valid user
        req.body = ({ user: user });
        next();
    });
}

/*====================  ROUTE HANDLERS  ==================== */
/*==================  CLINICS & DENTISTS  ================== */

// get all clinics
router.get('/clinics', async (_, res) => {
    try {
        const clinics = await Clinic.find();
        res.status(200).json(clinics);               // request successful
    } catch(err) {
        res.status(500).json({Error: err.message});  // internal server error
    }
});

// get specific clinic by id
router.get('/clinics/:clinic_id', async (req, res) => {
    try {
        const clinicId = req.params.clinic_id;
        if(clinicId.length !== OBJ_ID_LENGTH) {
            return res.status(400).json({Error: 'Not a valid ObjectID'})
        }

        const clinic = await Clinic.findOne({_id: clinicId});
        if(!clinic) {
            return res.status(404).json({Error: 'Clinic not found'}); // resource not found
        }
        res.status(200).json(clinic);                // request successful
    } catch (err) {
        res.status(500).json({Error: err.message});  // internal server error
    }
});

/* TODO:
//get all dentists in clinic
Clinic schema doesn't currently include dentists attribute
*/

// get all dentists
router.get('/dentists', async (_, res) => {
    try {
        const dentists = await Dentist.find();
        res.status(200).json(dentists);               // request successful
    } catch(err) {
        res.status(500).json({Error: err.message});   // internal server error
    }
});

//get specific dentist
router.get('/dentists/:dentist_id', async (req, res) => {
    try {
        const dentistId = req.params.dentist_id;
        if(dentistId.length !== OBJ_ID_LENGTH) {
            return res.status(400).json({Error: 'Not a valid ObjectID'})
        }

        const dentist = await Dentist.findOne({ _id: dentistId });
        if(!dentist) {
            return res.status(404).json({Error: 'Dentist not found'}); // resource not found
        }
        res.status(200).json(dentist);                // request successful
    } catch (err) {
        res.status(500).json({Error: err.message});   // internal server error
    }
});

// get all timeslots
router.get('/clinics/:clinic_id/timeslots', async (req, res) => {       // TODO: add time frame in request parameters (and in function body)
    try {
        // extract clinic ID from request parameter     
        const clinicId = req.params.clinic_id;

        // generate random request ID
        const reqId = generateId();

        // create payload as JSON string containing clinic and request IDs
        const pubPayload = `{
                             "clinicID": "${clinicId}", 
                             "reqID": "${reqId}"
                            }`;

        // publish payload to availability service
        const pubTopic = 'dentago/availability/';
        mqtt.publish(pubTopic, pubPayload);

        // subscribe to topic to receive timeslots payload
        const subTopic = 'dentago/availability/' + reqId; // include reqID in topic to ensure correct incoming payload
        let subPayload = await mqtt.subscribe(subTopic);
        subPayload = JSON.parse(subPayload);
        res.status(200).json({ Data: subPayload });

    } catch(err) {
        res.status(500).json({ Error: err.message });  // internal server error
    }
});

// book / cancel timeslot
router.patch('/clinics/:clinic_id/timeslots/:slot_id', async (req, res) => {
    try {
        // extract clinic and slot IDs from request parameter     
        const slotId = req.params.slot_id;
        const clinicId = req.params.clinic_id;

        // extract content from request body
        // content is a JSON string containing instruction (BOOK or CANCEL) and patient ID
        const instruction = req.body.instruction;
        const patientId = req.body.patient_id;

        // generate random request ID
        const reqId = generateId();
        
        // create payload as JSON string
        const pubPayload = `{
                             "instruction": "${instruction}", 
                             "slotId": "${slotId}",  
                             "clinicId": "${clinicId}", 
                             "patientId": "${patientId}", 
                             "reqId": "${reqId}"
                            }`;

        // publish payload to booking service
        const pubTopic = 'dentago/booking/';
        mqtt.publish(pubTopic, pubPayload);

        // subscribe to topic to receive timeslots payload
        const subTopic = 'dentago/booking/' + reqId + '/' + clinicId + '/#'; // include reqID in topic to ensure correct incoming payload
        let subPayload = await mqtt.subscribe(subTopic);
        
        // parse MQTT message to JSON
        subPayload = JSON.parse(subPayload);

        // respond with relevant status code and message
        res.status(subPayload.status.code).json({ Message: subPayload.status.message, Data: subPayload.data });

    } catch(err) {
        res.status(500).json({Error: err.message});  // internal server error
    }
});
/*
        // respond according to instruction
        if(payload.instruction === "BOOK") {
            res.status(payload.status.code).json({ Message: payload.status.message, Data: payload });
        } else if (payload.instruction === "CANCEL") {
            res.status(payload.status.code).json({ Message: payload.status.message, Data: payload });
        }  */
/*==================  ROUTE HANDLERS ================== */
/*====================  USER AUTH  ==================== */

/*
**** unnecessary for now, but commented out for potential future use ****

// get all patients
router.get('/allpatients', async (_, res) => {
    try {
        const patients = await Patient.find();
        res.status(200).json(patients);              // request successful
    } catch(err) {
        res.status(500).json({Error: err.message});  // internal server error
    }
});

router.delete('/patients', async (_, res) => {
    try {
        await Patient.deleteMany();
        res.status(200);             // request successful
    } catch(err) {
        res.status(500).json({Error: err.message});  // internal server error
    }
});
*/

// TODO: discuss endpoint name
// get specific patient by authenticated userID
router.get('/patients/', authenticateToken, async (req, res) => {
    try {
        const patient = await Patient.findOne({ id: req.body.user.id });
        if(!patient) {
            return res.status(404).json({ Message: "Patient not found" });
        }
        res.status(200).json(patient);               // request successful
    } catch(err) {
        res.status(500).json({ Error: err.message });  // internal server error
    }
});

// register new patient
router.post('/register', async (req, res) => {
    try {
        // create patient object using request body
        const patient = req.body;

        // generate random request ID
        const reqId = generateId();

        // create payload as JSON string
        const pubPayload = `{
                             "patient": "${patient}",
                             "reqId": "${reqId}"
                            }`;

        // publish payload to authentication service
        const pubTopic = 'dentago/authentication/register';
        mqtt.publish(pubTopic, pubPayload);

        // subscribe to topic to access token payload
        const subTopic = 'dentago/authentication/register/' + reqId;
        let subPayload = await mqtt.subscribe(subTopic);
        
        // parse MQTT message to JSON
        subPayload = JSON.parse(subPayload);

        // respond with relevant status code and message
        res.status(subPayload.status.code).json({ 
            Message: subPayload.status.message, 
            Patient: subPayload.data.patient,
            AccessToken: subPayload.data.accessToken
        });

    } catch(err) {
        res.status(500).json({Error: err.message});  // internal server error
    }
});

// export the router
module.exports = router;