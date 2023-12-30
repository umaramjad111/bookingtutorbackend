const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    teacherName: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        // required: true
    },
    description: {
        type: String,
        // required: true
    },
    price: {
        type: String,
        // required: true
    },
    education: {
        type: String,
        // required: true
    },
    location: {
        type: String,
        // required: true
    },
    age: {
        type: String,
        // required: true
    },
    gender: {
        type: String,
        // required: true
    },
    email: {
        type: String,
        // required: true,
        // unique: true
    },
    password: {
        type: String,
        required: true
    },
    verified: {type: Boolean, default: false},
});

const Teacher = mongoose.model('Teacher', teacherSchema); // Create the Data model

module.exports = Teacher; // Export the Data model
