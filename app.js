/**
 * The Availability Service is a Node.js application designed for the Dentago distributed system. 
 */

//TODO: refactor and modularise the functionality into multiple components

const mqtt = require('mqtt');

// TODO: implement DB connection

// TODO: change to the non-public mosquitto broker once implemented
const broker = 'mqtt://test.mosquitto.org/:1883';
const topic = 'dentago/availability/'

const client = mqtt.connect(broker);


client.on('connect', () => {
    console.log("Connected to MQTT broker");

    client.subscribe(topic, (error) => {
        if (!error) {
            console.log("Subscribed to messages on: " + topic);
            client.publish(topic);
        }
    });
});

/**
 * Handle incoming messages asynchronously
 */
client.on('message', async (topic, message) => {
    try {
        const payload = JSON.parse(message);
        const reqID = payload.reqID;

        // TODO: actually fetch data from MongoDB
        const result = await FETCHDATAFROMDBMETHOD();

        console.log(result);
        // Append recipient address to the service topic
        const responseTopic = topic + reqID;
        client.publish(responseTopic, result);
    } catch (error) {
        console.log("Error when processing MQTT message: ", error);
    }
});

/**
 * Handle errors
 */
client.on('error', (error) => {
    console.error('MQTT connection error: ', error);
});

/**
 * Handle unexpected disconnections
 */
client.on('close', () => {
    console.log('\nClient disconnected from MQTT broker');
});

/**
 * Handle reconnection to broker
 */
client.on('reconnect', () => {
    console.log('Reconnected to MQTT broker');
}); 

/**
 * Handle application shutdown 
 * SIGINT is the signal sent when terminating the process by pressing 'ctrl + C'
 */
// TODO: Can we remove the "Terminate batch job y/n?" prompt?
process.on('SIGINT', () => {
    console.log('Closing MQTT connection...');
    client.end({ reasonCode: 0x00 }, () => {
        console.log('MQTT connection closed');
        process.exit(0);
    });
});
