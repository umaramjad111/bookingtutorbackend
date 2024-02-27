const mongoose = require('mongoose');

// Message schema
const messageSchema = new mongoose.Schema({
studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
  },
  role: {
    type: String,
    // enum: ['teacher', 'student'], // Role can be 'teacher' or 'student'
  },
  message: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  studentName: {type: String},
  teacherName: {type: String},
});

const message = mongoose.model('Message', messageSchema); // Create the Data model

module.exports = message; 