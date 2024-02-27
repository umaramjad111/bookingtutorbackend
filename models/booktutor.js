const mongoose = require('mongoose');
const booktutorSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
      teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
      },
      teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
      },
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
      dateTime: {
        type: String,
      },
      subject: {
        type: String,

      },
      duration: {
        type: String ,
      },
      address: {
        type: String,
      },
      hourlyRate: {
        type: Number,
      },
      status: {
        type: String,
      },
      payment:{
        type: String,
      },
      paymentDetails: {
        accountNumber: {
          type: String,
          // required: true,
        },
        cvv: {
          type: String,
          // required: true,
        },
        amount: {
          type: String,
          // required: true,
        },
      },
     
      studentName: String, // Include student name
      teacherName: String, // Include teacher name
    });

    const tutor = mongoose.model('BookTutor', booktutorSchema); // Create the Data model

module.exports = tutor; 