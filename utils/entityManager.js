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
        if (objTimeslot['dentist'] != null)
        {
            // Query the dentist
            dentist = await Dentist.findOne({ id: objTimeslot['dentist'] }).exec();

            // If a dentist was provided but the id was not found
            if (dentist === null)
            {
                throw new Error("ERROR: Dentist not found");
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

async function assignDentist(payload) {
    console.log('Patch timeslot');

    // The payload will consist of a Stringified Json in the form of {"timeslot": "123095124", "dentist": "dentistId"}
    try {
        const objPayload = JSON.parse(payload);
        const timeslotId = objPayload.timeslot;
        const dentistId = objPayload.dentist;

        let dentistObjId = null;

        // If no dentist is provided, we want to unassign the slot
        if (dentistId !== null)
        {
            const dentist = await Dentist.findOne({ id: dentistId }).exec();
            dentistObjId = dentist['_id'];
        }

        // Find a timeslot by its id, and updates its dentist field to the assigned dentist
        let result = await Timeslot.findByIdAndUpdate(timeslotId, {dentist: dentistObjId}, {new: true}).exec();
        console.log(result); // Optional

    } catch (error) {
        console.error('ERROR: ' + error);
    }
}

module.exports = { createClinic, createDentist, createTimeslot, assignDentist };