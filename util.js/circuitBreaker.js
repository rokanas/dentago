import CircuitBreaker from "opossum";
import { connectDatabase, disconnectDatabase } from "../util.js/database.js";

import bookTimeslot from "../functionalities/bookTimeslot.js";
import cancelTimeslot from "../functionalities/cancelTimeslot.js";

const defaultOptions = {
  timeout: 5000, //if the function takes longer than 5 seconds, trigger a failure
  errorThresholdPercentage: 50, //if over 50% of requests fail, open the circuit
  resetTimeout: 30000, //try again after 30 seconds
};

function changeTimeslot(task, ...args) {
  return task(...args);
}

export async function fireBook(timeslotId, patientId) {
  await test();

  return await breaker
    .fire(bookTimeslot, timeslotId, patientId)
    .then((result) => {
      //console.log("Result fireBook:", result);
      return result;
    })
    .catch((error) => {
      console.error("Booking failure:", error);
    });
}

export async function fireCancel(timeslotId, patientId) {
  await test();

  return await breaker
    .fire(cancelTimeslot, timeslotId, patientId)
    .then((result) => {
      //console.log("Result fireCancel:", result);
      return result;
    })
    .catch((error) => {
      console.error("Cancelling failure:", error);
      return;
      //todo Implement fallback strategy (queue request or inform the user to try again later)
    });
}

// Create a circuit breaker for the generic function.
const breaker = createCircuitBreaker(changeTimeslot);

function createCircuitBreaker(action, options = defaultOptions) {
  const breaker = new CircuitBreaker(
    changeTimeslot,
    (options = defaultOptions)
  );

  breaker.fallback(() =>
    console.log("<fallback callback function - to be implemented>")
  );

  breaker.on("open", () =>
    console.log("Circuit breaker opened (rejecting requests).")
  );

  breaker.on("close", () =>
    console.log("Circuit breaker closed (accepting requests).")
  );

  breaker.on("halfOpen", () =>
    console.log("Circuit breaker is half-open (accepting one trial request).")
  );

  return breaker;
}

let firstTime = true;

async function test() {
  // mongoose.connection.readyState
  if (firstTime) {
    firstTime = false;
    setTimeout(() => {
      console.log("Attempting to disconnect to database on purpose..");
      disconnectDatabase();
    }, 5000);
    setTimeout(() => {
      console.log("Attempting to reconnect to database on purpose.");
      connectDatabase();
    }, 20000);
  }
}
