const mongoose = require('mongoose');       // mongoDB data structuring and schema validation
const mqtt = require('./mqtt.js');          // contains mqtt functions
const controller = require('./controller'); // contains message parsing and logging functions

// import environmental variables
require('dotenv').config();                 // load environmental variables from .env file to process.env object

const mongoURI = process.env.MONGODB_URI || process.env.CI_MONGODB_URI;

// subscribe to mqtt topics
mqtt.subscribe("dentago/authentication/#"); 
mqtt.subscribe("dentago/availability/#");   
mqtt.subscribe("dentago/booking/#");               
mqtt.subscribe("dentago/dentist/#");
mqtt.subscribe("dentago/monitor/logging/ping");

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => {
    console.log(`Connected to MongoDB with URI: ${mongoURI}`);

    // call function to save logs stored in JSON file to database
    controller.saveLogs();
  })
  .catch((err) => {
    console.error(`Failed to connect to MongoDB with URI: ${mongoURI}`);
    console.error(err.stack);
    process.exit(1);
  });

// periodically call function to save logs again
setInterval(controller.saveLogs, 600000); // every 10 minutes