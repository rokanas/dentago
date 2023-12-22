const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const preferenceSchema = new Schema({
    Monday: [{
        type: Number,
        min: 0,
        max: 23,
        unique: false,
        required: false,
        validate : {
            validator : Number.isInteger,
            message   : '{VALUE} is not an integer value'
          }
    }],
    Tuesday: [{
        type: Number,
        min: 0,
        max: 23,
        unique: false,
        required: false,
        validate : {
            validator : Number.isInteger,
            message   : '{VALUE} is not an integer value'
          }
    }],
    Wednesday: [{
        type: Number,
        min: 0,
        max: 23,
        unique: false,
        required: false,
        validate : {
            validator : Number.isInteger,
            message   : '{VALUE} is not an integer value'
          }
    }],
    Thursday: [{
        type: Number,
        min: 0,
        max: 23,
        unique: false,
        required: false,
        validate : {
            validator : Number.isInteger,
            message   : '{VALUE} is not an integer value'
          }
    }],
    Friday: [{
        type: Number,
        min: 0,
        max: 23,
        unique: false,
        required: false,
        validate : {
            validator : Number.isInteger,
            message   : '{VALUE} is not an integer value'
          }
    }],
    Saturday: [{
        type: Number,
        min: 0,
        max: 23,
        unique: false,
        required: false,
        validate : {
            validator : Number.isInteger,
            message   : '{VALUE} is not an integer value'
          }
    }],
    Sunday: [{
        type: Number,
        min: 0,
        max: 23,
        unique: false,
        required: false,
        validate : {
            validator : Number.isInteger,
            message   : '{VALUE} is not an integer value'
          }
    }]
});

module.exports = mongoose.model("Preference", preferenceSchema);