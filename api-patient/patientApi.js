const express = require('express');         // web app framework
const mongoose = require('mongoose');       // mongoDB data structuring and schema validation
const morgan = require('morgan');           // logs HTTP requests in the terminal
const path = require('path');               // handles file paths
const cors = require('cors');               // handles cross-origin requests (relevant for production)
const history = require('connect-history-api-fallback'); // enables error-free client-side routing
const mqtt = require('./mqtt')

// import controller files containing endpoints
const apiController = require('./controllers/apiController');
const availabilityController = require('./controllers/availabilityController');
const bookingController = require('./controllers/bookingController');
const authController = require('./controllers/authController');
const notificationController = require('./controllers/notificationController');
const recommendationController = require('./controllers/recommendationController');

// load environmental variables from .env file to process.env object
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI || process.env.CI_MONGODB_URI;
const host = process.env.HOST || process.env.CI_HOST;
// const port = process.env.PORT || process.env.CI_PORT;
const port = process.argv[2] || 3000; // Use the port provided as a command-line argument or default to 3000

// function to subscribe to notification and monitoring service topics
function subscribeTopics() {
  mqtt.subscribe('dentago/notifications/+');
  mqtt.subscribe('dentago/monitor/patient/ping')
}

// connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => {
    console.log(`Connected to MongoDB with URI: ${mongoURI}`);

    // upon connecting to the DB, call function to subscribe to topics
    subscribeTopics();
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

  // import routes
  app.use('/api', apiController);
  app.use('/api', authController);
  app.use('/api', availabilityController);
  app.use('/api', bookingController);
  app.use('/api', notificationController.router);
  app.use('/api', recommendationController);

  // catch all non-error handler for api (i.e., 404 Not Found)
  app.use('/api/*', function (_, res) {
      res.status(404).json({ 'message': 'Not Found' });
  });

// configuration for serving frontend in production mode
// support Vuejs HTML 5 history mode
app.use(history());
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
    // TODO: This formatting doesn't work due to the extra '/' after host.
    // http://localhost/:3000/ -> http://localhost:3000/
    // It is not important but it can be fixed later
    console.log(`Express server listening on port ${port}, in ${env} mode`);
    console.log(`Backend: ${host}:${port}/api/`);
    console.log(`Frontend (production): ${host}:${port}/`);
});

module.exports = app;