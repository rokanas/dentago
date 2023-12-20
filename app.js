// Read input
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Variables
// const clinicId = '';                             // The corresponding Clinic ID --> //TODO: fetch after successful login
//const clinicId = 'greenHillZoneClinic';           // Placeholder hardcoded value - remove 
//const clinicMongoId = '657304e661d1c9f248318306'; // green hill sprint3 DB
const clinicId = 'testClinic';                      // Placeholder hardcoded value - remove 
const clinicMongoId = '65805c5299d295eb1305e342';   // testClinic notification DB

const digitRegex = /^\d+$/;                         // Checks that a String only contains digits (unused)

// MQTT stuffs
const mqtt = require('mqtt');
const broker = 'mqtt://test.mosquitto.org/:1883';
const hiveBroker = 'mqtt://broker.hivemq.com/:1883';
const mqttClient = mqtt.connect(broker);

// TEST TOPICS
const mockApiPublish = 'dentago/mockDentist/'; 
const mockApiSubscribe = mockApiPublish + clinicId;

// MQTT topics
MQTT_TOPICS = {
    getTimeslots: 'dentago/dentist/timeslot/',
    createClinic: 'dentago/dentist/creation/clinics/',
    createDentist: 'dentago/dentist/creation/dentists/',
    createTimeslot: 'dentago/dentist/creation/timeslots/',
    assignTimeslot: 'dentago/dentist/assignment/timeslot/',
    booking: 'dentago/booking/'
}
const bookingNotification = `dentago/booking/+/${clinicMongoId}/SUCCESS`;

const authLogin = 'dentago/dentist/login/'; // TODO: implement this for the login functionality


//================================= PRINT MENU FUNCTIONS =================================//
// Function to display the login menu
function displayLoginMenu() {
    console.log('\n=== Login Menu ===');
    console.log('1. Login Dentist'); 
    console.log('2. Register Dentist');
    console.log('3. Create new Clinic');
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
    console.log('3. Get all Timeslots'); // TODO: prompt user if by Clinic or by Dentist
    console.log('4. Assign Dentist to existing Timeslot');
    console.log('5. Cancel booked appointment');
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
            const loginInfo = {};
            console.log("Please enter your login information");
            try {
                await login(loginInfo);

            } catch (error) {
                console.log(error);
            }
            break;
    
        // Register new Dentist
        case '2':
            break;
        
        // Create new Clinic
        case '3':
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
    // Display the login menu after processing the choice
    if (!isLoggedIn) displayLoginMenu();
}

