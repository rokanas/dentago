const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const clinicSchema = new Schema({
    id: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    location: {
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
