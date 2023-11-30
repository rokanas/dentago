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
    catch (error) {
        console.log(error);
    }
}

async function createDentist(payload) {
    // Parse the payload
    try {
        const objDentist = JSON.parse(payload);
        // Find object ID
        const test = await Clinic.findOne({ clinicId: objDentist['dentistClinic'] }).exec();

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
    catch (error) {
        console.log(error);
    }
}

async function createTimeslot(payload) {
    // TODO: Fix the date issues

    // Parse the payload
    try {
        const objSlot = JSON.parse(payload);

        const clinic = await Clinic.findOne({ clinicId: objSlot['timeslotClinic'] }).exec();
        const dentist = await Dentist.findOne({ dentistId: objSlot['timeslotDentist'] }).exec();

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
    catch (error) {
        console.log(error);
    }
}

async function assignDentist(payload) {
    console.log('Patch timeslot');

    // The payload will consist of a Stringified Json in the form of {"timeslotId": "123095124", "timeslotDentist": "123901414"}
    try {
        const objPayload = JSON.parse(payload);
        // const requestedTimeslot = await Timeslot.findById(objPayload.slotId);

        // Find a timeslot by its id, and updates its dentist field to the assigned dentist

        let timeslotId = objPayload.timeslotId;
        let dentistId = objPayload.timeslotDentist;

        console.log('Timeslot: ' + timeslotId + ' Dentist: ' + dentistId);
        // console.log('Timeslot: ' + timeslotId);
        console.log('Timeslot ID: ')
        console.log(timeslotId);
        console.log('Dentist ID: ')
        console.log(dentistId);
        // '6567598a5ad8b769a8f2e94c'
        let a = '6567598a5ad8b769a8f2e94c';
        '6567598a5ad8b769a8f2e94c'
        // let a = null;

        let bro = await Timeslot.findByIdAndUpdate(timeslotId, {timeslotDentist: dentistId}, {new: true}).exec();


        // let bro = await Timeslot.findOneAndUpdate({_id: timeslotId}, {timeslotDentist: dentistId}).exec();
        // let bro = await Timeslot.findOneAndUpdate({_id: '6567598b5ad8b769a8f2e959'}, {timeslotDentist: '6567598a5ad8b769a8f2e94c'}).exec();

        console.log(bro);

        // const timeslotTest = await Timeslot.find({_id: '65675ca18d47694885131813'}).exec();
        // const timeslotTest = await Timeslot.find({_id: '6567598b5ad8b769a8f2e95d'}).exec();
        // console.log(timeslotTest);

        // TODO: Fix the update
        // let bro = await Timeslot.findOneAndUpdate({_id: timeslotId}, { timeslotDentist: dentistId });
        // let bro = await Timeslot.findOne({_id: timeslotId});

        // console.log(bro);


    } catch (error) {

    }
}

module.exports = { createClinic, createDentist, createTimeslot, assignDentist };