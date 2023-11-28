import mongoose from "mongoose";

const Schema = mongoose.Schema;

const dentistSchema = new Schema({
  dentistId: {
    type: String,
    unique: true,
    required: true,
  },
  dentistName: {
    type: String,
    required: true,
  },
  dentistClinic: {
    type: Schema.Types.ObjectId,
    ref: "Clinic",
  },
});

const Dentist = mongoose.model("Dentist", dentistSchema);

export default Dentist;
