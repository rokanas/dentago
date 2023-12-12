import mongoose from "mongoose";

const Schema = mongoose.Schema;

/**
 * Location makes use of GeoJSON,
 * a format for storing geographic points and polygons
 * https://mongoosejs.com/docs/geojson.html.
 * This helps achieve efficient spatial queries.
 */
const clinicSchema = new Schema({
  id: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  location: {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
  // TODO: add opening hours
});

const Clinic = mongoose.model("Clinic", clinicSchema);

export default Clinic;
