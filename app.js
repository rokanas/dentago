/**
 * Basic ping/echo monitor for the dentago system.
 * The app publishes messages with the topic dentago/monitor/+service/ping
 * and receives messages with the topic dentago/monitor/+service/echo
 * 
 * It also listens to all the services (dentago/#) to calculate their current load
 */

// TODO: Maybe make a simple graphic interface, just boxes and text
const mqtt = require('mqtt');

// MQTT Components
const SERVICES = [
    'booking',
    'dentago', // TODO: Maybe the dentago-api needs a different name
    'dentist',
    'availability'
];

const SUB_MQTT_TOPIC = 'dentago/#';

const formatPubTopic = (service) => `dentago/monitor/${service}/ping`;

// Regex for matching dentago/monitor/+service/echo
// ([^/]+) denotes a capturing group that matches any character but '/'
const subEchoRegex = /^dentago\/monitor\/([^/]+)\/echo$/;

const MQTT_OPTIONS = {
    // Placeholder to add options in the future
    keepalive: 0
}

const HEARTBEAT_INTERVAL = 1000; // 1 second
const LOAD_CHECK_MINUTE = 10000; // 60 seconds
const LOAD_CHECK_SECOND = 1000; // 1 seconds
const QUEUE_MAX_LENGTH = Math.round(LOAD_CHECK_MINUTE / 1000);

// Services' Data
let isServiceOnline = {};
let requestsForAvailabilityPerSecond = 0;
let requestsForAvailabilityPerMinute = 0;

let availabilityQueue = [];

// Ping to each service
function sendHeartbeat() {
    SERVICES.forEach(service => {
        const topic = formatPubTopic(service);
        client.publish(topic, `pinging ${topic} :)`);
    });
    console.log('\n');
}

function updateQueue(queue) {

    const extraItems = Math.max(queue.length - QUEUE_MAX_LENGTH, 0);

    queue.splice(0, extraItems);
    // Define array
    // When length greater than 60 --> shifty();
    // Or only update the queue once every X seconds and at that point we split() the array and remove all the 
}

// Repeat every HEARTBEAT_INTERVAL
function checkServiceStatus() {
    setTimeout(() => {
        SERVICES.forEach(service => {
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

// Repeat every LOAD_CHECK_SECOND
function checkLoadPerSecond() {
    setTimeout(() => {

        /**
         * Listen to all the requests for all the services in 1 second
         */

        console.log(`Massive load in availability service ${requestsForAvailabilityPerSecond}`);
        // push the load to the queue
        availabilityQueue.push(requestsForAvailabilityPerSecond);

        // Reset requests for all services
        requestsForAvailabilityPerSecond = 0;


        checkLoadPerSecond();
    }, LOAD_CHECK_SECOND);
}

function checkLoadPerMinute() {
    setTimeout(() => {
        updateQueue(availabilityQueue);
        let sum = availabilityQueue.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        console.log(`QUEUE: ${availabilityQueue}`);
        console.log(`SUM: ${sum}`);
        console.log(`Load in the availability service during the last minute ${requestsForAvailabilityPerMinute}`);
        checkLoadPerMinute();
    }, LOAD_CHECK_MINUTE);
}

const client = mqtt.connect('mqtt://test.mosquitto.org', MQTT_OPTIONS);

client.on('connect', () => {
    console.log('MQTT successfully connected!');

    // Subscribe to topic 'dentago/+/monitor/echo'
    client.subscribe(SUB_MQTT_TOPIC, (err) => {
        if (err) console.log('MQTT connection error: ' + err);
    });

    // Initialize isServiceOnline object
    SERVICES.forEach(service => {
        isServiceOnline[service] = false;
    });

    sendHeartbeat();
    checkServiceStatus();
    checkLoadPerSecond();
    checkLoadPerMinute();
});

client.on('message', (topic, _) => {

    const match = topic.match(subEchoRegex);

    // If the topic matches dentago/monitoring/+service/echo
    if (match) {
        const service = match[1]; // Get the capturing group
        isServiceOnline[service] = true;
    }
    else {
        const service = topic.split('/')[1]; // dentago/+service/#

        // If the topic matches one of the services
        if (SERVICES.includes(service)) {
            console.log(service);
            switch (service) {
                case 'availability':
                    requestsForAvailabilityPerSecond += 1;
                    break;

                default:
                    break;
            }
        }

    }
});

client.on('error', (err) => {
    console.error(err);
    process.exit(1);
});
