const express = require("express");
const router = express.Router();
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
async function register(message) {
    // parse received MQTT payload to JSON
    const parsedMessage = JSON.parse(message);        

    // declare response data
    const response = {
        status: {
            code: "",
            message: ""
        },
        patient: "",
        accessToken: "",
        reqId: parsedMessage.reqId
    };
    
    try {
        // extract user id from parsed message
        const reqUserId = parsedMessage.patient.id;

        // check if patient already exists
        const existingPatient = await Patient.findOne({ id: reqUserId });
        
        // if patient doesn't already exist, create one 
        if (!existingPatient) { 
            const newPatient = new Patient(parsedMessage.patient);

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

            // update attributes and return object
            response.status.code = 201;
            response.status.message = "Patient created successfully"
            response.patient = newPatient;
            response.accessToken = accessToken;
            return JSON.stringify(response);

        } else {
            // if patient already exists in the database
            response.status.code = 409;
            response.status.message = "Error: Patient already exists";
            return JSON.stringify(response);
        }

    } catch (err) {
        // if there is an internal error
        response.status.code = 500;
        response.status.message = err.message;
        return JSON.stringify(response);
    }
}

// log in user by providing access and refresh tokens
async function login(message) {
    // parse received MQTT payload to JSON
    const parsedMessage = JSON.parse(message);

    // declare response data
    const response = {
        status: {
            code: "",
            message: ""
        },
        patient: "",
        accessToken: "",
        reqId: parsedMessage.reqId
    };

    try {
        // extract user id and password from parsed message
        const reqUserId = parsedMessage.id;
        const reqPassword = parsedMessage.password;

        // find patient in DB using provided id
        const patient = await Patient.findOne({ id: reqUserId });

        // if patient is not found in database, return 403
        if(!patient) {
            response.status.code = 404;
            response.status.message = 'Access forbidden: invalid patient ID';
            return JSON.stringify(response);
        }
        
        // compare hashed password in DB with hashed password provided by login request
        if(await bcrypt.compare(reqPassword, patient.password)) {
            // call functions to generate access and refresh tokens using user object
            const accessToken = generateAccessToken({ id: patient.id });
            const refreshToken = generateRefreshToken({ id: patient.id });

            // patch patient with valid refresh token
            patient.refreshToken = refreshToken;
            await patient.save()
                
            // update attributes and return response object
            response.status.code = 200;
            response.status.message = 'User logged in successfully';
            response.patient = patient;
            response.accessToken = accessToken;
            return JSON.stringify(response);

        } else {
            // if password in DB doesn't match password provided by login request
            response.status.code = 403;
            response.status.message = "Access forbidden: invalid password";
            return JSON.stringify(response);
        }

    } catch (err) {
        // if there is an internal error
        response.status.code = 500;
        response.status.message = err.message;
        return JSON.stringify(response);
    }
}

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
async function refresh (message) {

    // parse received MQTT payload to JSON
    const parsedMessage = JSON.parse(message);

    // declare response data
    const response = {
        status: {
            code: "",
            message: ""
        },
        accessToken: "",
        reqId: parsedMessage.reqId
    };
    
    try {
        // extract refresh token from parsed message
        const refreshToken = parsedMessage.refreshToken;

        // if token is undefined, return 401 unauthorized
        if(refreshToken == null) {
            response.status.code = 401;
            response.status.message = "Access unauthorized: no valid authentication credentials";
            return JSON.stringify(response);
        }
        
        // decode refresh token to extract userId
        const userId = jwt.decode(refreshToken).id;

        // find patient by userId
        const patient = await Patient.findOne({ id: userId });

        if(!patient) {
            // if patient is not found, return 404
            response.status.code = 404;
            response.status.message = "Patient not found";
            return JSON.stringify(response);
        }

        // check if refresh token matches the token stored in patient resource in the DB
        if(patient.refreshToken !== refreshToken) {
            // if refresh token doesn't match, return 403 forbidden
            response.status.code = 403;
            response.status.message = "Access forbidden: authentication credentials invalid";
            return JSON.stringify(response);
        }
        
        // if refresh token matches, verify its validity
        jwt.verify(refreshToken, response, process.env.REFRESH_TOKEN_SECRET, (err) => {
            // if token is invalid, return 403 forbidden
            if(err) {
                response.status.code = 403;
                response.status.message = "Access forbidden: authentication credentials invalid";
            }
            
            // generate new access token using user object and return it
            const accessToken = generateAccessToken({id: userId });
            response.status.code = 201;
            response.status.message = "Access token refreshed successfully ";
            response.accessToken = accessToken;
        });
        
        // return the result of verification (new access token or 403)
        return JSON.stringify(response);

    } catch (err) {
        // if there is an internal error
        response.status.code = 500;
        response.status.message = err.message;
        return JSON.stringify(response);
    }
}

// export the router
module.exports = {
    router,
    register,
    login,
    refresh
};