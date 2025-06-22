const mongoose = require('mongoose');       // mongoDB data structuring and schema validation
const path = require('path');               // handles file paths
const mqtt = require('./mqtt.js');          // contains mqtt functions

// import environmental variables
require('dotenv').config();                 // load environmental variables from .env file to process.env object

const mongoURI = process.env.MONGODB_URI || process.env.CI_MONGODB_URI;

// subscribe to authentiation mqtt topics and to monitoring service ping topic
mqtt.subscribe("dentago/authentication/register");
mqtt.subscribe("dentago/authentication/login");
mqtt.subscribe("dentago/authentication/logout");
mqtt.subscribe("dentago/authentication/refresh");
mqtt.subscribe("dentago/monitor/authentication/ping");

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => {
    console.log(`Connected to MongoDB with URI: ${mongoURI}`);
  })
  .catch((err) => {
    console.error(`Failed to connect to MongoDB with URI: ${mongoURI}`);
    console.error(err.stack);
    process.exit(1);
  });