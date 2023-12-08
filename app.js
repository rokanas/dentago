/**
 * Basic ping/echo monitor for the dentago system
 */

// Dependencies
const mqtt = require('mqtt');

// MQTT
// TODO: define QOS here
const PUB_MQTT_TOPICS = {
    monitorBooking: 'dentago/booking/monitor/ping',
    monitorDentagoAPI: 'dentago/dentago/monitor/ping',
    monitorDentistAPI: 'dentago/dentist/monitor/ping',
    monitorAvailability: 'dentago/availability/monitor/ping',
}

const SUB_MQTT_TOPIC = 'dentago/+/monitor/echo';

const MQTT_OPTIONS = {
    // Placeholder to add options in the future
    keepalive: 0
}

const HEARTBEAT_INTERVAL = 1000; // 1 second

let isServiceOnline = {};

// Ping to each service
function sendHeartbeat() {
    Object.values(PUB_MQTT_TOPICS).forEach(topic => {
        client.publish(topic, `pinging ${topic} :)`);
    });
    console.log('\n');
}

// Repeat every HEARTBEAT_INTERVAL
function checkServiceStatus() {
    setTimeout(() => {
        Object.values(PUB_MQTT_TOPICS).forEach(topic => {
            // Since we want to extract the service name from the topic dentago/service/monitor/ping
            // We can topic.split('/')[1] which will always gives us 'service'
            const service = topic.split('/')[1];
            if (!isServiceOnline[service]) {
                console.log(`Service for ${service} is offline 🤡`);
            }
            else {
                console.log(`Service for ${service} is online 😎`);
            }
            isServiceOnline[service] = false;
        });

        sendHeartbeat();
        checkServiceStatus();
    }, HEARTBEAT_INTERVAL);
}

const client = mqtt.connect('mqtt://test.mosquitto.org', MQTT_OPTIONS);

client.on('connect', () => {
    console.log('MQTT successfully connected!');

    // Subscribe to topic 'dentago/+/monitor/echo'
    client.subscribe(SUB_MQTT_TOPIC, (err) => {
        if (err) console.log('MQTT connection error: ' + err);
    });

    // Initialize isServiceOnline object
    Object.values(PUB_MQTT_TOPICS).forEach(topic => {
        isServiceOnline[topic] = false;
    });

    sendHeartbeat();
    checkServiceStatus();
});

client.on('message', (topic, payload) => {
    const service = topic.split('/')[1]; // Same thing as explained before
    isServiceOnline[service] = true;
});

client.on('error', (err) => {
    console.error(err);
    process.exit(1);
});
