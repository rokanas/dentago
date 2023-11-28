import mqtt from "mqtt";

const brokerUrl = "mqtt://test.mosquitto.org";
const subscribeTopic = "hearingTeeth";
const publishTopic = "hearingTeeth"; // yellingTeeth

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
    client.publish(publishTopic, `Now subscribing to ${publishTopic}`);
  });

  client.on("message", (topic, message) => {
    if (topic === subscribeTopic) {
      console.log("Received following message:", message.toString());
    }
  });
};

export default mqttInit;
