const jwt = require('jsonwebtoken');

// middleware for jwt token authentication
function authenticateToken(req, res, next) {
    // token comes from auth portion of request header
    const authHeader = req.headers['authorization'];

    // if auth header is missing or not in the expected format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ Error: "Access unauthorized: no authentication credentials" });
    }

    // if we have auth header, return token portion
    const token = authHeader.split(' ')[1]; 

    // if token is undefined, return 401 unauthorized
    if(token === null) {
        return res.sendStatus(401).json({ Error: "Access unauthorized: no authentication credentials" });
    }

    // verify validity of access token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err) => {
        // if request has access token but token is no longer valid, return 403 forbidden
        if(err) {
            return res.status(403).json({ Error: "Access forbidden: authentication credentials invalid" });
        }
        // if access token is valid, proceed with request
        next();
    });
}

// export the token authentication function
module.exports = authenticateToken;