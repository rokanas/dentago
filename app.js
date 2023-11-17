/**
 * The dentist API allows dentist to:
 * - Register open slots
 * - Be notified when slots have been booked
 * - Be notified when bookings have been cancelled
 */

// TODO: Decide how will the system send notifications

const API_INFO = Object.freeze({
    "message": "Oh, hi there! 😎",
    "description": "DentistAPI for the Dentago System",
    "version": 'v0.1.0',
});

const PORT = 5000;

const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (_, res) => {
    res.status(200).send(API_INFO);
});

app.post('/slots', (req, res) => {
    let isEmpty = Object.keys(req.body).length === 0;

    if (isEmpty)
    {
        return res.status(400).send('Empty body');
    }

    res.status(201).send('Created');
})

// TODO: Decide on a port
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
})
