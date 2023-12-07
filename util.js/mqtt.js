import mqtt from "mqtt";
import bookTimeslot from "../functionalities/bookTimeslot.js";
import cancelTimeslot from "../functionalities/cancelTimeslot.js";

const brokerUrl = "mqtt://test.mosquitto.org";
const subscribeTopic = "dentago/booking/";
const publishTopic = "dentago/booking/";

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
  });

  client.on("message", async (topic, mqttMessage) => {
    if (topic === subscribeTopic) {
      const payload = mqttMessage.toString();

      const { instruction, slotId, clinicId, patientId, reqId } = JSON.parse(payload);

      let operation;
      if (instruction === "BOOK") {
        operation = await bookTimeslot(slotId, patientId);
      } else if (instruction === "CANCEL") {
        operation = await cancelTimeslot(slotId, patientId);
      }

      let { timeslot, code, message } = operation;

      let response;
      code === "200" ? (response = "SUCCESS") : (response = "FAILURE");

      const status = { code, message };

      const customRequestTopic = `${reqId}/${clinicId}/${response}`;
      client.publish(
        `${publishTopic}${customRequestTopic}`,
        JSON.stringify({ timeslot, instruction, status })
      );
      console.log(`Published message to ${publishTopic}${customRequestTopic}`);
    }
  });
};

export default mqttInit;

//instruction ==="ERROR_OVERBOOK";
