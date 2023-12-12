import mongoose from "mongoose";

const Schema = mongoose.Schema;

const timeslotSchema = new Schema({
  dentist: {
    type: Schema.Types.ObjectId,
    ref: "Dentist",
    required: false,
  },
  clinic: {
    type: Schema.Types.ObjectId,
    ref: "Clinic",
    required: true,
  },
  patient: {
    type: Schema.Types.ObjectId,
    ref: "Patient",
    required: false,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
});

const Timeslot = mongoose.model("Timeslot", timeslotSchema);

export default Timeslot;
