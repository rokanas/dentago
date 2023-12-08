const express = require('express');
const Clinic = require('../models/clinic.js');
const Dentist = require('../models/dentist.js');
const router = express.Router();

router.use(express.json());

// TODO: Response from server timeouts

// define correct length for mongo object IDs
const OBJ_ID_LENGTH = 24;

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

// export the router
module.exports = router;