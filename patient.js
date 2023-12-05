const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
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
    }
});

module.exports = mongoose.model("User", userSchema);