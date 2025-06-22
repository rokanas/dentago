const express = require('express');
const mqtt = require('../mqtt.js');
const generateId = require('../utils/generateId.js');
const delay = require('../utils/delay.js');
const messageManager = require('../utils/messageManager.js');
const router = express.Router();


/*==================  ROUTE HANDLERS ================== */
/*====================  USER AUTH  ==================== */

// register new patient
router.post('/register', async (req, res) => {
    try {
        // create patient object using request body
        const patient = req.body;

        // generate random request ID
        const reqId = generateId();

        // create payload as JSON string
        const pubPayload = `{
                             "status": { "message": "Request to register new patient" },
                             "patient": ${JSON.stringify(patient)},
                             "reqId": "${reqId}"
                            }`;

        // publish payload to authentication service
        const pubTopic = 'dentago/authentication/register';
        mqtt.publish(pubTopic, pubPayload);

        // subscribe to topic to access token payload
        const subTopic = 'dentago/authentication/register/' + reqId;
        mqtt.subscribe(subTopic);

        // promise to wait for the message to arrive by adding new listener to message event manager
        const subPayloadPromise = new Promise(resolve => {
            messageManager.addListener(reqId, function registerEndpoint(data) {
                resolve(data);
            });
        });

        // store payload once promise is resolved, or time out after a delay
        const subPayload = await Promise.race([subPayloadPromise, delay(10000)]).then(data => {
 
            // unsubscribe from the topic after receiving the message or timing out
            mqtt.unsubscribe(subTopic);

            // remove listener from the message event manager
            messageManager.removeListener(reqId);
    
            // return message payload
            return data;
        });

        // if no payload received in time
        if(!subPayload) {
            return res.status(504).json({ Error: 'Request timeout: no response received from authentication service'})
        }

        // respond with relevant status code and message, patient data and access token
        res.status(subPayload.status.code).json({ 
            Message: subPayload.status.message, 
            Patient: subPayload.patient,
            AccessToken: subPayload.accessToken
        });

    } catch(err) {
        // internal server error
        res.status(500).json({Error: err.message});  
    }
});

router.patch('/login', async (req, res) => {
    try {
        // extract id and password from request body
        const userId = req.body.id;
        const password = req.body.password;

        // generate random request ID
        const reqId = generateId();

        // create payload as JSON string
        const pubPayload = `{
                             "status": { "message": "Request to login patient" },
                             "id": "${userId}",
                             "password": "${password}",
                             "reqId": "${reqId}"
                            }`;

        // publish payload to authentication service
        const pubTopic = 'dentago/authentication/login';
        mqtt.publish(pubTopic, pubPayload);

        // subscribe to topic to access token payload
        const subTopic = 'dentago/authentication/login/' + reqId;
        mqtt.subscribe(subTopic);

        // promise to wait for the message to arrive by adding new listener to message event manager
        const subPayloadPromise = new Promise(resolve => {
            messageManager.addListener(reqId, function loginEndpoint(data) {
                resolve(data);
            });
        });

        // store payload once promise is resolved, or time out after a delay
        const subPayload = await Promise.race([subPayloadPromise, delay(10000)]).then(data => {
 
            // unsubscribe from the topic after receiving the message or timing out
            mqtt.unsubscribe(subTopic);

            // remove listener from the message event manager
            messageManager.removeListener(reqId);
    
            // return message payload
            return data;
        });

        // if no payload received in time
        if(!subPayload) {
            return res.status(504).json({ Error: 'Request timeout: no response received from authentication service'})
        }
        
        // respond with relevant status code and message, patient data and access token
        res.status(subPayload.status.code).json({ 
            Message: subPayload.status.message, 
            Patient: subPayload.patient,
            AccessToken: subPayload.accessToken
        });

    } catch (err) {
        // internal server error
        res.status(500).json({Error: err.message});  
    }
});

router.post('/refresh', async (req, res) => {
    try {
        // extract refresh token from request body
        const refreshToken = req.body.token;

        // generate random request ID
        const reqId = generateId();

        // create payload as JSON string
        const pubPayload = `{
                             "status": { "message": "Request to refresh access token" },
                             "refreshToken": "${refreshToken}",
                             "reqId": "${reqId}"
                            }`;       

        // publish payload to authentication service
        const pubTopic = 'dentago/authentication/refresh';
        mqtt.publish(pubTopic, pubPayload);

        // subscribe to topic to access token payload
        const subTopic = 'dentago/authentication/refresh/' + reqId;
        mqtt.subscribe(subTopic);

        // promise to wait for the message to arrive by adding new listener to message event manager
        const subPayloadPromise = new Promise(resolve => {
            messageManager.addListener(reqId, function refreshEndpoint(data) {
                resolve(data);
            });
        });

        // store payload once promise is resolved, or time out after a delay
        const subPayload = await Promise.race([subPayloadPromise, delay(10000)]).then(data => {
 
            // unsubscribe from the topic after receiving the message or timing out
            mqtt.unsubscribe(subTopic);

            // remove listener from the message event manager
            messageManager.removeListener(reqId);
    
            // return message payload
            return data;
        });

        // if no payload received in time
        if(!subPayload) {
            return res.status(504).json({ Error: 'Request timeout: no response received from authentication service'})
        }

        // respond with relevant status code and message, patient data and access token
        res.status(subPayload.status.code).json({ 
            Message: subPayload.status.message, 
            AccessToken: subPayload.accessToken
        });
    } catch(err) {
        // internal server error
        res.status(500).json({ Error: err.message });  
    }
});

router.patch('/logout', async (req, res) => {
    try {
        // extract user id from request body
        const userId = req.body.id;
        console.log('REQUEST FOR THE LOGOUT!');
        console.log(req.body);
    
        // generate random request ID
        const reqId = generateId();

        // create payload as JSON string
        const pubPayload = `{
                             "status": { "message": "Request to logout patient" },
                             "id": "${userId}",
                             "reqId": "${reqId}"
                            }`;       

        // publish payload to authentication service
        const pubTopic = 'dentago/authentication/logout';
        mqtt.publish(pubTopic, pubPayload);

        // subscribe to topic to access token payload
        const subTopic = 'dentago/authentication/logout/' + reqId;
        mqtt.subscribe(subTopic);

        // promise to wait for the message to arrive by adding new listener to message event manager
        const subPayloadPromise = new Promise(resolve => {
            messageManager.addListener(reqId, function logoutEndpoint(data) {
                resolve(data);
            });
        });

        // store payload once promise is resolved, or time out after a delay
        const subPayload = await Promise.race([subPayloadPromise, delay(10000)]).then(data => {
 
            // unsubscribe from the topic after receiving the message or timing out
            mqtt.unsubscribe(subTopic);

            // remove listener from the message event manager
            messageManager.removeListener(reqId);
    
            // return message payload
            return data;
        });

        // if no payload received in time
        if(!subPayload) {
            return res.status(504).json({ Error: 'Request timeout: no response received from authentication service'})
        }

        // respond with relevant status code and message, patient data and access token
        res.status(subPayload.status.code).json({ 
            Message: subPayload.status.message
        });

    } catch(err) {
        // internal server error
        res.status(500).json({ Error: err.message });
    }
});

// export the router
module.exports = router;