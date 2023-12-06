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