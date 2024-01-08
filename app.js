/** 
 *  The Dentist CLI tool is used to test and demo the Dentist API functionalities.
 *  This tool can substitute API-integration with the Clinic's/Dentist's own IT-system, in the case that they do not have one.
 * 
 *  ===========================================================================================================================
 * 
 *  DISCLAIMER: For anyone worried about the amount of Promises necessary for the user prompts; you should rejoice in the fact 
 *  that you were not here for indentation hell...
**/

// Used for random ID generation
const crypto = require('crypto');

// Read user input
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Variables
let clinicId = '';      // The Clinic ID correlating with the currently logged in dentist. Fetched after successful login
let userId = '';        // The dentist ID of the currently logged in user. Received after successful login
let clinicMongoId = ''; // Included in the bookingNotification topic

const digitRegex = /^\d+$/;                 // Checks that a String only contains digits (unused)
const dayHourRegex = /^(1?[0-9]|2[0-3])$/;  // Checks that a String contains a number in the span of 0-23
const coordinateRegex = /^[-+]?\d*\.?\d*$/; // Checks if a String starts with a '+' or '-', followed by any amount of digits, then a '.', and any amount of digits

let isLoggedIn = false; // Used to print the correct menu (login/main)

const preLoginReqId = crypto.randomBytes(10).toString('hex'); // Generate random reqId to ensure that only the publishing CLI instance receives the responses
//                                                               After a successful login the Dentist ID is used instead to ensure no collisions

// Login function Promise references
let loginResolve;
let loginReject;

// MQTT stuffs
const mqtt = require('mqtt');
const broker = 'mqtt://test.mosquitto.org/:1883';
const hiveBroker = 'mqtt://broker.hivemq.com/:1883';
const mqttClient = mqtt.connect(broker);

// MQTT topics
MQTT_TOPICS = {
    getTimeslots: 'dentago/dentist/timeslot/',
    createClinic: 'dentago/dentist/creation/clinics/',
    createDentist: 'dentago/dentist/creation/dentists/',
    createTimeslot: 'dentago/dentist/creation/timeslots/',
    assignTimeslot: 'dentago/dentist/assignment/timeslot/',
    bookingNotification: () => { return `dentago/booking/+/${clinicMongoId}/SUCCESS`; }
}

const loginTopic = 'dentago/dentist/login/';
const getClinics = 'dentago/dentist/clinics/';
const preLoginTopics = [loginTopic, getClinics, MQTT_TOPICS.createClinic, MQTT_TOPICS.createDentist].map(topic => { 
    return topic + preLoginReqId; 
});

//============================== TOPIC SUBSCRIBE FUNCTIONS ==============================//

// Unsubscribes from the temporary topics with a temporary ID that are used before successful login 
function unSubscribeToLoginTopics() {
    mqttClient.unsubscribe(preLoginTopics, (error) => {
        if (error) console.log('Error when unsubscribing to topics: ' + error);
    });
}

// Subscribe to all topics using a Dentist ID (after successful login)
function subscribeToMainTopics() {
    // Append the clinicId to all topics and subscribe to each 
    mqttClient.subscribe(Object.values(MQTT_TOPICS).map(topic => { 
        // Do not append clinicId to the "bookingNotification" topic
        return topic !== MQTT_TOPICS.bookingNotification ? topic + userId : topic(); // Treat "bookingNotification" as function (that returns the correct String)
    }), (error, granted) => {
        if(!error) {
            granted.forEach(key => {
                console.log(`Subscribed to messages on: ${key.topic}`);
            });
            displayMainMenu();
        } else {
            console.log('Error when subscribing to topics: ' + error);
        }
    });
}

//================================= PRINT MENU FUNCTIONS =================================//
// Function to display the login menu
function displayLoginMenu() {
    console.log('\n=== Login Menu ===');
    console.log('1. Login Dentist'); 
    console.log('2. Register Dentist');
    console.log('3. Register Clinic');
    console.log('4. Get all Clinics');
    console.log('0. Exit');
    rl.question('Enter your option: ', (input) => {
        handleLoginMenuInput(input);
    });
}

// Function to display the main menu
function displayMainMenu() {
    console.log('\n=== Main Menu ===');
    console.log('1. Add new Dentist to Database'); 
    console.log('2. Add new Timeslot for appointment');
    console.log('3. Get all Timeslots for your Clinic');
    console.log('4. Get all your Timeslots');
    console.log('5. Assign Dentist to existing Timeslot');
    console.log('6. Cancel booked appointment');
    console.log('0. Exit');
    rl.question('Enter your option: ', (input) => {
        handleMenuInput(input);
    });
}


