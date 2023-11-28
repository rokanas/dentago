const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// define schema for dentist resource
const dentistSchema = new Schema({
    dentistId: {
        type: String,
        unique: true,
        required: true
    },
    dentistName: {
        type: String,
        required: true
    },
    dentistClinic: {
        type: Schema.Types.ObjectId, ref: "Clinic"
    }
});

module.exports = mongoose.model("Dentist", dentistSchema);