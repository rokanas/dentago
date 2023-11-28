const Clinic = require('../models/clinic');
const Dentist = require('../models/dentist');

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

module.exports = { createClinic, createDentist };