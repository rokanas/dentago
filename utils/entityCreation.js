const Clinic = require('../models/clinic');
const Dentist = require('../models/dentist');
const Timeslot = require('../models/slot');

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

async function createSlot(payload){
    // TODO: Fix the date issues
    // TODO: Make sure that we have a separate function to create slots without any dentists
    console.log('Create Slot');
    // Parse the payload
    try {
        const objSlot = JSON.parse(payload);

        // console.log(objSlot);
        
        const dentist =  await Dentist.findOne({dentistId: objSlot['timeslotDentist']}).exec();
        const clinic =  await Clinic.findOne({clinicId: objSlot['timeslotClinic']}).exec();

        // console.log(dentist._id);
        // console.log(clinic._id);

        const newTimeslot = new Timeslot({
            timeslotDentist: dentist._id,
            timeslotClinic: clinic._id,
            timeslotStartTime: objSlot['timeslotStartTime'],
            timeslotEndTime: objSlot['timeslotEndTime']
        });

        newTimeslot.save().then(() => {
            console.log('Timeslot created');
        }).catch((err) => {
            // This is pointless now I think
            if (err.code === 11000) console.error('ERROR! Timeslot with this id already exists');
            else console.error(err);
        });
    }
    catch  (error) {
        console.log(error);
    }
}

module.exports = { createClinic, createDentist, createSlot };