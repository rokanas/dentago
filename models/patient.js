import mongoose from "mongoose";

const Schema = mongoose.Schema;

const patientSchema = new Schema({
  id: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  contactInfo: {
    type: String,
    required: false,
  },
});

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;
