const fs = require('fs');           // import node file system module (fs)
const LogCollection = require('./logCollection');

const SERVICES = ['availability', 'booking', 'authentication', 'dentist'];


// declare file path for saved logs file
const FILE_PATH = 'savedLogs.json'

async function parseMessage(topic, message) {
    try {
        // establish timestamp
        const timeStamp = new Date().toLocaleString();

        // parse message to String
        const parsedMessage = JSON.parse(message);

        // call function to extract service type from topic name
        const service = await parseService(topic);

        // call function to determine direction of MQTT message
        const direction = await parseDirection(parsedMessage);

        // call function to extract status info from message
        const status = JSON.stringify(parsedMessage.status)

        // call function to extract request Id of MQTT message
        const reqId = await parseReqId(parsedMessage, topic, service, direction)

        // create logo object
        const log = {
            timeStamp: timeStamp,
            topic: topic,
            service: service,
            direction: direction,
            status: status,
            reqId: reqId,
        };

        // call function to record log in JSON file
        await logMessage(log);

        // call function to incrememnt statistics counter (future feature)
        // await incrementCounter();

    } catch(err) {
        console.log('Error parsing message: ' + err.message);
    }
};

// record log by writing it a log object array in a JSON file 
async function logMessage(log) {
    try {
        // convert JS log object into JSON object
        const jsonLog = JSON.stringify(log, null, 2); // arguments null and 2 are formatting for readability

        // read contents of JSON file containing stored logs
        const logFile = fs.readFileSync(FILE_PATH, 'utf-8');
        
        // check if JSON log file is empty
        if (logFile === '') {
            // if empty, start the array and record the first log
            fs.writeFile(FILE_PATH, '[' + jsonLog, (err) => {
                if (err) {
                    console.log('Error writing log.');
                } else {
                    console.log('Log written successfully.');
                    fileIsEmpty = false;
                }
            });

        } else {
            // if not file not empty, record newline and the log
            fs.appendFile(FILE_PATH, ',\n' + jsonLog, (err) => {
                if (err) {
                    console.log('Error writing log.');
                } else {
                    console.log('Log written successfully.');
                }
            });
        }

    } catch(err) {
        console.log('Error logging message: ' + err.message)
    }
};

// save array of stored logs in JSON object to database
async function saveLogs() {
    // Read the JSON file
    const readLogs = fs.readFileSync(FILE_PATH, 'utf-8') + ']';

    try {
        // parse the logs in the JSON file to JSON object
        const logs = JSON.parse(readLogs);

        // create timestamp with time of first log in the log collection to the time of last log
        timeStamp = `${logs[0].timeStamp} - ${logs[logs.length - 1].timeStamp}`;

        // create a mongo logCollection resource using timeStamp and logCollection object
        const logCollection = new LogCollection({ timeStamp: timeStamp, logCollection: logs });

        // save logCollection to mongodb
        await logCollection.save();
        
        // clear the JSON file for next round of recording
        fs.writeFileSync(FILE_PATH, '');
        console.log('Logs successuflly saved to database.')

    } catch(err) {
        console.log('No logs saved.');
    }
};

async function incrementCounter() {
    // future feature
    // add logic
}

// extract service type from topic name
async function parseService(topic) {
    try {
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

    } catch(err) {
        console.log('Error parsing service: ' + err.message)
    }
}

// determine direction of MQTT message (relative to the service component_)
async function parseDirection(message) {
    // declare variable to store message direction
    let direction = "";

    // if message contains a request ID in the payload body, it is incoming 
    direction = message.hasOwnProperty('reqId') ? "incoming" : "outgoing";
    
    return direction;
}

// extract request ID from message or topic
async function parseReqId(message, topic, service, direction) {
    try {
        let reqId;
        // if direction is incoming, request ID can be found in the payload body
        if(direction === 'incoming') {
            reqId = message.reqId
        // if direction is outgoing, request ID can be found in the topic name
        } else if (direction === 'outgoing') {
            // divide the topic into an array of words and isolate the suffix
            const topicParts = topic.split('/');
            // if service is booking, request ID will be the 3rd part
            if(service === 'booking') {
                reqId = topicParts[2];
            } else {
                // for all other services, it will be at the end of the topic
                reqId = topicParts[topicParts.length - 1];
            }
        }

        return reqId;

    } catch(err) {
        console.log('Error parsing request ID: ' + err.message)
    }
}

// export the router
module.exports = {
    parseMessage,
    saveLogs
};