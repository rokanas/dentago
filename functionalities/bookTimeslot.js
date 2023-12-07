import Timeslot from "../models/timeslot.js";

async function bookTimeslot(timeslot_id, patientId) {
  const timeslot = await Timeslot.findById(timeslot_id);
  if (timeslot && !timeslot.timeslotPatient) {
    try {
      timeslot.timeslotPatient = patientId;
      await timeslot.save();
    } catch (error) {
      const errorMessage = `Error booking timeslot for patient ${patientId}: ${error.message}`;
      console.error(errorMessage);
      return {
        timeslotJSON: JSON.stringify(timeslot),
        code: "500",
        message: errorMessage,
      };
    } finally {
      const successMessage = `Timeslot was booked for patient ${patientId}`;
      console.log(successMessage);
      return {
        timeslotJSON: JSON.stringify(timeslot),
        code: "200",
        message: successMessage,
      };
    }
  } else if (
    timeslot &&
    timeslot.timeslotPatient &&
    timeslot.timeslotPatient.toString() === patientId
  ) {
    const errorMessage = `Error booking timeslot for patient ${patientId}. Timeslot was already booked by this patient before.`;
    console.error(errorMessage);
    return {
      timeslotJSON: JSON.stringify(timeslot),
      code: "409",
      message: errorMessage,
    };
  } else if (
    timeslot &&
    timeslot.timeslotPatient &&
    timeslot.timeslotPatient.toString() !== patientId
  ) {
    const errorMessage = `Error booking timeslot for patient ${patientId}. Timeslot was already booked by another patient before.`;
    console.error(errorMessage);
    return {
      timeslotJSON: JSON.stringify(timeslot),
      code: "403",
      message: errorMessage,
    };
  } else {
    const errorMessage = `Timeslot was not found in the database`;
    console.error(errorMessage);
    return { timeslotJSON: {}, code: "404", message: errorMessage };
  }
}

export default bookTimeslot;
