const Log = require('./log');

const SERVICES = ['availability', 'booking', 'authentication', 'creation', 'assignment'];

// extract service type from topic name
async function parseService(topic) {
    // declare variable to store the service type
    let service = "";

    // divide the topic into an array of words
    const topicParts = topic.split('/');

    // check which service type by iterating through array of words
    for (const part of topicParts) {
        if(SERVICES.includes(part)) {
            service = part;
            break;
        }
    }

    return service
}

// determine direction of MQTT message
async function parseDirection(message) {
    // declare variable to store message direction
    let direction = "";

    // if message contains a status, it is outgoing, otherwise it is incoming
    direction = 'status' in message ? "outgoing" : "incoming";

    return direction;
}

// call function to extract status info from message, if available
async function parseStatus(message, direction) {
    // declare object to store status data
    let status = {
        code: "",
        message: ""
    };

    // if message is outgoing from service to API, it contains status data
    if(direction === 'outgoing') {
        status = message.status;
    }

    return status;
}

async function parseMessage(topic, message) {
    // parse message to String
    const parsedMessage = JSON.parse(message);

    // call function to extract service type from topic name
    const service = await parseService(topic);

    // call function to determine direction of MQTT message
    const direction = await parseDirection(parsedMessage);

    // call function to extract status info from message, if available
    const status = await parseStatus(parsedMessage, direction);

    // extract request Id of MQTT message
    const reqId = parsedMessage.reqId;

    const log = {
        topic: topic,
        service: service,
        direction: direction,
        status: status,
        reqId: reqId
    };

    console.log(log)

};

async function logMessage() {
    // add logic
};

async function incrementCounter() {
    // add logic
}



// export the router
module.exports = {
    parseMessage
};