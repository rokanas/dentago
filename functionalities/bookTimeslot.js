import Timeslot from "../models/timeslot.js";

async function bookTimeslot(timeslot_id, patientId) {
  const timeslot = await Timeslot.findOne({ 'timeslotId': timeslot_id });
  if (timeslot) {
    timeslot.timeslotPatient = patientId;
    try {
      await timeslot.save();
    } catch {
      console.error(`Error booking timeslot for user ${patientId}`);
    } finally {
      console.log(`Timeslot was booked for user ${patientId}`);
    }
  } else {
    console.error("The timeslot was not found in the database.");
  }
}

export default bookTimeslot;
