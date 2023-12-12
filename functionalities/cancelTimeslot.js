import Timeslot from "../models/timeslot.js";

async function cancelTimeslot(timeslot_id, patientId) {
  const timeslot = await Timeslot.findById(timeslot_id);
  // const timeslot = await Timeslot.findOne({ _id: timeslot_id }).exec(); // alternate snippet, will keep for now

  if (
    timeslot &&
    timeslot.patient &&
    timeslot.patient.toString() === patientId
  ) {
    //Timeslot has been found, is booked, and the patient who booked it is cancelling it.

    try {
      // Attempt to update the timeslot with the correct version
      const updated = await Timeslot.findOneAndUpdate(
        { _id: timeslot_id, __v: timeslot.__v }, // Includes version in the query for optimistic concurrency control
        { patient: null, $inc: { __v: 1 } }, // Atomically increments the version
        { new: true } // newly updated timeslot is returned
      );

      if (!updated) {
        // Timeslot has already moved on version, meaning other operations were performed in this resource
        const errorMessage = `Error cancelling timeslot for patient ${patientId}. Timeslot update was modified concurrently.`;
        console.error(errorMessage);
        return {
          timeslotJSON: JSON.stringify(timeslot),
          code: "409", //request conflict with the current state of the target resource.
          message: errorMessage,
        };
      }

      // If update successful, send a success message
      const successMessage = `Timeslot was cancelled for patient ${patientId}`;
      console.log(successMessage);
      return {
        timeslotJSON: JSON.stringify(updated),
        code: "200",
        message: successMessage,
      };
    } catch (error) {
      const errorMessage = `Error cancelling timeslot for patient ${patientId}: ${error.message}`;
      console.error(errorMessage);
      return {
        timeslotJSON: JSON.stringify(timeslot),
        code: "500",
        message: errorMessage,
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
