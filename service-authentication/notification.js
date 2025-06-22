const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    category: {
        type: String,
        enum: ['CANCEL', 'RESCHEDULE', 'RECOMMENDATION'],
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