// Login function
// When login successful --> fetch and assign clinicId
function login(loginInfo) {
    return new Promise(async (resolve, reject) => {
        rl.question('Enter your ID: ', (dentistId) => {
            loginInfo.id = dentistId;

            rl.question('Enter your password: ', (dentistPassword) => {
                loginInfo.password = dentistPassword;
                
                mqttClient.publish(authLogin, loginInfo);

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
                newDentist.clinic = clinicId;
                const statusObject = { message: 'Request to create new Dentist resource in the database' };
                const payload = { dentist: newDentist, reqId: clinicMongoId, status: statusObject };
                mqttClient.publish(MQTT_TOPICS['createDentist'], JSON.stringify(payload));
                console.log(payload); // TODO: remove 
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
                const payload = { timeslot: newTimeslot, reqId: clinicMongoId, status: statusObject };
                mqttClient.publish(MQTT_TOPICS['createTimeslot'], JSON.stringify(payload));
                console.log(newTimeslot); // TODO: remove
            } catch (error) {
                console.log(error);
            }
            break;
        
        // Get all Timeslots
        case '3':
            // TODO: make this async with promise and set-timeout callback to continue execution if no timely response?
            fetchTimeslots();
            break;

        // Assign Dentist to Timeslot
        case '4':
            const timeslotUpdate = {};
            console.log("Please enter the necessary information");
            try {
                await assignDentist(timeslotUpdate);
                const statusObject = { message: 'Request to assign Dentist to Timeslot resource in the database' };
                const payload = { timeslotUpdate: timeslotUpdate, reqId: clinicMongoId, status: statusObject };
                mqttClient.publish(MQTT_TOPICS['assignTimeslot'], JSON.stringify(payload));
                console.log(timeslotUpdate); // TODO: remove
            } catch (error) {
                console.log(error);
            }
            break;

        // Cancel booked Timeslot
        case '5':
            const timeslotCancellation = {};
            console.log("Please enter the necessary information");
            try {
                await unassignDentist(timeslotCancellation);
                const statusObject = { message: 'Request to unassign Dentist from Timeslot resource in the database' };
                const payload = { timeslotUpdate: timeslotCancellation, reqId: clinicMongoId, status: statusObject };
                mqttClient.publish(MQTT_TOPICS['assignTimeslot'], JSON.stringify(payload));
                console.log(timeslotCancellation); // TODO: remove
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

                rl.question('Enter a password: ', (password) => {
                    newDentist.password = password;

                    rl.question(`Do you want to save a new Dentist with the following information? (Y/N) \n${JSON.stringify(newDentist)}\n`, (answer) => {
                        if (answer.toLowerCase() === 'y') {
                            resolve();
                        } else {
                            newDentist = {};
                            reject('Did not create new Dentist');
                        }
                    });
                });
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
                            if (!digitRegex.test(noWhitespaceId)) {
                                reject('Invalid input. Please enter only digits for ID');
                                return;                
                            }
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

// Send request to dentistAPI to fetch all Timeslots for a specific Clinic
function fetchTimeslots() {
    const payload = {
        reqId: clinicMongoId,
        clinicId: clinicMongoId,
        status: { message: 'Request to fetch all Timeslots of a given Clinic' }
    }
    mqttClient.publish(MQTT_TOPICS['getTimeslots'], JSON.stringify(payload));
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
            })
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

    // Append the clinicId to all topics and subscribe to each 
    // TODO: extract this block and call it after successful login
    mqttClient.subscribe(Object.values(MQTT_TOPICS).map(topic => { 
        return topic !== MQTT_TOPICS.booking ? topic + clinicMongoId : bookingNotification; // Do not append clinicId to the "booking" topic (has different structure)
    }), (error, granted) => {
        if(!error) {
            granted.forEach(key => {
                console.log(`Subscribed to messages on: ${key.topic}`);
            });
            displayMainMenu();
        } else {
            console.log('Error when subscribing to topics: ' + error);
        }
        //displayLoginMenu(); // TODO: display login instead
    });
});

mqttClient.on('message', (topic, message) => {
    switch (topic) {
        case MQTT_TOPICS['getTimeslots'] + clinicMongoId:
            // Print all the received Timeslots
            try {
                const payload = JSON.parse(message);
                console.log('\n\nMessage received on topic: ' + topic);
                console.log(payload.message);
                console.log(payload.content + '\n');
            } catch (error) {
                console.log("Error when processing MQTT message: ", error);
            }
            break;
        case MQTT_TOPICS['createClinic'] + clinicMongoId:
            // Clinic creation confirmation/rejection
            try {
                const payload = JSON.parse(message);
                console.log('\n\nMessage received on topic: ' + topic);
                console.log(payload.message);
                console.log(payload.content + '\n');
        
            } catch (error) {
                console.log("Error when processing MQTT message: ", error);
            }
            break;
        case MQTT_TOPICS['createDentist'] + clinicMongoId:
            // Dentist creation confirmation/rejection
            try {
                const payload = JSON.parse(message);
                console.log('\n\nMessage received on topic: ' + topic);
                console.log(payload.message);
                console.log(payload.content + '\n');
            } catch (error) {
                console.log("Error when processing MQTT message: ", error);
            }
            break;
        case MQTT_TOPICS['createTimeslot'] + clinicMongoId:
            // Timeslot creation confirmation/rejection
            try {
                const payload = JSON.parse(message);
                console.log('\n\nMessage received on topic: ' + topic);
                console.log(payload.message);
                console.log(payload.content + '\n');
            } catch (error) {
                console.log("Error when processing MQTT message: ", error);
            }
            break;
        case MQTT_TOPICS['assignTimeslot'] + clinicMongoId:
            // Confirmation for Assigning/Unassigning Dentist from Timeslot
            try {
                const payload = JSON.parse(message);
                console.log('\n\nMessage received on topic: ' + topic);
                console.log(payload.message);
                console.log(payload.content + '\n');
            } catch (error) {
                console.log("Error when processing MQTT message: ", error);
            }
            break;
        default:
            //console.error(`TopicError: Message received at unhandled topic "${topic}"`); (previous default behaviour)

            // Handle "booking" notifications for displaying Timeslot update notifications
            // The notification topic has changing recipient ID's, therefore must be handled as the default switch case
            try {
                const payload = JSON.parse(message);
                const timeslot = JSON.parse(payload.timeslotJSON);
                const timeslotId = timeslot._id;
                console.log(payload)
                const action = payload.instruction === 'BOOK' ? 'BOOKED' : 'CANCELLED';
                console.log('\n\nMessage received on topic: ' + topic);
                console.log(`Timeslot with the ID [${timeslotId}] has been ${action}`);
            } catch (error) {
                console.log("Error when processing MQTT message: ", error);
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
