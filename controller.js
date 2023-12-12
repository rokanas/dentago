const fs = require('fs');           // import node file system module (fs)
const LogCollection = require('./log');

const SERVICES = ['availability', 'booking', 'authentication', 'creation', 'assignment'];


// declare file path for saved logs file
const FILE_PATH = 'savedLogs.json'
let fileIsEmpty = true;

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
    // establish timestamp
    const timeStamp = new Date().toLocaleString();

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
        timeStamp: timeStamp,
        topic: topic,
        service: service,
        direction: direction,
        status: status,
        reqId: reqId,
    };

    console.log(log);
    await logMessage(log);
    await incrementCounter();
    
};

async function logMessage(log) {
    // convert JS object into JSON object
    const jsonLog = JSON.stringify(log, null, 2); // arguments null and 2 are formatting for readability

    const logFile = fs.readFileSync(FILE_PATH, 'utf-8');
    
    // Check if the file is empty
    if (logFile === '') {
        fs.writeFile(FILE_PATH, '[' + jsonLog, (err) => {
            if (err) {
                console.log('Error writing log.');
            } else {
                console.log('Log written successfully.');
                fileIsEmpty = false;
            }
        });

    } else {
        fs.appendFile(FILE_PATH, ',\n' + jsonLog, (err) => {
            if (err) {
                console.log('Error writing log.');
            } else {
                console.log('Log written successfully.');
            }
        });
    }
};

async function saveLogs() {
        
    let logs;

    // Read the JSON file
    const readLogs = fs.readFileSync(FILE_PATH, 'utf-8') + ']';

    try {
        logs = JSON.parse(readLogs);

        timeStamp = `${logs[0].timeStamp} - ${logs[logs.length - 1].timeStamp}`;

        const logCollection = new LogCollection({ timeStamp: timeStamp, logCollection: logs });
        console.log(logCollection)
        //await logCollection.save();

        fs.writeFileSync(FILE_PATH, '');

    } catch(err) {
        console.log('No logs saved: ' + err.message);
    }
};

async function incrementCounter() {
    // add logic
}

// export the router
module.exports = {
    parseMessage,
    saveLogs
};