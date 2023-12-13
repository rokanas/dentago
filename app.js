// Read input
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Variables
// const clinicId = '';                 // The corresponding Clinic ID --> //TODO: fetch after successful login
const clinicId = 'greenHillZoneClinic'; // Placeholder hardcoded value - remove
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
    getTimeslots: 'dentago/availability/',
    createClinic: 'dentago/dentist/creation/clinics',
    createDentist: 'dentago/dentist/creation/dentists',
    createTimeslot: 'dentago/dentist/creation/timeslot',
    assignTimeslot: 'dentago/dentist/assignment/timeslot',
    bookingNotifications: 'dentago/booking/'
}

const authLogin = 'dentago/dentist/login/'; // TODO: implement this for the login functionality


//================================= MENU FUNCTIONS =================================//
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

//==================== MAIN MENU FUNCTIONS ====================//
// Function to handle user input and execute corresponding actions
async function handleMenuInput(choice) {
    switch (choice) {
        // Add new Dentist
        case '1':
            break;

        // Add new Timeslot
        case '2':
            break;
        
        // Get all Timeslots
        case '3':
            break;

        // Assign Dentist to Timeslot
        case '4':
            break;

        // Cancel booked Timeslot
        case '5':
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


//========================== MQTT EVENT LISTENERS ==========================//
mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');

    // Append the clinicId to all topics and subscribe to each
    mqttClient.subscribe(Object.values(MQTT_TOPICS).map(topic => topic + clinicId), (error, granted) => {
        if(!error) {
            granted.forEach(key => {
                console.log(`Subscribed to messages on: ${key.topic}`);
            });
        }
    });
});

mqttClient.on('message', (topic, message) => {
    switch (topic) {
        case MQTT_TOPICS['getTimeslots']:
            try {
                const payload = JSON.parse(message);
                console.log('\n' + topic);
                console.log(payload);
        
            } catch (error) {
                console.log("Error when processing MQTT message: ", error);
            }
            break;
        case MQTT_TOPICS['createClinic']:
            // No confirmation sent for now
            break;
        case MQTT_TOPICS['createDentist']:
            // No confirmation sent for now
            break;
        case MQTT_TOPICS['createTimeslot']:
            // No confirmation sent for now
            break;
        case MQTT_TOPICS['assignTimeslot']:
            // No confirmation sent for now
            break;
        case MQTT_TOPICS['bookingNotifications']:
            try {
                const payload = JSON.parse(message);
                const action = payload.status === 'BOOK' ? 'BOOKED' : 'CANCELLED';
                console.log(`Timeslot with the id [${payload.timeslotId}] has been ${action}`);
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
