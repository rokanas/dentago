const mqtt = require('mqtt');

/*====================  MQTT SETUP  ==================== */

const broker = 'mqtt://127.0.0.1:1883'; // TODO: change to hosted mosquitto address

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
  


function subscribe(topic) {
    return new Promise((resolve, reject) => {
        client.subscribe(topic, (err) => {
            if (!err) {
                console.log(`Subscribed to topic: ${topic}`);
            } else {
                console.error('Subscription to topic failed', err);
                reject(err);
            }
        });
              
        // Subscribe to the message event
        client.on('message', (receivedTopic, message) => {
            console.log(`Received message on topic ${topic}: ${message.toString()}`);
            
            // Unsubscribe from the topic after receiving the message
            unsubscribe(topic);
           
            // Resolve the Promise with the received message
            resolve(message.toString());
            
        });
    });
}

// unsubscribe from a topic
const unsubscribe = (topic) => {
    client.unsubscribe(topic, function (err) {
        if (!err) {
            console.log(`Unsubscribed from topic: ${topic}`)
        } else {
            console.log(err)
        }
    });
};


module.exports = {
    publish,
    subscribe,
    unsubscribe
  };