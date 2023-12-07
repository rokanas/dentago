const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const timeslotSchema = new Schema({
  clinic: {
      type: Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
  },
  dentist: {
      type: Schema.Types.ObjectId,
      ref: "Dentist",
      required: false,
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

module.exports = mongoose.model("Timeslot", timeslotSchema);
