const express = require('express');
const Clinic = require('../models/clinic.js');
const Dentist = require('../models/dentist.js');
const Patient = require('../models/patient.js');
const Timeslot = require('../models/timeslot.js');
const authenticateToken = require('../utils/authenticateToken.js');
const router = express.Router();

// define correct length for mongo object IDs
const OBJ_ID_LENGTH = 24;

/*====================  ROUTE HANDLERS  ==================== */
/*==================  CLINICS & DENTISTS  ================== */

// get all clinics
router.get('/clinics', authenticateToken, async (_, res) => {
    try {
        const clinics = await Clinic.find();
        res.status(200).json(clinics);               // request successful
    } catch(err) {
        res.status(500).json({Error: err.message});  // internal server error
    }
});

// get specific clinic by id
router.get('/clinics/:clinic_id', authenticateToken, async (req, res) => {
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

// get all dentists
router.get('/dentists', authenticateToken, async (_, res) => {
    try {
        const dentists = await Dentist.find();
        res.status(200).json(dentists);               // request successful
    } catch(err) {
        res.status(500).json({Error: err.message});   // internal server error
    }
});

//get specific dentist
router.get('/dentists/:dentist_id', authenticateToken, async (req, res) => {
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

router.get('/patients/:patient_id/timeslots', authenticateToken, async (req, res) => {
    try {
        console.log('fetch timeslots for user');
        // extract patient id from request parameters
        const patientId = req.params.patient_id;

        // find timeslots with matching patient id
        const timeslots = await Timeslot.find({ patient: patientId }).populate('clinic').populate('dentist').exec();

        res.status(200).json({ Timeslots: timeslots });  // request successful


    } catch (err) {
        res.status(500).json({Error: err.message}); // internal server error
    }
});

// update patient info
router.patch('/patients/:patient_id', authenticateToken, async (req, res) => {
    try {
        // extract id from request parameters
        const patientId = req.params.patient_id;

        // find and patch patient with new info
        const updatedPatient = await Patient.findOneAndUpdate(
            { _id: patientId },
            { $set: req.body },
            { new: true });

        // if patient is not found
        if (!updatedPatient) {
            return res.status(404).json({ Error: 'Patient not found' });
        }
 
        res.status(200).json({Message: 'Patient details updated successfully', Patient: updatedPatient});              // request successful

    } catch (err) {
        res.status(500).json({Error: err.message}); // internal server error
    }
});

/*====================  ROUTE HANDLERS  ==================== */
/*================  PATIENTS (TESTING ONLY)  =============== */

// get all patients
router.get('/allpatients', async (_, res) => {
    try {
        const patients = await Patient.find();
        res.status(200).json(patients);              // request successful
    } catch(err) {
        res.status(500).json({Error: err.message});  // internal server error
    }
});
// delete all patients
router.delete('/allpatients', async (_, res) => {
    try {
        await Patient.deleteMany();
        res.status(200);             // request successful
    } catch(err) {
        res.status(500).json({Error: err.message});  // internal server error
    }
});

// get specific patient by authenticated userID
router.get('/patients/', authenticateToken, async (req, res) => {
    try {
        const patient = await Patient.findOne({ _id: req.body.user.id });
        if(!patient) {
            return res.status(404).json({ Message: "Patient not found" });
        }
        res.status(200).json(patient);                 // request successful
    } catch(err) {
        res.status(500).json({ Error: err.message });  // internal server error
    }
});

// export the router
module.exports = router;