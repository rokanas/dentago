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

const HEARTBEAT_INTERVAL = 5000; // 5 seconds

let isServiceOnline = {};

function sendHeartbeat() {
    Object.values(PUB_MQTT_TOPICS).forEach(topic => {
        client.publish(topic, `pinging ${topic} :)`);
    });
    console.log('\n');
}

function checkServiceStatus() {
    setTimeout(() => {
        Object.values(PUB_MQTT_TOPICS).forEach(topic => {
            const service = topic.split('/')[1];
            if (!isServiceOnline[service]) {
                console.log(`Service for ${service} is offline :(`);
            }
            else {
                console.log(`Service for ${service} is online :)`);
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

    sendHeartbeat();
    checkServiceStatus();
});

client.on('message', (topic, payload) => {
    // console.log(topic);
    const service = topic.split('/')[1]; // Even if it is hardcoded, we can be sure that this is always the case
    isServiceOnline[service] = true;
    // console.log(isServiceOnline);
});

client.on('error', (err) => {
    console.error(err);
    process.exit(1);
});
