const mqtt = require('mqtt');
const messageManager = require('./utils/messageManager.js');
const notificationController = require('./controllers/notificationController');
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
const publish = (topic, payload) => {
    client.publish(topic, payload);
};

// subscribe to notification topic
function subscribeNotifications(topic) {
    client.subscribe(topic, (err) => {
        if (!err) {
            console.log(`Subscribed to topic: ${topic}`);
        } else {
            console.error('Subscription to topic failed', err);
        }
    });
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
};

// event handler for receiving messages
client.on('message', (topic, message) => {
    console.log(`Received message on topic ${topic}: ${message.toString()}`);

    // parse MQTT message to JSON
    const parsedMessage = JSON.parse(message);

    // divide the topic into an array of words
    const topicParts = topic.split('/');

    // check if the message received is a notification
    if(topicParts.includes('notifications')) {
              
        // if so, call the function to process it
        notificationController.handleNotification(topic, parsedMessage);

    // if incoming mesage is not a notification or ping/echo
    } else {
        // check if message received is a successful booking cancellation
        if (topicParts.includes('booking') && parsedMessage.instruction === 'CANCEL' && topicParts.includes('SUCCESS')) {
            // if so, call function to notify interested patients of newly available timeslot
            notificationController.generateRecNotification(JSON.parse(parsedMessage.timeslotJSON), parsedMessage.status.message);
        }

        // declare variable to store reqId
        let reqId;

        // for the booking service, reqId will be the third element in the topic
        if(topicParts.includes('booking')) {
            reqId = topicParts[2];
        } else {
            // for all other services, it will be at the end of the topic
            reqId = topicParts[topicParts.length - 1];
        }

        // trigger on message event and pass message to listeners using reqId
        messageManager.fireEvent(reqId, parsedMessage);
    }
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
    subscribe,
    unsubscribe,
    subscribeNotifications 
};