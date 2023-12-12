import Timeslot from "../models/timeslot.js";
import CircuitBreaker from "opossum";

// Options for the circuit breaker
const options = {
  timeout: 3000, // If the function takes longer than 3 seconds, trigger a failure
  errorThresholdPercentage: 50, // If 50% of requests fail, open the circuit
  resetTimeout: 10000, // After 10 seconds, try to reset the circuit
};

const breaker = new CircuitBreaker(bookTimeslot2, options);

// This event listens for when the breaker opens
breaker.on("open", () => console.log("Circuit breaker opened"));
// This event listens for when the breaker closes
breaker.on("close", () => console.log("Circuit breaker closed"));
// This event listens for when the breaker is half open
breaker.on("halfOpen", () => console.log("Circuit breaker is half-open"));

async function bookTimeslot(timeslotId, patientId) {
  // To book an appointment, invoking the circuit breaker instead of the function directly
  return await breaker
    .fire(timeslotId, patientId)
    .then((result) => {
      console.log("Result:", result);
      return result;
    })
    .catch((error) => {
      console.error("Booking failure:", error);
      //todo Implement fallback strategy (queue request or inform the user to try again later) //////////////////////////////////////////////////////////////////////////
    });
}

async function bookTimeslot2(timeslotId, patientId) {
  throw new Error("BLOoDY FK");
  const timeslot = await Timeslot.findById(timeslotId);
  // const timeslot = await Timeslot.findOne({ _id: timeslotId }).exec(); // alternate snippet, will keep for now

  if (timeslot && !timeslot.patient) {
    //Timeslot has been found and is available.

    try {
      // Attempt to update the timeslot with the correct version
      const updated = await Timeslot.findOneAndUpdate(
        { _id: timeslotId, __v: timeslot.__v }, // Includes version in the query for optimistic concurrency control
        { patient: patientId, $inc: { __v: 1 } }, // Atomically increments the version
        { new: true } // newly updated timeslot is returned
      );

      if (!updated) {
        // Timeslot has already moved on version, meaning other operations were performed in this resource
        const errorMessage = `Error booking timeslot for patient ${patientId}. Timeslot update was modified concurrently.`;
        console.error(errorMessage);
        return {
          timeslotJSON: JSON.stringify(timeslot),
          code: "409", //request conflict with the current state of the target resource.
          message: errorMessage,
        };
      }

      // If update successful, send a success message
      const successMessage = `Timeslot was booked for patient ${patientId}`;
      console.log(successMessage);
      return {
        timeslotJSON: JSON.stringify(updated),
        code: "200",
        message: successMessage,
      };
    } catch (error) {
      const errorMessage = `Error booking timeslot for patient ${patientId}: ${error.message}`;
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
    timeslot.patient.toString() === patientId
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
    timeslot.patient &&
    timeslot.patient.toString() !== patientId
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
