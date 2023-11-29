const Clinic = require('../models/clinic');
const Dentist = require('../models/dentist');
const Timeslot = require('../models/timeslot');

async function createClinic(payload) {
    // Parse the payload
    try {
        const objClinic = JSON.parse(payload);
        const newClinic = new Clinic(objClinic);

        newClinic.save().then(() => {
            console.log('Clinic created');
        }).catch((err) => {
            if (err.code === 11000) console.error('ERROR! Clinic with this id already exists');
            else console.error(err);
        });
    }
    catch  (error) {
        console.log(error);
    }
}

async function createDentist(payload){
    // Parse the payload
    try {
        const objDentist = JSON.parse(payload);
        // Find object ID
        const test =  await Clinic.findOne({clinicId: objDentist['dentistClinic']}).exec();

        const newDentist = new Dentist({
            dentistId: objDentist['dentistId'],
            dentistName: objDentist['dentistName'],
            dentistClinic: test._id,
        });

        newDentist.save().then(() => {
            console.log('Dentist created');
        }).catch((err) => {
            if (err.code === 11000) console.error('ERROR! Dentist with this id already exists');
            else console.error(err);
        });
    }
    catch  (error) {
        console.log(error);
    }
}

async function createTimeslot(payload){
    // TODO: Fix the date issues
    
    // Parse the payload
    try {
        const objSlot = JSON.parse(payload);
        
        const clinic =  await Clinic.findOne({clinicId: objSlot['timeslotClinic']}).exec();
        const dentist =  await Dentist.findOne({dentistId: objSlot['timeslotDentist']}).exec();

        let clinicId = clinic._id;
        let dentistId = dentist !== null ? dentist._id : null; // Check if there is a dentist_id passed in the payload

        const newTimeslot = new Timeslot({
            timeslotClinic: clinicId,
            timeslotDentist: dentistId,
            timeslotPatient: null,
            timeslotStartTime: objSlot['timeslotStartTime'],
            timeslotEndTime: objSlot['timeslotEndTime'],
        });

        newTimeslot.save().then(() => {
            console.log('Timeslot created');
        }).catch((err) => {
            console.error(err);
        });
    }
    catch  (error) {
        console.log(error);
    }
}

module.exports = { createClinic, createDentist, createTimeslot };