//================================ USER INPUT HANDLERS ================================//

//================ LOGIN MENU HANDLER ====================//
async function handleLoginMenuInput(choice) {
    switch (choice) {
        // Login as Dentist
        case '1':
            try {
                console.log("Please enter your login information");
                const loginInfo = {
                    id: '',
                    password: '',
                    reqId: '',
                    status: {
                        message: ''
                    }
                };
                await login(loginInfo).then(console.log);
                unSubscribeToLoginTopics();
                subscribeToMainTopics();
            } catch (error) {
                console.log(error);
            }
            break;
    
        // Register new Dentist
        case '2':
            try {
                console.log("Please enter your credentials");
                const newDentist = {};
                await promptForDentistInfo(newDentist);
                const statusObject = { message: 'Request to create new Dentist resource in the database' };
                const payload = { dentist: newDentist, reqId: preLoginReqId, status: statusObject };
                mqttClient.publish(MQTT_TOPICS.createDentist, JSON.stringify(payload));
            } catch (error) {
                console.log(error);
            }
            break;
        
        // Create new Clinic
        case '3':
            try {
                console.log("Please enter the Clinic's information");
                const newClinic = {
                    id: '',
                    name: '',
                    address: '',
                    location: {
                        lat: null,
                        lng: null
                    }
                };
                await promptForClinicInfo(newClinic);
                const statusObject = { message: 'Request to create new Clinic resource in the database' };
                const payload = { clinic: newClinic, reqId: preLoginReqId, status: statusObject };
                mqttClient.publish(MQTT_TOPICS.createClinic, JSON.stringify(payload));
            } catch (error) {
                console.log(error);
            }
            break;

        // Get all Clinics
        case '4':
            const statusObject = { message: 'Request to get the Clinic resources from the database' };
            const payload = { reqId: preLoginReqId, status: statusObject };
            mqttClient.publish(getClinics, JSON.stringify(payload));
            break;

        // Exit the program
        case '0':
            console.log('Exiting the program.');
            rl.close();
            mqttClient.end(); // Close MQTT connection
            process.exit(0);

        default:
            // Invalid input
            console.log('Invalid choice. Please try again.');
            break;
    }
    // Display the login menu after processing the choice unless login attempt was a success
    if (!isLoggedIn) {
        displayLoginMenu();
    }
}

//======================= MAIN MENU HANDLER =======================//
async function handleMenuInput(choice) {
    switch (choice) {
        // Add new Dentist
        case '1':
            try {
                console.log("Please enter the Dentist's credentials");
                const newDentist = {};
                await promptForDentistInfo(newDentist);
                const statusObject = { message: 'Request to create new Dentist resource in the database' };
                const payload = { dentist: newDentist, reqId: userId, status: statusObject };
                mqttClient.publish(MQTT_TOPICS.createDentist, JSON.stringify(payload));
            } catch (error) {
                console.log(error);
            }
            break;

        // Add new Timeslot
        case '2':
            try {
                console.log("Please enter the necessary Timeslot information");
                const newTimeslot = { clinic: clinicId, dentist: null, patient: null };
                await promptForTimeslotInfo(newTimeslot);
                const statusObject = { message: 'Request to create new Timeslot resource in the database' };
                const payload = { timeslot: newTimeslot, reqId: userId, status: statusObject };
                mqttClient.publish(MQTT_TOPICS.createTimeslot, JSON.stringify(payload));
            } catch (error) {
                console.log(error);
            }
            break;
        
        // Get all Timeslots for the Clinic
        case '3':
            fetchTimeslots();
            break;

        // Get all Timeslots for the currently logged in Dentist
        case '4':
            fetchTimeslots(userId);
            break;

        // Assign Dentist to Timeslot
        case '5':
            try {
                console.log("Please enter the necessary information");
                const timeslotUpdate = {};
                await assignDentist(timeslotUpdate);
                const statusObject = { message: 'Request to assign Dentist to Timeslot resource in the database' };
                const payload = { timeslotUpdate: timeslotUpdate, reqId: userId, status: statusObject };
                mqttClient.publish(MQTT_TOPICS.assignTimeslot, JSON.stringify(payload));
            } catch (error) {
                console.log(error);
            }
            break;

        // Cancel booked Timeslot
        case '6':
            try {
                console.log("Please enter the necessary information");
                const timeslotCancellation = {};
                await unassignDentist(timeslotCancellation);
                const statusObject = { message: 'Request to unassign Dentist from Timeslot resource in the database' };
                const payload = { timeslotUpdate: timeslotCancellation, reqId: userId, status: statusObject };
                mqttClient.publish(MQTT_TOPICS.assignTimeslot, JSON.stringify(payload));
            } catch (error) {
                console.log(error);
            }
            break;

        // Exit the program
        case '0':
            console.log('Exiting the program.');
            rl.close();
            mqttClient.end(); // Close MQTT connection
            process.exit(0);
        
        // Invalid input
        default:
            console.log('Invalid choice. Please try again.');
            break;
    }
  
    // Display the main menu after processing the choice
    displayMainMenu();
}


