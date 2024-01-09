const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const studentSchema = new mongoose.Schema({
    name: {
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
    messages: [{ from: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }, role: {type: String} , name: {type: String} ,  message: {type: String} , timestamp: {type: Date , default: Date.now} }],
});

studentSchema.methods.generateAuthToken = function () {
    const token = jwt.sign(
        {
            _id: this._id,
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1d" }
    );
    return token;
}

const Student = mongoose.model('Student', studentSchema); // Create the Data model

module.exports = Student; // Export the Data model
