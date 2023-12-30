const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    studentName: {
        type: String,
        // required: true
    },
    subject: {
        type: String,
        // required: true
    },
    age: {
        type: Number,
        // required: true
    },
    gender: {
        type: String,
        // required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    verified: {type: Boolean, default: false},
});

const Student = mongoose.model('Student', studentSchema); // Create the Data model

module.exports = Student; // Export the Data model
