import mqtt from "mqtt";
import bookTimeslot from "../functionalities/bookTimeslot.js";
import cancelTimeslot from "../functionalities/cancelTimeslot.js";

const brokerUrl = "mqtt://test.mosquitto.org";
const subscribeTopic = "dentago/booking/";
const publishTopic = "dentago/booking";

const options = {
  clientId: "OopsPulledWrongTooth",
  clean: true,
};

const client = mqtt.connect(brokerUrl, options);

const mqttInit = async () => {
  client.on("connect", () => {
    console.log(`Connected to the MQTT broker: ${brokerUrl}`);
    client.subscribe(subscribeTopic, (err) => {
      if (err) {
        console.error(`Error subscribing to: ${subscribeTopic}`, err);
      }
    });

    console.log(`Publishing message to ${publishTopic}`);
  });

  client.on("message", async (topic, message) => {
    if (topic === subscribeTopic) {
      const payload = message.toString(); // should have these properties: instruction, slotID, patientID, reqID.
      const { instruction, slotID, patientID, reqID, clinicID } = JSON.parse(payload);

      let timeslot;
      if (instruction === "BOOK") {
        timeslot = await bookTimeslot(slotID, patientID);
      } else if (instruction === "CANCEL") {
        timeslot = await cancelTimeslot(slotID, patientID);
      }

      let response;
      if (timeslot) {
        response = "SUCCESS";
      } else {
        response = "FAILURE";
      }

      client.publish(`${publishTopic}/${reqID}/${clinicID}/${response}`, timeslot);
    }
  });
};

export default mqttInit;
