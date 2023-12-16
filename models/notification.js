const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    category: { // I wanted to use type but I thought it was going to be a problem since it's a keyword
        type: String,
        enum: ['CANCEL', 'RESCHEDULE', 'RECOMMENDATION'], // There are only two types for now
        required: true
    },
    message: {
        type: String,
        required: true
    },
    timeslots: [{
        type: Schema.Types.ObjectId, ref: "Timeslot",
        required: true
    }],
    read: {
        type: Boolean,
        default: false
    }

}, { timestamps: true }); // Timestamp for the notification

module.exports = mongoose.model("Notification", notificationSchema);