//============================== READ USER INPUT METHODS ==============================//

// Login function
function login(loginInfo) {
    return new Promise(async (resolve, reject) => {
        // Make Promise functions available to the on-message event handler using the global variables
        loginResolve = resolve;
        loginReject = reject;

        // Prompt for User/Dentist ID
        loginInfo.id = await new Promise((resolve) => {
            rl.question('Enter your ID: ', (id) => {
                if (id.trim() !== '') {
                    resolve(id.trim());
                } else {
                    reject('Invalid input: Dentist ID cannot be empty');
                }
            });
        });

        // Prompt for password
        loginInfo.password = await new Promise((resolve) => {
            rl.question('Enter your password: ', (password) => {
                resolve(password);
            });
        });

        // Add request ID and logging message to payload then publish login request
        loginInfo.reqId = preLoginReqId;
        loginInfo.status.message = 'CLI app login request from user with ID: ' + loginInfo.id;
        mqttClient.publish(loginTopic, JSON.stringify(loginInfo));
    });
}
// Prompt for new Clinic input from user
function promptForClinicInfo(newClinic) {
    return new Promise(async (resolve, reject) => {
        // Prompt for Clinic ID
        newClinic.id = await new Promise((resolve) => {
            rl.question('Enter the Clinic ID: ', (id) => {
                if (id.trim() !== '') {
                    resolve(id.trim());
                } else {
                    reject('Invalid input: Clinic ID cannot be empty');
                }
            });
        });

        // Prompt for Clinic name
        newClinic.name = await new Promise((resolve) => {
            rl.question("Enter the Clinic's name: ", (name) => {
                if (name.trim() !== '') {
                    resolve(name.trim());
                } else {
                    reject('Invalid input: Clinic name cannot be empty');
                }
            });
        });

        // Prompt for Clinic address
        newClinic.address = await new Promise((resolve) => {
            rl.question('Enter the address: ', (address) => {
                if (address.trim() !== '') {
                    resolve(address.trim());
                } else {
                    reject('Invalid input: address cannot be empty');
                }
            });
        });

        // Ask for the coordinates - [not yet implemented]: validate that the entered number is between -90 and +90
        // Prompt for latitude
        newClinic.location.lat = await new Promise((resolve) => {
            console.log('Input the coordinates.');
            rl.question('Enter latitude: ', (latitude) => {
                if (coordinateRegex.test(latitude) && latitude !== '') {
                    resolve(parseFloat(latitude));
                } else {
                    reject('Invalid input: expecting a valid coordinate number format');
                }
            });
        });

        // Prompt for longitude
        newClinic.location.lng = await new Promise((resolve) => {
            console.log('Input the coordinates.');
            rl.question('Enter longitude: ', (longitude) => {
                if (coordinateRegex.test(longitude) && longitude !== '') {
                    resolve(parseFloat(longitude));
                } else {
                    reject('Invalid input: expecting a valid coordinate number format');
                }
            });
        });

        // Ask if the user wants to add custom opening hours (default is defined in the mongoose schema)
        const addOpeningHours = await new Promise((resolve) => {
            rl.question('Do you want to add opening hours (default: 08:00-17:00)? (Y/N) ', (answer) => {
                if (answer.toLowerCase() === 'y') {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });

        // Only prompt the user to input opening hours if their previous answer was 'yes'
        if (addOpeningHours) {
            // Store the hours in temporary array
            const hoursArray = [];

            // Prompt for opening hour
            hoursArray.push(await new Promise((resolve) => {
                rl.question('Enter the opening hour (number between 0-23): ', (startHour) => {
                    if (dayHourRegex.test(startHour)) {
                        resolve(parseInt(startHour));
                    } else {
                        reject('Invalid input: number must be integer between 0-23');
                    }
                });
            }));

            // Prompt for closing hour
            hoursArray.push(await new Promise((resolve) => {
                rl.question('Enter the closing hour (number between 0-23): ', (endHour) => {
                    if (dayHourRegex.test(endHour)) {
                        resolve(parseInt(endHour));
                    } else {
                        reject('Invalid input: number must be integer between 0-23');
                    }
                });
            }));
            
            // Validate opening hours
            await new Promise((resolve) => {
                if (hoursArray[0] >= hoursArray[1]) {
                    reject('Invalid opening hours: starting hour is greater than or equal to closing hour');
                } else {
                    // Assign opening hours to Clinic object payload
                    newClinic.hours = hoursArray;
                    resolve();
                }
            });
        }

        // Prompt user for confirmation
        rl.question(`Do you want to save a new Clinic with the following information? (Y/N) \n${JSON.stringify(newClinic)}\n`, (answer) => {
            if (answer.toLowerCase() === 'y') {
                resolve('Attempting to create new Clinic');
            } else {
                reject('Did not create new Clinic');
            }
        });
    });
}

// Read new Dentist input from user
function promptForDentistInfo(newDentist) {
    return new Promise(async (resolve, reject) => {
        // Prompt for Dentist ID
        newDentist.id = await new Promise((resolve) => {
            rl.question('Enter an ID: ', (id) => {
                if (id.trim() !== '') {
                    resolve(id.trim());
                } else {
                    reject('Invalid input: Dentist ID cannot be empty');
                }
            });
        });

        // Prompt for Dentist name
        newDentist.name = await new Promise((resolve) => {
            rl.question('Enter the name: ', (dentistName) => {
                if (dentistName.trim() !== '') {
                    resolve(dentistName.trim());
                } else {
                    reject('Invalid input: name cannot be empty');
                }
            });
        });

        // Prompt for password
        newDentist.password = await new Promise((resolve) => {
            rl.question('Enter a password: ', (password) => {
                if (password !== '') {
                    resolve(password);
                } else {
                    reject('Invalid input: password cannot be empty');
                }
            });
        });

        // Prompt user if there is no global ID (which is the case before login)
        if (!clinicId) {
            newDentist.clinic = await new Promise((resolve) => {
                rl.question('Enter the Clinic ID: ', (enteredClinicId) => {
                    if (enteredClinicId.trim() !== '') {
                        resolve(enteredClinicId.trim());
                    } else {
                        reject('Invalid input: Clinic ID cannot be empty');
                    }
                });
            });
        } else {
            // Otherwise add the saved global ID
            newDentist.clinic = clinicId;
        }

        // Prompt user for confirmation
        rl.question(`Do you want to save a new Dentist with the following information? (Y/N) \n${JSON.stringify(newDentist)}\n`, (answer) => {
            if (answer.toLowerCase() === 'y') {
                resolve('Attempting to create new Dentist');
            } else {
                reject('Did not create new Dentist');
            }
        });
    });
}

// Read new Timeslot input from user
function promptForTimeslotInfo(newTimeslot) {
    return new Promise(async (resolve, reject) => {
        // Prompt for start time in Date format
        newTimeslot.startTime = await new Promise((resolve) => {
            rl.question('Enter start date (YYYY-MM-DD HH:mm): ', (startDateInput) => {
                const startDate = new Date(startDateInput);
                if (isNaN(startDate)) {
                    reject('Invalid date format. Please use YYYY-MM-DD HH:mm.');
                } else {
                    resolve(startDate);
                }
            });
        });

        // Prompt for end time in Date format
        newTimeslot.endTime = await new Promise((resolve) => {
            rl.question('Enter end time(YYYY-MM-DD HH:mm): ', (endDateInput) => {
                const endDate = new Date(endDateInput);
                if (isNaN(endDate)) {
                    reject('Invalid date format. Please use YYYY-MM-DD HH:mm.');
                } else {
                    resolve(endDate);
                }
            });
        });

        // Check if startTime >= endTime
        // The promise is necessary to prevent execution of the final question if we reject
        await new Promise((resolve) => {
            if (newTimeslot.startTime >= newTimeslot.endTime) {
                reject('Invalid input: start time cannot be equal to or later than end time');
            } else {
                resolve();
            }
        });

        // Ask if the user wants to assign a Dentist
        const addDentist = await new Promise((resolve) => {
            rl.question('Do you want to assign a Dentist? (Y/N): ', (answer) => {
                if (answer.toLowerCase() === 'y') {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });

        // Only prompt the user to input a Dentist ID if their previous answer was 'yes'
        if (addDentist) {
            // Prompt for Dentist ID
            newTimeslot.dentist = await new Promise((resolve) => {
                rl.question("Enter the Dentist's ID: ", (id) => {
                    if (id.trim() !== '') {
                        resolve(id.trim());
                    } else {
                        reject('Invalid input: Dentist ID cannot be empty');
                    }
                });
            });
        }

        // Prompt user for confirmation
        rl.question(`Do you want to create a new Timeslot with the following information? (Y/N) \n${JSON.stringify(newTimeslot)}\n`, (answer) => {
            if (answer.toLowerCase() === 'y') {
                resolve('Attempting to create new Timeslot');
            } else {
                reject('Did not create new Timeslot');
            }
        });
    });
}

// Send request to to fetch all Timeslots for a specific Clinic 
function fetchTimeslots() {
    const payload = {
        reqId: userId,
        clinicId: clinicId,
        status: { message: 'Request to fetch all Timeslots of a specific Clinic' }
    }
    mqttClient.publish(MQTT_TOPICS.getTimeslots, JSON.stringify(payload));
}

// Send request to to fetch all Timeslots for a specific Dentist 
function fetchTimeslots(dentistId) {
    const payload = {
        reqId: userId,
        clinicId: clinicId,
        dentistId: dentistId,
        status: { message: 'Request to fetch all Timeslots of a specific Dentist' }
    }
    mqttClient.publish(MQTT_TOPICS.getTimeslots, JSON.stringify(payload));
}

// Assigning dentist makes Timeslot (appointment) bookable by "publishing" it
function assignDentist(timeslotUpdate) {
    return new Promise(async (resolve, reject) => {
        // Prompt for Timeslot ID
        timeslotUpdate.timeslot = await new Promise((resolve) => {
            rl.question('Enter the Timeslot ID: ', (timeslotId) => {
                if (timeslotId.trim() !== '') {
                    resolve(timeslotId.trim());
                } else {
                    reject('Invalid input: Timeslot ID cannot be empty');
                }
            });
        });

        // Prompt for Dentist ID
        timeslotUpdate.dentist = await new Promise((resolve) => {
            rl.question('Enter the Dentist ID: ', (dentistId) => {
                if (dentistId.trim() !== '') {
                    resolve(dentistId.trim());
                } else {
                    reject('Invalid input: Dentist ID cannot be empty');
                }
            });
        });

        // Prompt user for confirmation
        rl.question(`Do you want to assign the following dentist [${timeslotUpdate.dentist}] to this Timeslot [${timeslotUpdate.timeslot}]? (Y/N): `, (answer) => {
            if (answer.toLowerCase() === 'y') {
                resolve('Attempting to assign Dentist to Timeslot');
            } else {
                reject('Did not assign Dentist to Timeslot');
            }
        });
    });
}

// If Timeslot is not booked then unassigning the dentist makes the Timeslot unavailable to patients
// If Timeslot is booked then unassigning the dentist will cancel the existing booking
function unassignDentist(timeslotCancellation) {
    return new Promise(async (resolve, reject) => {
        rl.question('Enter the Timeslot ID: ', (timeslotId) => {
            if (timeslotId.trim() !== '') {
                timeslotCancellation.timeslot = timeslotId.trim();
                timeslotCancellation.dentist = null;
                resolve(`Attempting to unassign Dentist from timeslot with ID: ${timeslotCancellation.timeslot}`);
            } else {
                reject('Invalid input: Timeslot ID cannot be empty');
            }
        });
    });
}


//============================= MQTT EVENT LISTENERS =============================//
mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');

    // Append the temporary reqId to all topics and subscribe to each 
    mqttClient.subscribe(preLoginTopics, (error, granted) => {
        if (!error) {
            granted.forEach(key => {
                console.log(`Subscribed to messages on: ${key.topic}`);
            });
            displayLoginMenu(); // Display login menu after mqtt setup is complete
        } else {
            console.log('Error when subscribing to topics: ' + error);
        }
    });
});

mqttClient.on('message', (topic, message) => {
    // Remove the appended ID from the incoming topic before matching it in the switch
    const trimmedTopic = topic.substring(0, topic.lastIndexOf('/') + 1);

    switch (trimmedTopic) {
        case MQTT_TOPICS.getTimeslots:
            // Print all the received Timeslots
            try {
                const payload = JSON.parse(message);
                console.log('\n\nMessage received on topic: ' + topic);
                console.log(payload.message);
                console.log(JSON.stringify(payload.content, undefined, 2) + '\n');
            } catch (error) {
                console.log("Error when processing MQTT message: ", error);
            }
            break;
        case MQTT_TOPICS.createClinic:
            // Clinic creation confirmation/rejection
            try {
                const payload = JSON.parse(message);
                console.log('\n\nMessage received on topic: ' + topic);
                console.log(payload.message);
                console.log(JSON.stringify(payload.content, undefined, 2) + '\n');
        
            } catch (error) {
                console.log("Error when processing MQTT message: ", error);
            }
            break;
        case MQTT_TOPICS.createDentist:
            // Dentist creation confirmation/rejection
            try {
                const payload = JSON.parse(message);
                console.log('\n\nMessage received on topic: ' + topic);
                console.log(payload.message);
                console.log(JSON.stringify(payload.content, undefined, 2) + '\n');
            } catch (error) {
                console.log("Error when processing MQTT message: ", error);
            }
            break;
        case MQTT_TOPICS.createTimeslot:
            // Timeslot creation confirmation/rejection
            try {
                const payload = JSON.parse(message);
                console.log('\n\nMessage received on topic: ' + topic);
                console.log(payload.message);
                console.log(JSON.stringify(payload.content, undefined, 2) + '\n');
            } catch (error) {
                console.log("Error when processing MQTT message: ", error);
            }
            break;
        case MQTT_TOPICS.assignTimeslot:
            // Confirmation for Assigning/Unassigning Dentist from Timeslot
            try {
                const payload = JSON.parse(message);
                console.log('\n\nMessage received on topic: ' + topic);
                console.log(payload.message);
                console.log(JSON.stringify(payload.content, undefined, 2) + '\n');
            } catch (error) {
                console.log("Error when processing MQTT message: ", error);
            }
            break;
        case getClinics:
            // Get all the Clinics registered in the Dentago database
            try {
                const payload = JSON.parse(message);
                console.log('\n\nMessage received on topic: ' + topic);
                console.log(payload.message);
                console.log(JSON.stringify(payload.content, undefined, 2) + '\n');
            } catch (error) {
                console.log("Error when processing MQTT message: ", error);
            }
            break;
        case loginTopic:
            // Handle login attempt response 
            console.log('\nMessage received on: ' + topic);
            try {
                const payload = JSON.parse(message);
                if (payload.response === 'success') {
                    userId = payload.content.id;
                    clinicId = payload.content.clinic.id;
                    clinicMongoId = payload.content.clinic._id;

                    isLoggedIn = true;
                    loginResolve('Login successful!\n');
                } else {
                    loginReject('Login failed - try again!');
                }
            } catch (error) {
                loginReject("Error when processing MQTT message: ", error);
            }
            break;
        default:
            // Previous default behaviour useful for troubleshooting
            //console.error(`TopicError: Message received at unhandled topic "${topic}"`);

            // Only handle booking notifications after successful login
            if (isLoggedIn) {
                // Handle "booking" notifications for displaying Timeslot update notifications
                // The notification topic has changing recipient ID's (wildcard sub-topic), so it must be handled in the default case
                try {
                    const payload = JSON.parse(message);
                    const timeslot = JSON.parse(payload.timeslotJSON);
                    const timeslotId = timeslot._id;
                    const action = payload.instruction === 'BOOK' ? 'BOOKED' : 'CANCELLED';
                    console.log('\n\nMessage received on topic: ' + topic);
                    console.log(`Timeslot with the ID [${timeslotId}] has been ${action}`);
                } catch (error) {
                    console.log("Error when processing MQTT message: ", error);
                }
            }
    }
});

mqttClient.on('error', (error) => {
    console.error('MQTT connection error: ', error);
});

mqttClient.on('close', () => {
    // "\n" due to Windows cmd prompt
    console.log('\nClient disconnected from MQTT broker');
});

mqttClient.on('reconnect', () => {
    console.log('Reconnected to MQTT broker');
}); 

process.on('SIGINT', () => {
    console.log('Closing MQTT connection...');
    // End MQTT connection and exit process using success codes for both
    mqttClient.end({ reasonCode: 0x00 }, () => {
        console.log('MQTT connection closed');
        process.exit(0);
    });
});
