/**
 * The dentist API allows dentist to:
 * - Register open slots
 * - Be notified when slots have been booked
 * - Be notified when bookings have been cancelled
 */

/**
 * TOPICS:
 *      sub 'dentago/booking/res'
 * NOTIFICATIONS:
 *      server-sent-notifications?
 */

const API_INFO = Object.freeze({
    "message": "Oh, hi there! 😎",
    "description": "DentistAPI for the Dentago System",
    "version": 'v0.1.0',
});

// TODO: Decide on a port
const PORT = 5000;

const express = require('express');
const app = express();

app.use(express.json());

/**
 * Main endpoint to fetch version information
 */
app.get('/', (_, res) => {
    res.status(200).send(API_INFO);
});

/**
 * Get the info of a given dentist
 */
//TODO: Is this going to be provided by the UI?
app.get('/dentists/:dentist_id', (req, res) => {
    res.status(200).send('ALL DENTIST INFO');
});

/**
 * Get all the timeslots for a given dentist
 */
// TODO: define how dentist works (attributes)
app.get('/clinics/:clinic_id/slots/:dentist_id', (req, res) => {
    res.status(200).send('ALL DENTIST TIMESLOTS');
});

/**
 * Register a new open slot for this dentist
 */
// TODO: define how do we create the timeslots
app.patch('/clinics/:clinic_id/slots/', (req, res) => {
    let isEmpty = Object.keys(req.body).length === 0;

    if (isEmpty)
    {
        return res.status(400).send('Empty body');
    }

    res.status(201).send('Created');
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
});
