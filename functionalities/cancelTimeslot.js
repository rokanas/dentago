import Timeslot from "../models/timeslot.js";

async function cancelTimeslot(timeslot_id, patientId) {
  const timeslot = await Timeslot.findById(timeslot_id);
  console.log("timeslot: " + timeslot);
  if (timeslot) {
    timeslot.timeslotPatient = null;
    try {
      await timeslot.save();
    } catch {
      console.error(`Error cancelling timeslot for patient ${patientId}`);
    } finally {
      console.log(`Timeslot was cancelled for patient ${patientId}`);
      return JSON.stringify(timeslot);
    }
  } else {
    console.error("The timeslot was not found in the database.");
  }
}

export default cancelTimeslot;
