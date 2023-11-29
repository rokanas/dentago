const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const timeslotSchema = new Schema({
    timeslotClinic: {
        type: Schema.Types.ObjectId,
        ref: "Clinic",
        required: true,
    },
    timeslotDentist: {
        type: Schema.Types.ObjectId,
        ref: "Dentist",
        required: false,
    },
    timeslotPatient: {
        type: Schema.Types.ObjectId,
        ref: "Patient",
        required: false,
    },
    timeslotStartTime: {
        type: Date,
        required: true,
    },
    timeslotEndTime: {
        type: Date,
        required: true,
    },
});

module.exports = mongoose.model("Timeslot", timeslotSchema);
