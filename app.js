/** 
 *  The Dentist CLI tool is used to test and demo the Dentist API functionalities.
 *  This tool can substitute API-integration with the Clinic's/Dentist's own IT-system, in the case that they do not have one.
 * 
 *  ===========================================================================================================================
 * 
 *  REGARDING THE HORRIBLY NESTED FUNCTIONS: Due to the asynchronous nature of JavaScript, a choice had to be made between either 
 *  nesting the prompted questions or using tons of Promises (one for each question), as otherwise all of the them would immediately 
 *  print to the terminal instead of waiting for the answer before asking the next question. Initially, the user was only prompted 
 *  a low number of questions for any of the "read-input" functions, so the choice of nesting was made due to it being simpler. 
 *  However, as the complexity (and amount) of prompts/input needed for many of the functions has grown, so has the the nesting, 
 *  which is now making the code quite hard to understand and maintain.
 * 
 *  (!) This is most likely to be fixed in a future commit by refactoring to Promise-based functions - if time permits.
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
let clinicId = '';                                  // The Clinic ID correlating with the currently logged in dentist. Fetched after successful login
let userId = '';                                    // The dentist ID of the currently logged in user. Received after successful login
let clinicMongoId = '';                             // Included in the bookingNotification topic

const digitRegex = /^\d+$/;                         // Checks that a String only contains digits (unused)
const dayHourRegex = /^(1?[0-9]|2[0-3])$/;          // Checks that a String contains a number in the span of 0-23
const coordinateRegex = /^[-+]?\d*\.?\d*$/;         // Checks if a String starts with a '+' or '-', followed by any amount of digits, then a '.', and any amount of digits

let isLoggedIn = false;
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
    bookingNotification: () => { return `dentago/booking/+/${clinicMongoId}/SUCCESS` },
}

const loginTopic = 'dentago/dentist/login/';
const getClinics = 'dentago/dentist/clinics/';
const preLoginTopics = [loginTopic, getClinics, MQTT_TOPICS.createClinic, MQTT_TOPICS.createDentist].map(topic => { 
    return topic + preLoginReqId 
});

//============================== TOPIC SUBSCRIBE FUNCTIONS ==============================//

// Unsubscribes from the topics used before successful login using a temporary ID
function unSubscribeToLoginTopics() {
    mqttClient.unsubscribe(preLoginTopics, (error) => {
        if (error) console.log('Error when unsubscribing to topics: ' + error);
    });
}

// Subscribe to all topics using a dentist ID (after successful login)
function subscribeToMainTopics() {
    // Append the clinicId to all topics and subscribe to each 
    mqttClient.subscribe(Object.values(MQTT_TOPICS).map(topic => { 
        // Do not append clinicId to the "bookingNotification" topic
        return topic !== MQTT_TOPICS.bookingNotification ? topic + userId : topic(); // Treat "bookingNotification" as function that returns the correct String
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
    console.log('4. Get all Clinics')
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
    console.log('4. Get all your Timeslots')
    console.log('5. Assign Dentist to existing Timeslot');
    console.log('6. Cancel booked appointment');
    console.log('0. Exit');
    rl.question('Enter your option: ', (input) => {
        handleMenuInput(input);
    });
}


//================================ HANDLE USER INPUT ================================//

//================ LOGIN MENU FUNCTIONS ====================//
async function handleLoginMenuInput(choice) {
    switch (choice) {
        // Login as Dentist
        case '1':
            const loginInfo = {
                id: '',
                password: '',
                reqId: '',
                status: {
                    message: ''
                }
            };
            console.log("Please enter your login information");
            try {
                await login(loginInfo).then(console.log);
                unSubscribeToLoginTopics();
                subscribeToMainTopics();
            } catch (error) {
                console.log(error);
            }
            break;
    
        // Register new Dentist
        case '2':
            const newDentist = {};
            console.log("Please enter your credentials");
            try {
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
            const newClinic = {
                id: '',
                name: '',
                address: '',
                location: {
                    lat: null,
                    lng: null
                }
            };
            console.log("Please enter the Clinic's information");
            try {
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

// Login function
function login(loginInfo) {    
    return new Promise(async (resolve, reject) => {
        // Make Promise functions available to the on-message event handler using the global variables
        loginResolve = resolve;
        loginReject = reject;

        rl.question('Enter your ID: ', (dentistId) => {
            loginInfo.id = dentistId;

            rl.question('Enter your password: ', (dentistPassword) => {
                loginInfo.password = dentistPassword;
                loginInfo.reqId = preLoginReqId;
                loginInfo.status.message = 'CLI app login request from user with ID: ' + dentistId;

                mqttClient.publish(loginTopic, JSON.stringify(loginInfo));
            });
        });
    });
}

// Prompt for new Clinic input from user
function promptForClinicInfo(newClinic) {
    return new Promise(async (resolve, reject) => {
        rl.question('Enter the Clinic ID: ', (id) => {
            newClinic.id = id.trim();

            rl.question('Enter the name: ', (name) => {
                newClinic.name = name.trim();

                rl.question('Enter the address: ', (address) => {
                    newClinic.address = address.trim();

                    console.log('Enter the coordinates');
                    rl.question('Enter latitude: ', (latitude) => {
                        // Try-catch blocks must be inside the "question" function scope or the app crashes
                        // It is not enough to put just one at the highest level block of the function itself
                        // For the same reason there is a second try-catch for the second Error
                        try {
                            if (coordinateRegex.test(latitude)) {
                                newClinic.location.lat = parseFloat(latitude);
                            } else {
                                throw new Error('Invalid latitude input, expecting a valid number format');
                            }
    
                            rl.question('Enter longitude: ', async (longitude) => {
                                try {
                                    if (coordinateRegex.test(longitude)) {
                                        newClinic.location.lng = parseFloat(longitude);
                                    } else {
                                        throw new Error('Invalid longitude input, expecting a valid number format');
                                    }
        
                                    rl.question('Do you want to add opening hours (default: 08:00-17:00)? (Y/N) ', async (answer) => {
                                        let addOpeningHours = false;
                                        if (answer.toLowerCase() === 'y') {
                                            addOpeningHours = true;
                                        }

                                        let isValidOpeningHours = true;
                                        console.log("is the check before this stuff???")
                                        if (addOpeningHours) {
                                            try {
                                                const openingHours = await new Promise((resolve, reject) => {
                                                    const hoursArray = [];
                                                    rl.question('Enter the starting hour (number between 0-23): ', (startHour) => {
        
                                                        let integerStartHour = null;
                                                        if (dayHourRegex.test(startHour)) {
                                                            integerStartHour = parseInt(startHour);
                                                            hoursArray.push(integerStartHour);
                                                        } else {
                                                            isValidOpeningHours = false;
                                                            reject('Invalid starting hour: number must be integer between 0-23');
                                                        }

                                                        if (isValidOpeningHours) {
                                                            rl.question('Enter the closing hour (number between 0-23): ', (endHour) => {

                                                                if (dayHourRegex.test(endHour)) {
                                                                    integerEndHour = parseInt(endHour);
                                                                    hoursArray.push(integerEndHour);
                                                                } else {
                                                                    isValidOpeningHours = false;
                                                                    reject('Invalid closing hour: number must be integer between 0-23');
                                                                }
    
                                                                resolve(hoursArray);
                                                            });
                                                        }
                                                    });
                                                });

                                                if (openingHours[0] >= openingHours[1]) throw new Error('Invalid opening hours: starting hour is greater than or equal to closing hour');
                                                newClinic.hours = openingHours;
                                            } catch (error) {
                                                isValidOpeningHours = false;
                                                reject(error.toString());
                                            }
                                        }
                                        if (isValidOpeningHours) {
                                            rl.question(`Do you want to save a new Clinic with the following information? (Y/N) \n${JSON.stringify(newClinic)}\n`, (answer) => {
                                                if (answer.toLowerCase() === 'y') {
                                                    resolve();
                                                } else {
                                                    newClinic = {};
                                                    reject('Did not create new Clinic');
                                                }
                                            });
                                        }
                                    }); // async function
                                } catch (error) {
                                    reject(error.toString());
                                }
                            });
                        } catch (error) {
                            reject(error.toString());
                        }
                    });
                });
            });
        });
    });
}


//============================== MAIN MENU FUNCTIONS ==============================//
// Function to handle user input and execute corresponding actions
async function handleMenuInput(choice) {
    switch (choice) {
        // Add new Dentist
        case '1':
            const newDentist = {};
            console.log("Please enter the Dentist's credentials");
            try {
                await promptForDentistInfo(newDentist);
                if (!newDentist.clinic) newDentist.clinic = clinicId; // If clinic ID was not manually added set the global one
                const statusObject = { message: 'Request to create new Dentist resource in the database' };
                const payload = { dentist: newDentist, reqId: userId, status: statusObject };
                mqttClient.publish(MQTT_TOPICS.createDentist, JSON.stringify(payload));
            } catch (error) {
                console.log(error);
            }
            break;

        // Add new Timeslot
        case '2':
            const newTimeslot = { clinic: clinicId, dentist: null, patient: null };
            console.log("Please enter the necessary Timeslot information");
            try {
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
            const timeslotUpdate = {};
            console.log("Please enter the necessary information");
            try {
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
            const timeslotCancellation = {};
            console.log("Please enter the necessary information");
            try {
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

// Read new Dentist input from user
function promptForDentistInfo(newDentist) {
    return new Promise(async (resolve, reject) => {
        rl.question('Enter the ID: ', (id) => {
            newDentist.id = id.trim();

            rl.question('Enter the name: ', (dentistName) => {
                newDentist.name = dentistName.trim();

                // The 'async' flag is needed so we can 'await' the promise and pause execution
                rl.question('Enter a password: ', async (password) => {
                    newDentist.password = password;

                    let isValidClinicId = true;
                    if (!clinicId) {    // Prompt user if there is no global ID (which is the case before login)
                        try {
                            const enteredClinicId = await new Promise((resolve, reject) => {
                                rl.question('Enter Clinic ID: ', (enteredClinicId) => {
                                    if (enteredClinicId.trim() !== '') {
                                        resolve(enteredClinicId.trim());
                                    } else {
                                        isValidClinicId = false;
                                        reject('Invalid Clinic ID: ID cannot be empty')
                                    }
                                });
                            });
                            newDentist.clinic = enteredClinicId;
                        } catch (error) {
                            reject(error);
                        }  
                    }

                    // Ensure this prompt is not triggered if clinic ID is invalid
                    if (isValidClinicId) {
                        rl.question(`Do you want to save a new Dentist with the following information? (Y/N) \n${JSON.stringify(newDentist)}\n`, (answer) => {
                            if (answer.toLowerCase() === 'y') {
                                resolve();
                            } else {
                                newDentist = {};
                                reject('Did not create new Dentist');
                            }
                        });
                    }
                }); // async function
            });
        });
    });
}

// Read new Timeslot input from user
function promptForTimeslotInfo(newTimeslot) {
    return new Promise(async (resolve, reject) => {
        rl.question('Enter start date (YYYY-MM-DD HH:mm): ', (startDateInput) => {
            const startDate = new Date(startDateInput);
            if (isNaN(startDate)) {
                reject('Invalid date format. Please use YYYY-MM-DD HH:mm.');
                return;
            }
            newTimeslot.startTime = startDate;

            rl.question('Enter end time(YYYY-MM-DD HH:mm): ', (endDateInput) => {
                const endDate = new Date(endDateInput);
                if (isNaN(endDate)) {
                    reject('Invalid date format. Please use YYYY-MM-DD HH:mm.');
                    return;
                }
                if (endDate <= startDate) {
                    reject('Invalid input. End time must be later than the start time.')
                    return;
                }
                newTimeslot.endTime = endDate;

                rl.question('Do you want to assign a Dentist? (Y/N): ', (answer) => {
                    if (answer.toLowerCase() == 'y') {
                        rl.question('Enter the Dentist ID: ', (id) => {
                            const noWhitespaceId = id.trim();
                            newTimeslot.dentist = noWhitespaceId;
                            resolve();
                        });
                    } else {
                        resolve('Did not create new Timeslot');
                    }
                });
            });
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
        rl.question('Enter the Timeslot ID: ', (timeslotId) => {
            timeslotUpdate.timeslot = timeslotId.trim();

            rl.question('Enter the Dentist ID: ', (dentistId) => {
                timeslotUpdate.dentist = dentistId.trim();
                rl.question(`Do you want to assign the following dentist [${dentistId}] to this Timeslot [${timeslotId}]? (Y/N): `, (answer) => {
                    if (answer.toLowerCase() === 'y') {
                        resolve();
                    } else {
                        timeslotUpdate = {};
                        reject('Did not assign Dentist');
                    }
                });
            });
        });
    });
}

// If Timeslot is not booked then unassigning the dentist makes the Timeslot unavailable to patients
// If Timeslot is booked then unassigning the dentist will cancel the existing booking
function unassignDentist(timeslotCancellation) {
    return new Promise(async (resolve) => {
        rl.question('Enter the Timeslot ID: ', (timeslotId) => {
            timeslotCancellation.timeslot = timeslotId.trim();
            timeslotCancellation.dentist = null;
            resolve();
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
                resolve("Error when processing MQTT message: ", error);
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
                    console.log(payload) // TODO: remove after testing that notifications properly work
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
