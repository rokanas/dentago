const mqtt = require('mqtt');
const Patient = require('./models/patient');
const Notification = require('./models/notification');

require('dotenv').config();

/*====================  MQTT SETUP  ==================== */

const broker = process.env.MOSQUITTO_URI || process.env.CI_MOSQUITTO_URI;

// connect to the MQTT broker
const client = mqtt.connect(broker);

// notification topic
const notificationTopic = 'dentago/notifications/+';
const subNotificationRegex = /^dentago\/notifications\/.+$/; // Regex to double check, this is explained later

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

// TODO: Review this
client.subscribe(notificationTopic, (err) => {
    if (err) console.log('MQTT connection error: ' + err);
});

client.on('message', (topic, payload) => {

    /**
     * QUESTION???
     * Will this method listen to topics subscribed using the subscribe() method?
     * If that is the case, I'm using regex to check that the topic is correct
     * Otherwise, this is redundant and it can be removed.
     * TODO: Test this
     */

    const match = topic.match(subNotificationRegex);
    if (match) {
        handleNotification(topic, payload);
    }
});

async function handleNotification(topic, payload) {
    try {
        // topic: dentago/notifications/userId -> topic.split('/)[2] = userId
        let patientId = topic.split('/')[2];

        // Create notification
        const userNotification = new Notification(JSON.parse(payload));
        userNotification.save();

        // Find patient
        const patient = await Patient.findOne({ id: patientId }).exec();

        // Update data
        patient.notifications.push(userNotification);
        const result = await patient.save();

        // console.log(result);

    } catch (error) {
        console.log(error);
    }
}

// publish a message to the MQTT broker
const publish = (topic, payload) => {
    client.publish(topic, payload);
};

// subscribe to a topic and return the message in the form of a Promise
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

        // subscribe to the message event
        client.on('message', (receivedTopic, message) => {
            console.log(`Received message on topic ${topic}: ${message.toString()}`);

            // unsubscribe from the topic after receiving the message
            unsubscribe(topic);

            // resolve the Promise with the received message
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