const express = require("express");
const crypto = require("crypto");
const mqtt = require('./mqtt.js');
const Clinic = require('./models/clinic');
const Dentist = require('./models/dentist');
const router = express.Router();

router.use(express.json());

// TODO: Response from server timeouts

// define correct length for mongo object IDs
const OBJ_ID_LENGTH = 24;

// generate random ID for each request
function generateID() {
    const id = crypto.randomBytes(8).toString("hex");
    return id;
}

/*====================  ROUTE HANDLERS  ==================== */

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
        const clinicID = req.params.clinic_id;
        if(clinicID.length !== OBJ_ID_LENGTH) {
            return res.status(400).json({Error: 'Not a valid ObjectID'})
        }

        const clinic = await Clinic.findOne({_id: clinicID});
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

// create user account
Must agree upon user account schema
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
        const dentistID = req.params.dentist_id;
        if(dentistID.length !== OBJ_ID_LENGTH) {
            return res.status(400).json({Error: 'Not a valid ObjectID'})
        }

        const dentist = await Dentist.findOne({_id: dentistID});
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
        const clinicID = req.params.clinic_id;

        // generate random request ID
        const reqID = generateID();

        // create payload as JSON string containing clinic and request IDs
        const pubPayload = `{
                             "clinicID": "${clinicID}", 
                             "reqID": "${reqID}"
                            }`;

        // publish payload to availability service
        const pubTopic = 'dentago/availability/';
        mqtt.publish(pubTopic, pubPayload);

        // subscribe to topic to receive timeslots payload
        const subTopic = 'dentago/availability/' + reqID; // include reqID in topic to ensure correct incoming payload
        let payload = await mqtt.subscribe(subTopic);
        payload = JSON.parse(payload);
        res.status(200).json({ Data: payload });

    } catch(err) {
        res.status(500).json({Error: err.message});  // internal server error
    }
});

// book / cancel timeslot
router.patch('/clinics/:clinic_id/timeslots/:slot_id', async (req, res) => {
    try {
        // extract clinic and slot IDs from request parameter     
        const slotID = req.params.slot_id;
        const clinicID = req.params.clinic_id;

        // extract content from request body
        // content is a JSON string containing instruction (BOOK or CANCEL) and patient ID
        const instruction = req.body.instruction;
        const patientID = req.body.patient_id;

        // generate random request ID
        const reqID = generateID();
        
        // create payload as JSON string
        const pubPayload = `{
                             "instruction": "${instruction}", 
                             "slotID": "${slotID}",  
                             "clinicID": "${clinicID}", 
                             "patientID": "${patientID}", 
                             "reqID": "${reqID}"
                            }`;

        // publish payload to booking service
        const pubTopic = 'dentago/booking/';
        mqtt.publish(pubTopic, pubPayload);

        // subscribe to topic to receive timeslots payload
        const subTopic = 'dentago/booking/' + reqID + '/' + clinicID + '/#'; // include reqID in topic to ensure correct incoming payload
        let payload = await mqtt.subscribe(subTopic);

        // parse MQTT message to JSON
        payload = JSON.parse(payload);
        payload.timeslot = JSON.parse(payload.timeslot);
        payload.status = JSON.parse(payload.status);

        // respond with relevant status code and message
        res.status(payload.status.code).json({ Message: payload.status.message, Data: payload.data });

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

// export the router
module.exports = router;