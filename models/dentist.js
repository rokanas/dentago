const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const dentistSchema = new Schema({
    id: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    clinic: {
        type: Schema.Types.ObjectId, ref: "Clinic"
    }
});

module.exports = mongoose.model("Dentist", dentistSchema);