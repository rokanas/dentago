const crypto = require('crypto');

// generate random ID for each request
function generateId() {
    const id = crypto.randomBytes(8).toString("hex");
    return id;
}

// export the function
module.exports = generateId;