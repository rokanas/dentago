const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const timeslotSchema = new Schema({
    clinic: {
        type: Schema.Types.ObjectId,
        ref: "Clinic",
        required: true,
    },
    dentist: {
        type: Schema.Types.ObjectId,
        ref: "Dentist",
        required: false,
    },
    patient: {
        type: Schema.Types.ObjectId,
        ref: "Patient",
        required: false,
    },
    startTime: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                // Check that date is after today's date
                return value > new Date();
            },
            message: 'Start time must be after today'
        }
    },
    endTime: {
        type: Date,
        required: true,
        validate: {
            validator: function(value) {
                // Check if endTime is after startTime
                return value > this.startTime;
            },
            message: 'End time must be after start time'
        }
    },
});

module.exports = mongoose.model("Timeslot", timeslotSchema);
