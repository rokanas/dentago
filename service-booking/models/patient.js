import mongoose from "mongoose";
import notificationSchema from './notification.js'

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

const patientSchema = new Schema({
    id: {
        type: String,
        unique: true,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        // get fullName by concatenating first and last names
        get: function () {
            return `${this.firstName} ${this.lastName}`;
        },
        // set new fullName by splitting first and last names
        set: function (fullName) {
            const names = fullName.split(' ');
            this.firstName = names[0] || '';
            this.lastName = names[1] || '';
        }
    },
    password: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String,
        unique: true
    },
    notifications: [{
        type: notificationSchema.schema, 
        ref: "Notification",
        default: [],
        required: false
    }],
    schedulePreferences: {
        type: preferenceSchema,
        default: null,
        required: false
    }
});

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;
