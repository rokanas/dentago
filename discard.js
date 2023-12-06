/**
 * Basic ping/echo monitor for the dentago system
 */

// Dependencies
const mqtt = require('mqtt');

// MQTT
// TODO: define QOS here
const MQTT_TOPICS = {
    monitorBooking: 'dentago/monitor/booking',
    monitorDentagoAPI: 'dentago/monitor/dentago',
    monitorDentistAPI: 'dentago/monitor/dentist',
    monitorAvailability: 'dentago/monitor/availability',
}

const PUB_MQTT_TOPICS = {
    monitorBooking: 'dentago/booking/monitor/ping',
    monitorDentagoAPI: 'dentago/dentago/monitor/ping',
    monitorDentistAPI: 'dentago/dentist/monitor/ping',
    monitorAvailability: 'dentago/availability/monitor/ping',
}

const SUB_MQTT_TOPIC = 'dentago/+/monitor/echo'

const MQTT_OPTIONS = {
    // Placeholder to add options in the future
    keepalive: 0
}

const HEARTBEAT_INTERVAL = 10000; // 30 seconds

let isServiceOnline = {};

function sendHeartbeat() {
    Object.values(MQTT_TOPICS).forEach(topic => {
        client.publish(topic, 'pinging :)');
    });
}

function checkServiceStatus() {
    setTimeout(() => {
        Object.values(MQTT_TOPICS).forEach(topic => {
            if (!isServiceOnline[topic]) {
                console.log(`Service for topic ${topic} is offline :(`);
            }
            isServiceOnline[topic] = false;
        });

        sendHeartbeat();
        checkServiceStatus();
    }, HEARTBEAT_INTERVAL);
}

const client = mqtt.connect('mqtt://test.mosquitto.org', MQTT_OPTIONS);

client.on('connect', () => {
    console.log('MQTT successfully connected!');

    let topicList = [];

    Object.values(MQTT_TOPICS).forEach(element => {
        topicList.push(element);
    });

    // Subscribe to topics
    client.subscribe(topicList, (err) => {
        if (err) console.log('MQTT connection error: ' + err);
    });

    sendHeartbeat();
    checkServiceStatus();
});

client.on('message', (topic, payload) => {

    if (payload.toString() === 'response')
    {
        console.log(topic);
        isServiceOnline[topic] = true;
    }
    else {
        switch (topic) {
            case MQTT_TOPICS['monitorBooking']:
                console.log('Monitor Booking :)');
                break;
            case MQTT_TOPICS['monitorDentagoAPI']:
                console.log('Monitor Dentago API :)');
                break;
            case MQTT_TOPICS['monitorDentistAPI']:
                console.log('Monitor Dentist API :)');
                break;
            case MQTT_TOPICS['monitorAvailability']:
                console.log('Monitor Availability :)');
                break;
            default:
                console.log('Different topic :/');
                break;
        }
    }

    console.log("Online: \n");
    console.log(isServiceOnline);
    console.log("\n");
});

client.on('error', (err) => {
    console.error(err);
    process.exit(1);
});
