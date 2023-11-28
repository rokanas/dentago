const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/**
 * Location makes use of GeoJSON,
 * a format for storing geographic points and polygons
 * https://mongoosejs.com/docs/geojson.html.
 * This helps achieve efficient spatial queries.
 */
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

// Add support for geospatial indexes
clinicSchema.index( { clinicLocation: '2dsphere' });

module.exports = mongoose.model("Clinic", clinicSchema);
