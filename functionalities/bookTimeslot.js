import Timeslot from "../models/timeslot.js";

async function bookTimeslot(timeslot_id, patientId) {
  const timeslot = await Timeslot.findById(timeslot_id);
  
  if (timeslot && !timeslot.timeslotPatient) {

    //Timeslot has been found and is available.
    
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
  } 
  else if (
    timeslot &&
    timeslot.timeslotPatient &&
    timeslot.timeslotPatient.toString() === patientId
  ) {
    // Timeslot has been found, but is booked. The patient who booked it is the patient trying to book it again.

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

    // Timeslot has been found, but is booked. The patient who booked it isn't the patient trying to book it now

    const errorMessage = `Error booking timeslot for patient ${patientId}. Timeslot was already booked by another patient before.`;
    console.error(errorMessage);
    return {
      timeslotJSON: JSON.stringify(timeslot),
      code: "403",
      message: errorMessage,
    };
  } else {
    // Timeslot has not been found.

    const errorMessage = `Timeslot was not found in the database`;
    console.error(errorMessage);
    return { timeslotJSON: {}, code: "404", message: errorMessage };
  }
}

export default bookTimeslot;
