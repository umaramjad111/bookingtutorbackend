// routes/teachers.js
const Student = require('../models/student');
const Notification = require('../models/notification');
// Helper function to notify the student
async function notifyStudentBookingAccepted(studentId, teacher , bookingid, studentname,  name ,   message) {
    try {
      // Find the student
      const student = await Student.findById(studentId);
  
      if (!student) {
        console.error('Student not found for notification');
        return;
      }
  
      // Add the notification to the student's array
     
      student.notifications.push({
        studentId: studentId,
        studentname: studentname,
        teacherId: teacher,
        bookingId: bookingid,
        teachername: name,
        message,
      });

      const newNotificaiton = new Notification({
        studentId: studentId,
        teacherId: teacher,
        bookingId: bookingid,
        teachername: name,
        message,
      });

      await newNotificaiton.save();
      await student.save();
  
      // Implement your logic for sending the actual notification
      // This might include sending an email, a push notification, etc.
      console.log(`Notification sent to student ${studentId}: ${message}`);
    } catch (error) {
      console.error('Error notifying student:', error);
    }
  }

  module.exports = { notifyStudentBookingAccepted };
  