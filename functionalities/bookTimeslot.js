import Timeslot from "../models/timeslot.js";

async function bookTimeslot(timeslot_id, patientId) {
  const timeslot = await Timeslot.findById(timeslot_id);
  if (timeslot) {
    timeslot.timeslotPatient = patientId;
    try {
      await timeslot.save();
    } catch {
      console.error(`Error booking timeslot for patient ${patientId}`);
    } finally {
      console.log(`Timeslot was booked for patient ${patientId}`);
      return JSON.stringify(timeslot);
    }
  } else {
    console.error("The timeslot was not found in the database.");
  }
}

export default bookTimeslot;
