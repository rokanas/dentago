const express = require('express');         // web app framework
const mongoose = require('mongoose');       // mongoDB data structuring and schema validation
const path = require('path');               // handles file paths
const mqtt = require('./mqtt.js');          // contains mqtt functions

// import environmental variables
require('dotenv').config();                 // load environmental variables from .env file to process.env object

const mongoURI = process.env.MONGODB_URI || process.env.CI_MONGODB_URI;
const host = process.env.HOST || process.env.CI_HOST;
const port = process.env.PORT || process.env.CI_PORT;

// subscribe to mqtt topics
mqtt.subscribe("dentago/");

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

// create Express app
const app = express();

app.listen(port, function(err) {
    if (err) throw err;
    console.log(`Express server listening on port ${port}, in ${env} mode`);
    console.log(`Backend: ${host}:${port}/api/`);
    console.log(`Frontend (production): ${host}:${port}/`);
});

module.exports = app;