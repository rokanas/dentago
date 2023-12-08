const express = require('express');         // web app framework
const mongoose = require('mongoose');       // mongoDB data structuring and schema validation
const morgan = require('morgan');           // logs HTTP requests in the terminal
const path = require('path');               // handles file paths
const cors = require('cors');               // handles cross-origin requests (relevant for production)
const mqtt = require('./mqtt.js');          // contains mqtt functions
const controller = require('./controller'); // file containing HTTP request endpoints

// variables
require('dotenv').config();                 // load environmental variables from .env file to process.env object

const mongoURI = process.env.MONGODB_URI || process.env.CI_MONGODB_URI;
const host = process.env.HOST || process.env.CI_HOST;
const port = process.env.PORT || process.env.CI_PORT;

// subscribe to authentiation mqtt topics
mqtt.subscribe("dentago/authentication/register");

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
// parse requests of content-type 'application/json'
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// HTTP request logger
app.use(morgan('dev'));
// enable cross-origin resource sharing for frontend must be registered before api
app.options('*', cors());
app.use(cors());

// serve static assets
let root = path.normalize(__dirname + '/..');
let client = path.join(root, 'client', 'dist');
app.use(express.static(client));

// error handler (i.e., when exception is thrown) must be registered last
const env = app.get('env');
// eslint-disable-next-line no-unused-vars
app.use(function(err, req, res, next) {
    console.error(err.stack);
    let err_res = {
        'message': err.message,
        'error': {}
    };
    if (env === 'development') {
        // return sensitive stack trace only in dev mode
        err_res['error'] = err.stack;
    }
    res.status(err.status || 500);
    res.json(err_res);
});

app.listen(port, function(err) {
    if (err) throw err;
    console.log(`Express server listening on port ${port}, in ${env} mode`);
    console.log(`Backend: ${host}:${port}/api/`);
    console.log(`Frontend (production): ${host}:${port}/`);
});

module.exports = app;