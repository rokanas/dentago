const mongoose = require('mongoose');

const Schema = mongoose.Schema;

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
        lat: {
            type: Number,
            required: true
        },
        lng: {
            type: Number,
            required: true
        }
    }
    // TODO: add opening hours
});

module.exports = mongoose.model("Clinic", clinicSchema);
