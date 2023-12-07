const express = require("express");
const router = express.Router();
const mqtt = require('./mqtt.js');
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt");
const Patient = require('./patient');

router.use(express.json());

require('dotenv').config();                 // load environmental variables from .env file to process.env object

// generate jwt access token
function generateAccessToken(user) {
    // serialize user objecct into jwt using secret key and set expiration time
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20s'});
}

// generate jwt refresh token
function generateRefreshToken(user) {
    // serialize user object into jwt using secret key without expiration time
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
}

// register new patient
async function register(patient) {

    // declare response attributes
    const status = ({ code: "", message: "" });
    const data = ({ patient: "", accessToken: "" });

    try {
        const existingPatient = await Patient.findOne({ id: patient.id });
        // if patient doesn't already exist, create one 
        if (!existingPatient) { 
            const newPatient = new Patient(patient);

            // hash password using salt for greater security and update patient object
            const salt = await bcrypt.genSalt(); // default parameter 10
            const hashedPassword = await bcrypt.hash(newPatient.password, salt);
            newPatient.password = hashedPassword;

            // call functions to generate access and refresh tokens using patient id
            const accessToken = generateAccessToken({ id: newPatient.id });
            const refreshToken = generateRefreshToken({ id: newPatient.id });

            // store refresh token in patient object
            newPatient.refreshToken = refreshToken;

            // save the user to the DB
            await newPatient.save();

            // update response object attributes
            status.code = 201;
            status.message = "Patient created successfully"
            data.patient = newPatient;
            data.accessToken = accessToken;

        } else {
            // if patient already exists in the database
            status.code = 409;
            status.message = "Error: Patient already exists";
        }
    } catch (err) {
        status.code = 500;
        status.message = err.message;
    } finally {
        const response = `{
                           "Status": "${status}",
                           "Data": "${data}",
                          }`;
        return response;
    }
}

// log in user by providing access and refresh tokens
router.patch('/login', async (req, res) => {
    try {
        // extract user id and password from request body
        const userId = req.body.id;
        const userPassword = req.body.password;

        const patient = await Patient.findOne({ id: userId });

        if (!patient) {
            return res.status(404).json({ Error: 'Access forbidden: invalid patient ID' }); // resource not found
        }

        // compare hashed password in DB with hashed password provided by login request
        if(await bcrypt.compare(patient.password, userPassword)) {
            return res.status(403).json({ Error: "Access forbidden: invalid password"});
        }

        // call functions to generate access and refresh tokens using user object
        const accessToken = generateAccessToken({ id: userId });
        const refreshToken = generateRefreshToken({ id: userId });

        // patch patient with valid refresh token
        patient.refreshToken = refreshToken;
        await patient.save();
  
        // respond with access token
        res.json({ accessToken: accessToken});

    } catch(err) {
        res.status(500).json({Error: err.message});
    }
});

// log out user by deleting refresh token
router.delete('/logout', async(req, res) => {
    try {
        // extract user id from request body and find the resource from the DB
        const userId = req.body.id;
        const patient = await Patient.findOne({ id: userId });

        if (!patient) {
            return res.status(404).json({ Error: 'Access forbidden: invalid patient ID' }); // resource not found
        }
        // clear the refresh token
        patient.refreshToken = "";
        patient.save();

        res.status(204).json({ Message: 'Logged out successfully'});

    } catch(err) {
        res.status(500).json({ Error: err.message });
    }
});

// generate new access token using refresh token 
router.post('/token', async(req, res) => {
    try {
        const refreshToken = req.body.token;

        // if token is undefined, return 401 unauthorized
        if(refreshToken == null) {
            return res.status(401).json({ Error: "Access unauthorized: no valid authentication credentials" })
        }
        // decode refresh token to extract userId
        const userId = jwt.decode(refreshToken).id;

        // find patient by userId
        const patient = await Patient.findOne({ id: userId });

        if(!patient) {
            return res.status(404).json({ Error: 'Patient not found' }); // resource not found
        }

        // check if refresh token matches the token stored in patient resource
        if(patient.refreshToken !== refreshToken) {
            // if refresh token doesn't match, return 403 forbidden
            return res.status(403).json({ Error: "Access forbidden: authentication credentials invalid"});
        }
        // if refresh token matches, verify its validity
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err) => {
            // if token is invalid, return 403 forbidden
            if(err) {
                return res.status(403).json({ Error: "Access forbidden: authentication credentials invalid" });
            }
            // generate new access token using user object
            const accessToken = generateAccessToken({id: userId });
            res.json({ accessToken: accessToken });
        });
    } catch(err) {
        res.status(500).json({ Error: err.message });
    }
});

// export the router
module.exports = router;