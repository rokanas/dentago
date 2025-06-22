import bookTimeslot from "./functionalities/bookTimeslot.js";
import cancelTimeslot from "./functionalities/cancelTimeslot.js";
import createTimeslot from "./functionalities/createTimeslot.js";
import createPatient from "./functionalities/createPatient.js";
import { connectDatabase } from "./util.js/database.js";
//import mqttInit from "./util.js/mqtt.js";
import { publish } from "./util.js/mqtt.js";

//await mqttInit();
//await publish();
await connectDatabase();

//await createTimeslot(); // Just because there were none. Will be removed later.
//await createPatient(); // Just because there were none. Will be removed later.
//await bookTimeslot("656642f014684bc6d694d7aa", "65660acd52d3208340929920");
//await cancelTimeslot("656642f014684bc6d694d7aa", "65660acd52d3208340929920");
