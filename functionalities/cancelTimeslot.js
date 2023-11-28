import Timeslot from "../models/timeslot.js";

async function cancelTimeslot(timeslot_id, patientId) {
  const timeslot = await Timeslot.findOne({ 'timeslotId': timeslot_id });
  if (timeslot) {
    timeslot.timeslotPatient = null;
    try {
      await timeslot.save();
    } catch {
      console.error(`Error cancelling timeslot for user ${patientId}`);
    } finally {
      console.log(`Timeslot was cancelled for user ${patientId}`);
    }
  } else {
    console.error("The timeslot was not found in the database.");
  }
}

export default cancelTimeslot;
