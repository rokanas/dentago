// Read input
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Variables
// const clinicId = '';                 // The corresponding Clinic ID --> //TODO: fetch after successful login
const clinicId = 'greenHillZoneClinic'; // Placeholder hardcoded value - remove 
const clinidMongoId = '657304e661d1c9f248318306';
const digitRegex = /^\d+$/;             // Checks that a String only contains digits

// MQTT stuffs
const mqtt = require('mqtt');
const broker = 'mqtt://test.mosquitto.org/:1883';
const hiveBroker = 'mqtt://broker.hivemq.com/:1883';
const mqttClient = mqtt.connect(broker);

// TEST TOPICS
const mockApiPublish = 'dentago/dentist/'; 
const mockApiSubscribe = mockApiPublish + clinicId;

// MQTT topics
MQTT_TOPICS = {
    getTimeslots: 'dentago/dentist/timeslot/',
    createClinic: 'dentago/dentist/creation/clinics/',
    createDentist: 'dentago/dentist/creation/dentists/',
    createTimeslot: 'dentago/dentist/creation/timeslots/',
    assignTimeslot: 'dentago/dentist/assignment/timeslot/',
    bookingNotifications: 'dentago/booking/'
}

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
                const payload = { dentist: newDentist, reqId: clinicId, status: statusObject };
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
                const payload = { timeslot: newTimeslot, reqId: clinicId, status: statusObject };
                mqttClient.publish(MQTT_TOPICS['createTimeslot'], JSON.stringify(payload));
                console.log(newTimeslot); // TODO: remove
            } catch (error) {
                console.log(error);
            }
            break;
        
        // Get all Timeslots
        case '3':
            // TODO: make this async with promise and set-timeout callback to continue execution if no timely response
            fetchTimeslots();
            break;

        // Assign Dentist to Timeslot
        case '4':
            const timeslotUpdate = {};
            console.log("Please enter the necessary information");
            try {
                await assignDentist(timeslotUpdate);
                mqttClient.publish(MQTT_TOPICS['assignTimeslot'], JSON.stringify(timeslotUpdate));
                console.log(timeslotUpdate);
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
                mqttClient.publish(MQTT_TOPICS['assignTimeslot'], JSON.stringify(timeslotCancellation));
                console.log(timeslotCancellation);
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
            const noWhitespaceId = id.trim();
            if (!digitRegex.test(noWhitespaceId)) {
                reject('Invalid input. Please enter only digits for ID');
                return;                
            }
            newDentist.id = noWhitespaceId;

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

function fetchTimeslots() {
    const payload = {
        reqId: clinicId,
        clinicId: clinidMongoId
    }
    mqttClient.publish(MQTT_TOPICS['getTimeslots'], JSON.stringify(payload));
}

function assignDentist(timeslotUpdate) {
    return new Promise(async (resolve, reject) => {
        rl.question('Enter the Timeslot ID: ', (timeslotId) => {
            timeslotUpdate.timeslot = timeslotId;

            rl.question('Enter the Dentist ID: ', (dentistId) => {
                timeslotUpdate.dentist = dentistId;
                // TODO: this just displays the ID's change to something more descriptive
                rl.question(`Do you want to assign the following dentist ${dentistId} to this Timeslot ${timeslotId}? (Y/N): `, (answer) => {
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

function unassignDentist(timeslotCancellation) {
    return new Promise(async (resolve) => {
        rl.question('Enter the Timeslot ID: ', (timeslotId) => {
            timeslotCancellation.timeslot = timeslotId;
            timeslotCancellation.dentist = null;
            resolve();
        });
    });
}


//============================= MQTT EVENT LISTENERS =============================//
mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');

    // Append the clinicId to all topics and subscribe to each
    mqttClient.subscribe(Object.values(MQTT_TOPICS).map(topic => topic + clinicId), (error, granted) => {
        if(!error) {
            granted.forEach(key => {
                console.log(`Subscribed to messages on: ${key.topic}`);
            });
        }
        displayMainMenu();
        //displayLoginMenu(); // TODO: display login instead
    });
});

mqttClient.on('message', (topic, message) => {
    switch (topic) {
        case MQTT_TOPICS['getTimeslots'] + clinicId:
            try {
                const payload = JSON.parse(message);
                console.log('\n' + topic);
                console.log(payload);
        
            } catch (error) {
                console.log("Error when processing MQTT message: ", error);
            }
            break;
        case MQTT_TOPICS['createClinic'] + clinicId:
            // No confirmation sent for now
            break;
        case MQTT_TOPICS['createDentist'] + clinicId:
            // Dentist creation confirmation/rejection
        try {
            const payload = JSON.parse(message);
            console.log('\n' + topic);
            console.log(payload);
        } catch (error) {
            console.log("Error when processing MQTT message: ", error);
        }
            break;
        case MQTT_TOPICS['createTimeslot'] + clinicId:
            // Timeslot creation confirmation/rejection
            try {
                const payload = JSON.parse(message);
                console.log('\n' + topic);
                console.log(payload);
            } catch (error) {
                console.log("Error when processing MQTT message: ", error);
            }
            break;
        case MQTT_TOPICS['assignTimeslot'] + clinicId:
            // No confirmation sent for now
            break;
        case MQTT_TOPICS['bookingNotifications']:
            try {
                const payload = JSON.parse(message);
                const action = payload.status === 'BOOK' ? 'BOOKED' : 'CANCELLED';
                console.log(`Timeslot with the ID [${payload.timeslotId}] has been ${action}`);
            } catch (error) {
                console.log("Error when processing MQTT message: ", error);
            }
            break;
        default:
            console.error(`TopicError: Message received at unhandled topic "${topic}"`);
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
