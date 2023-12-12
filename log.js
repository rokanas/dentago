const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// define schema for log subresource
const logSchema = new Schema({
    timeStamp: {
        type: String,
        required: true
    },
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
        type: String,
        required: true
    },
    reqId: {
        type: String,
        required: true
    }
});

// define schema for log collection
const logCollectionSchema = new Schema({
    timeStamp: {
        type: String,
        required: true
    },
    logCollection: {
        type: [logSchema],
        required: true
    }
});

module.exports = mongoose.model("LogCollection", logCollectionSchema);