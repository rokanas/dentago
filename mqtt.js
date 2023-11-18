const mqtt = require('mqtt');

/*====================  MQTT SETUP  ==================== */

const broker = ''; // TODO: add HiveMQ address

// connect to the MQTT broker
const client = mqtt.connect(broker);

// event handler for successful connection
client.on('connect', () => {
  console.log('Connected to MQTT broker');
});

// event handler for unexpected disconnection
client.on('close', () => {
    console.log('Connection closed unexpectedly');
});
  
// event handler for errors
client.on('error', (err) => {
    console.error('MQTT error:', err);
});
  
// publish a message to the MQTT broker
const publish = (topic, payload) => {
    client.publish(topic, payload);
};
  
// subscribe to topic and handle incoming messages
const subscribe = (topic, callback) => {
    client.subscribe(topic, (err) => {
        if (!err) {
            console.log(`Subscribed to topic: ${topic}`);
        } else {
            console.error('Subscription failed', err);
        }
    }
)};
  
// event handler for received messages
client.on('message', (receivedTopic, message) => {
    if (receivedTopic === topic) {
        console.log(`Received message on topic ${topic}: ${message.toString()}`);
        callback(message.toString());
    }
});

module.exports = {
    publish,
    subscribe,
  };