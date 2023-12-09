/**
 * Basic ping/echo monitor for the dentago system
 */

// TODO: Maybe make a simple graphic interface, just boxes and text
// Dependencies
const mqtt = require('mqtt');

// MQTT
// TODO: define QOS here
// TODO: These topics could be defined as just the service instead of the whole thing
const PUB_MQTT_TOPICS = {
    monitorBooking: 'dentago/monitor/booking/ping',
    monitorDentagoAPI: 'dentago/monitor/dentago/ping',
    monitorDentistAPI: 'dentago/monitor/dentist/ping',
    monitorAvailability: 'dentago/monitor/availability/ping',
}

const SUB_MQTT_TOPIC = 'dentago/monitor/+/echo';
const SUB_MQTT_TOPIC_2 = 'dentago/availability/#'

const MQTT_OPTIONS = {
    // Placeholder to add options in the future
    keepalive: 0
}

const HEARTBEAT_INTERVAL = 1000; // 1 second
const LOAD_CHECK_MINUTE = 10000; // 60 seconds
const LOAD_CHECK_SECOND = 1000; // 1 seconds
const QUEUE_MAX_LENGTH = Math.round(LOAD_CHECK_MINUTE / 1000);

let isServiceOnline = {};
let requestsForAvailabilityPerSecond = 0;
let requestsForAvailabilityPerMinute = 0;

let availabilityQueue = [];

// Ping to each service
function sendHeartbeat() {
    Object.values(PUB_MQTT_TOPICS).forEach(topic => {
        client.publish(topic, `pinging ${topic} :)`);
    });
    console.log('\n');
}

function updateQueue(queue) {

    // TODO: this is wrong
    const extraItems = Math.max(queue.length - QUEUE_MAX_LENGTH, 0);

    queue.splice(0, extraItems);
    // Define array
    // When length greater than 60 --> shifty();
    // Or only update the queue once every X seconds and at that point we split() the array and remove all the 
}

// Repeat every HEARTBEAT_INTERVAL
function checkServiceStatus() {
    setTimeout(() => {
        Object.values(PUB_MQTT_TOPICS).forEach(topic => {
            // Since we want to extract the service name from the topic dentago/service/monitor/ping
            // We can topic.split('/')[1] which will always gives us 'service'
            const service = topic.split('/')[2];
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

    client.subscribe(SUB_MQTT_TOPIC_2, (err) => {
        if (err) console.log('MQTT connection error: ' + err);
    });

    // Initialize isServiceOnline object
    Object.values(PUB_MQTT_TOPICS).forEach(topic => {
        isServiceOnline[topic] = false;
    });

    sendHeartbeat();
    checkServiceStatus();
    checkLoadPerSecond();
    checkLoadPerMinute();
});

client.on('message', (topic, payload) => {

    if (topic.startsWith('dentago/monitor')) {
        // TODO: define as a constant
        console.log('monitor');
        const service = topic.split('/')[2]; // Same thing as explained before
        isServiceOnline[service] = true;
    }
    else {
        console.log(topic);
        // topic: dentago/+service/#
        const service = topic.split('/')[1];
        // TODO: do a switch case like with the other service

        if (service === 'availability') {
            requestsForAvailabilityPerSecond += 1;
        }
    }
});

client.on('error', (err) => {
    console.error(err);
    process.exit(1);
});
