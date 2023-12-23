const mqtt = require('mqtt');
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
    return new Promise((resolve, reject) => {
        client.subscribe(topic, (err) => {
            if (!err) {
                console.log(`Subscribed to topic: ${topic}`);
            } else {
                console.error('Subscription to topic failed', err);
                reject(err);
            }
        });

        // event handler for receiving mqtt messages
        client.on('message', (receivedTopic, message) => {
            
            console.log(`Received message on topic ${receivedTopic}: ${message.toString()}`);

            // parse MQTT message to JSON
            const parsedMessage = JSON.parse(message);

            // divide the topic into an array of words
            const topicParts = receivedTopic.split('/');

            // check if the message received is a notification
            if(topicParts.includes('notifications')) {
                
                // if so, call the function to process it
                notificationController.handleNotification(receivedTopic, parsedMessage);
                resolve();

            // if incoming mesage is not a notificatino or ping/echo
            } else {
                // check if message received is a successful booking cancellation
                // TODO: Make this work with cancellation from dentist as well
                if (topicParts.includes('booking') && parsedMessage.instruction === 'CANCEL' && topicParts.includes('SUCCESS')) {
                    // if so, call function to notify interested patients of newly available timeslot
                    notificationController.generateRecNotification(JSON.parse(parsedMessage.timeslotJSON));
                }

                // unsubscribe from the topic after receiving the message
                unsubscribe(topic);
                    
                // resolve the Promise with the received message
                resolve(parsedMessage);
            }
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
    subscribe,
    subscribeNotifications 
};