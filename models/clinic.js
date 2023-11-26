const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// define schema for clinic resource
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
        // Location is stored as [longitude, latitude]
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true,
        }
    }
    // TODO: add opening hours
});

module.exports = mongoose.model("Clinic", clinicSchema);