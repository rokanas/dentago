const mqtt = require('mqtt');
const controller = require('./controller');
require('dotenv').config();

/*====================  MQTT SETUP  ==================== */

const broker = process.env.MOSQUITTO_URI || process.env.CI_MOSQUITTO_URI;

// connect to the MQTT broker
const client = mqtt.connect(broker);

// event handler for successful connection
client.on('connect', () => {
  console.log('Connected to MQTT broker');
});

// event handler for successful reconnection
client.on('reconnect', () => {
    console.log('Reconnected to MQTT broker');
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
const publish = async (topic, payload) => {
    client.publish(topic, payload);
};
  
// subscribe to a topic and return the message in the form of a Promise
function subscribe(topic) {
    client.subscribe(topic, (err) => {
        if (!err) {
            console.log(`Subscribed to topic: ${topic}`);
        } else {
            console.error('Subscription to topic failed', err);
        }        
    });
}
              
// event handler for receiving messages
client.on('message', async (topic, message) => {
    // print the received message
    console.log(`Received message on topic ${topic}: ${message.toString()}`);

    // declare payload object and initialize first part of mqtt publishing topic 
    let payload;
    let pubTopic = "dentago/authentication/"
    
    // parse message to String and 
    let parsedMessage = message.toString();
    

    // isolate the topic suffix to extract the request type
    const topicParts = topic.split('/');
    const reqType = topicParts[topicParts.length - 1];
    
    // call function corresponding to request type (register, login, logout or refresh)
    switch (reqType) {
        case 'register':
            payload = await controller.register(parsedMessage);
            break;
        case 'login':
            payload = await controller.login(parsedMessage);
            break;
        case 'logout':
            payload = await controller.logout(parsedMessage);
            break;
        case 'refresh':
            payload = await controller.refersh(parsedMessage);
    };

    // append request id to the publishing topic
    pubTopic += reqType + "/" + JSON.parse(payload).reqId;

    // publish to patient API via mqtt broker
    await publish(pubTopic, payload);
});


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

// close connection to MQTT broker gracefully when app is manually terminated
process.on('SIGINT', () => {
    console.log('Closing MQTT connection...');
    client.end({ reasonCode: 0x00 }, () => {
      console.log('MQTT connection closed');
      process.exit();
    });
  });


module.exports = {
    publish,
    subscribe
};