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
            required: true,
            validate: {
                validator: isValidLatitude,
                message: '{VALUE} is not a valid latitude'
            }
        },
        lng: {
            type: Number,
            required: true,
            validate: {
                validator: isValidLongitude,
                message: '{VALUE} is not a valid longitude'
            }
        }
    },
    hours: {
        type: [
            {
                type: Number,
                validate: {
                    validator: isValidHour,
                    message: '{VALUE} is not a valid hour'
                }
            }
        ],
        validate: {
            validator: isValidHoursArray,
            message: 'Invalid opening hours'
        },
        required: false,
        default: [8, 17]
    }
});

function isValidLatitude(value) {
    return value >= -90 && value <= 90;
}

function isValidLongitude(value) {
    return value >= -180 && value <= 180;
}

function isValidHour(value) {
    return value >= 0 && value <= 23;
}

function isValidHoursArray(value) {
    return Array.isArray(value) && value.length === 2 && value[1] > value[0];
}

module.exports = mongoose.model("Clinic", clinicSchema);
