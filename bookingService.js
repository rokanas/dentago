import bookTimeslot from "./functionalities/bookTimeslot.js";
import cancelTimeslot from "./functionalities/cancelTimeslot.js";
import createTimeslot from "./functionalities/createTimeslot.js";
import createPatient from "./functionalities/createPatient.js";
import { connectDatabase } from "./util.js/database.js";
import mqttInit from "./util.js/mqtt.js";

await mqttInit();
await connectDatabase();
