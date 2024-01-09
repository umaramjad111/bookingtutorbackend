const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const teacherSchema = new mongoose.Schema({
    name: {
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
    description:{
        type: String,
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
    // messages: [{ from: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' }, message: String }],
    messages: [{ from: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' }, role: {type: String} , name: {type: String} , message: {type: String} , timestamp: {type: Date , default: Date.now} }],
});

teacherSchema.methods.generateAuthToken = function () {
    const token = jwt.sign(
        {
            _id: this._id,
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1d" }
    );
    return token;
}

const Teacher = mongoose.model('Teacher', teacherSchema); // Create the Data model

module.exports = Teacher; // Export the Data model
