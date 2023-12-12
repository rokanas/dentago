import Timeslot from "../models/timeslot.js";

async function cancelTimeslot(timeslot_id, patientId) {
  const timeslot = await Timeslot.findById(timeslot_id);

  if (
    timeslot &&
    timeslot.patient &&
    timeslot.patient.toString() === patientId
  ) {
    //Timeslot has been found, is booked, and the patient who booked it is cancelling it.

    try {
      timeslot.patient = null;
      await timeslot.save();
    } catch (error) {
      const errorMessage = `Error cancelling timeslot for patient ${patientId}: ${error.message}`;
      console.error(errorMessage);
      return {
        timeslotJSON: JSON.stringify(timeslot),
        code: "500",
        message: errorMessage,
      };
    } finally {
      const successMessage = `Timeslot was cancelled for patient ${patientId}`;
      console.log(successMessage);
      return {
        timeslotJSON: JSON.stringify(timeslot),
        code: "200",
        message: successMessage,
      };
    }
  } else if (
    timeslot &&
    timeslot.patient &&
    timeslot.patient.toString() !== patientId
  ) {
    //Timeslot has been found, is booked, but the patient attempting to cancel it is not the patient who booked it.

    const errorMessage = `Error cancelling timeslot for patient ${patientId}. The timeslot was indeed booked, but not for this patient.`;
    console.error(errorMessage);
    return {
      timeslotJSON: JSON.stringify(timeslot),
      code: "403",
      message: errorMessage,
    };
  } else if (timeslot && !timeslot.patient) {
    //Timeslot has been found, but isn't booked.

    const errorMessage = `Error cancelling timeslot for patient ${patientId}. The timeslot was not booked.`;
    console.error(errorMessage);
    return {
      timeslotJSON: JSON.stringify(timeslot),
      code: "409",
      message: errorMessage,
    };
  } else {
    //Timeslot has not been found.

    const errorMessage = `Timeslot was not found in the database`;
    console.error(errorMessage);
    return { timeslotJSON: {}, code: "404", message: errorMessage };
  }
}

export default cancelTimeslot;
