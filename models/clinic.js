const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define schema for the clinic resource
const clinicSchema = new Schema({
    clinicId: {
        type: String,
        unique: true,
        required: true
    },
    clinicName: {
        type: String,
        required: true
    },
    clinicAddress: {
        type: String,
        required: true
    },
    clinicLocation: {
        // Location is stored as {longitude, latitude}
        lat: {
            type: Number,
            required: true
        },
        lng: {
            type: Number,
            required: true,
        }
    }
});

module.exports = mongoose.model("Clinic", clinicSchema);
