const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
    studentId: {
        type: String,
    },
    teacherId: {
        type:String,
    },
    bookingId: {
        type: String
    },
  message: String,
  teachername: String,
  studentname: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
    });

    const tutor = mongoose.model('Notification', notificationSchema); // Create the Data model

module.exports = tutor; 