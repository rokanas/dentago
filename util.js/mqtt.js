import mqtt from "mqtt";
import "dotenv/config";

import bookTimeslot from "../functionalities/bookTimeslot.js";
import cancelTimeslot from "../functionalities/cancelTimeslot.js";

if (process.argv.length > 2) {
  process.env.MQTT_CLIENT_ID = process.argv[2];
}

const clientId = process.env.MQTT_CLIENT_ID;

const brokerUrl = process.env.MOSQUITTO_URI || process.env.CI_MOSQUITTO_URI;
const options = {
  clientId,
  clean: true, //changed to false
};

const client = mqtt.connect(brokerUrl, options);

const sharedSubscriptionPrefix = "$share/bookers/";
const subscribeTopic = `dentago/booking/`;
const sharedSubscribeTopic = `${sharedSubscriptionPrefix}dentago/booking/`;
const publishTopic = "dentago/booking/";

client.on("connect", () => {
  console.log(`Connected to the MQTT broker: ${brokerUrl}`);
  client.subscribe(sharedSubscribeTopic, (err) => {
    if (err) {
      console.error(`Error subscribing to: ${subscribeTopic}`, err);
    }
  });
});

client.on("reconnect", () => {
  console.log("Reconnected to MQTT broker");
});

client.on("close", (err) => {
  console.error(err);
  console.log("Connection closed unexpectedly");
});

client.on("error", (err) => {
  console.error("MQTT error:", err);
});

client.on("message", async (topic, mqttMessage) => {
  console.log(topic);

  const payload = mqttMessage.toString();

  try {
    JSON.parse(payload);
  } catch (e) {
    console.error(`The incoming message is not processable: ${payload}`);
    return;
  }
  if (topic === subscribeTopic) {
    const payload = mqttMessage.toString();

    const { instruction, slotId, clinicId, patientId, reqId } =
      JSON.parse(payload);

    let operation;
    // The service expects to be instructed with either a "book" or "cancel" operation request.
    // The operation object contains important attributes resulting from this operation ({timeslot, code, message}).
    if (instruction === "BOOK") {
      operation = await bookTimeslot(slotId, patientId);
    } else if (instruction === "CANCEL") {
      operation = await cancelTimeslot(slotId, patientId);
    }
    console.log("Current operation to send back: " + operation)
    let { timeslotJSON, code, message } = operation;

    let response;
    code === "200" ? (response = "SUCCESS") : (response = "FAILURE");

    const status = { code, message };

    const customRequestTopic = `${reqId}/${clinicId}/${response}`;
    client.publish(
      `${publishTopic}${customRequestTopic}`,
      JSON.stringify({ timeslotJSON, instruction, status })
    );
    console.log(`Published message to ${publishTopic}${customRequestTopic}`);
  }
});

export const publish = (topic, payload) => {
  //client.publish(topic, payload);
};

const unsubscribe = (topic) => {
  client.unsubscribe(topic, function (err) {
    if (!err) {
      console.log(`Unsubscribed from topic: ${topic}`);
    } else {
      console.log(err);
    }
  });
};

// close connection to MQTT broker gracefully when app is manually terminated
process.on("SIGINT", () => {
  console.log("Closing MQTT connection on SIGINT event...");
  unsubscribe(sharedSubscribeTopic);
  console.log(`Topic ${sharedSubscribeTopic} unsubscribed`);
  client.end({ reasonCode: 0x00 }, () => {
    console.log("MQTT connection closed");
    process.exit();
  });
});
