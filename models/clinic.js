import mongoose from "mongoose";

const Schema = mongoose.Schema;

const clinicSchema = new Schema({
  clinicId: {
    type: String,
    unique: true,
    required: true,
  },
  clinicAddress: {
    type: String,
    required: true,
  },
  clinicLocation: {
    // Location is stored as [longitude, latitude]
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  // TODO: add opening hours
});

const Clinic = mongoose.model("Clinic", clinicSchema);

export default Clinic;
