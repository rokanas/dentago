import mongoose from "mongoose";

const Schema = mongoose.Schema;

const patientSchema = new Schema({
  patientId: {
    type: String,
    unique: true,
    required: true,
  },
  patientName: {
    type: String,
    required: true,
  },
  patientContactInfo: {
    type: String,
    required: false,
  },
});

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;
