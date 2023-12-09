const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// define schema for status subresource
const statusSchema = new Schema({
    code: {
        type: Number,
        required: true
    },
    message: {
        type: String,
        required: true
    }
});

// define schema for log resource
const logSchema = new Schema({
    topic: {
        type: String,
        required: true
    },
    service: {
        type: String,
        required: true
    },
    direction: {
        type: String,
        required: true
    },
    status: {
        type: statusSchema,
        required: true
    },
    reqId: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Log", logSchema);