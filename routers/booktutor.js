const mongoose = require('mongoose');
const router = require('express').Router();
const Student = require('../models/student');
const Teacher = require('../models/teacher');
const Booking = require('../models/booktutor');
const Notification = require('../models/notification');
const  {notifyStudentBookingAccepted}  = require("../helpers/notifyStudentBookingAccepted")

// Get all messages
router.post('/booktutor/:studentId/:teacherId', async (req, res) => {
    try {
        const { studentId , teacherId } = req.params;
        const { hourlyRate , subject, dateTime, duration, address , paymentDetails } = req.body;
        // Check if the student and teacher exist
        const student = await Student.findById(studentId);
        const teacher = await Teacher.findById(teacherId);
        console.log("object" , req.body)
        if (!student || !teacher) {
            return res.status(404).json({ error: 'Student or Teacher not found' });
        }

        const paymentDetailsNull =  {
            accountNumber: "",
            cvv: "",
            amount: "",
          };

        // Create a new booking
        const newBooking = new Booking({
            studentId: studentId,
            teacherId: teacherId,
            studentName: student.name, // Include student name
            teacherName: teacher.name, // Include teacher name
            subject,
            hourlyRate,
            dateTime,
            duration,
            address,
            status: 'pending',  // You can set an initial status, e.g., 'pending'
            payment: "pending",
            paymentDetails: paymentDetailsNull,
        });
        // Save the booking to the database
        await newBooking.save();


         // Update the teacher's and student's bookings arrays
    teacher.bookings.push(newBooking);
    await teacher.save();

    student.bookings.push(newBooking);
    await student.save();
        res.status(201).json(newBooking);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

  // Get all messages
  router.get('/', async (req, res) => {
    try {
        
      const allbookings = await Booking.find();
      res.json(allbookings); 
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });


  // GET studentsbookings from speicifc teacher 
router.get('/teacher/:teacherId/studentsbookings', async (req, res) => {
    try {
      const teacherId = req.params.teacherId;
   
      // Find the teacher and populate the bookings array with student details
      const teacher = await Teacher.findById(teacherId).populate({
        path: 'bookings',
        model: 'BookTutor',
        populate: { path: 'student' },
      });

      console.log("umar" , teacher)
  
      if (!teacher) {
        return res.status(404).json({ error: 'Teacher not found' });
      }

      if (!teacher.bookings || teacher.bookings.length === 0) {
        // If no bookings are found, return a specific message
        return res.status(404).json({ message: 'No bookings found for this teacher' });
      }
  
      // Extract only the relevant booking details
      const bookings = teacher.bookings.map(booking => ({
        bookingId: booking._id,
        studentId: booking.studentId,
        studentName: booking.studentName,
        subject: booking.subject,
        dateTime: booking.dateTime,
        duration: booking.duration,
        location: booking.location,
        hourlyRate: booking.hourlyRate,
        address: booking.address,
        status: booking.status,
      }));

      if(!bookings) res.json({message: "No Booking Found"})
  
      res.json(bookings);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });





  // status change from pending to accept when teacher accept that booking
  // POST /teachers/:teacherId/acceptBooking/:bookingId
router.post('/teacher/:teacherId/acceptBooking/:bookingId', async (req, res) => {
    try {
      const teacherId = req.params.teacherId;
      const bookingId = req.params.bookingId;
      console.log("umar" , teacherId , bookingId)
      // Find the teacher
      const teacher = await Teacher.findById(teacherId);
  
      if (!teacher) {
        return res.status(404).json({ error: 'Teacher not found' });
      }
  
      // Check if the bookingId is valid
      if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        return res.status(400).json({ error: 'Invalid bookingId' });
      }
  
      // Find the booking associated with the teacher and with a status of 'pending'
    //   const booking = await Booking.findOne({ _id: bookingId, teacherId: teacherId, status: 'pending' });
    const booking = await Booking.findOne({ _id: bookingId, teacherId: teacherId, status: 'pending' });

  
      if (!booking) {
        return res.status(404).json({ error: 'Pending booking not found for this teacher' });
      }
  
      console.log("umaradasd" , booking )
      // Update the booking status to 'accepted'
      booking.status = 'accepted';
      await booking.save();

      notifyStudentBookingAccepted(booking.studentId , teacherId , bookingId , booking.studentName,   teacher.name, "Your booking request has been accepted. Please proceed your payment...")
  

       // Find the student associated with the booking
    const student = await Student.findById(booking.studentId);

    if (student) {
      // Update the status in the student's bookings array
      // const studentBookingIndex = student.bookings.findIndex(b => b.equals(bookingId));
      // const studentBookingIndex = await student.bookings.findIndex({ _id: bookingId, teacherId: teacherId, status: 'pending' });
      const studentBookingIndex = student.bookings.findIndex((b) => b._id == bookingId);

      if (studentBookingIndex !== -1) {
        student.bookings[studentBookingIndex].status = 'accepted';
        await student.save();
      }
    }
      res.json({ message: 'Booking accepted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

    // status change from pending to accept when teacher reject that booking
  // POST /teachers/:teacherId/acceptBooking/:bookingId
router.post('/teacher/:teacherId/rejectBooking/:bookingId', async (req, res) => {
    try {
      const teacherId = req.params.teacherId;
      const bookingId = req.params.bookingId;
      console.log("umar" , teacherId , bookingId)
      // Find the teacher
      const teacher = await Teacher.findById(teacherId);
  
      if (!teacher) {
        return res.status(404).json({ error: 'Teacher not found' });
      }
  
      // Check if the bookingId is valid
      if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        return res.status(400).json({ error: 'Invalid bookingId' });
      }
  
      // Find the booking associated with the teacher and with a status of 'pending'
      const booking = await Booking.findOne({ _id: bookingId, teacherId: teacherId, status: 'pending' });
  
      if (!booking) {
        return res.status(404).json({ error: 'Pending booking not found for this teacher' });
      }
  
      // Update the booking status to 'accepted'
      booking.status = 'rejected';
      await booking.save();
  
      res.json({ message: 'Booking rejected successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  // remove notification and add payment
  router.post('/students/:studentId/fillPaymentForm/:bookingId', async (req, res) => {
    try {
      const studentId = req.params.studentId;
      const bookingId = req.params.bookingId;
      const { accountNumber, cvv, amount } = req.body;
  
      // Find the student
      const student = await Student.findById(studentId);
  
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
  
      // Check if the bookingId is valid
      if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        return res.status(400).json({ error: 'Invalid bookingId' });
      }
  
      // Find the booking associated with the student and booking
      const bookingIndex = student.bookings.findIndex((b) => b._id == bookingId);

      console.log("dasdas" ,  bookingIndex)
  
      if (bookingIndex === -1) {
        return res.status(404).json({ error: 'Booking not found for this student' });
      }
  
      // Implement your logic for filling out the payment form
      // For example, validate the payment information, integrate with a payment gateway, etc.
  
      // Placeholder: Update the booking's payment details
      student.bookings[bookingIndex].payment = 'paid';
      student.bookings[bookingIndex].paymentDetails = {
        accountNumber: accountNumber, // Mask the actual account number
        cvv: cvv, // Mask the actual CVV
        amount: parseFloat(amount), // Store the amount as a number
      };
  
     // Remove the notification for this booking
  student.notifications = student.notifications.filter((notif) => notif.bookingId && notif.bookingId.toString() !== bookingId.toString());
       // Fetch notifications for the specified student
      //  let notifications = await Notification.find({ studentId });
      let notifications = await Notification.find({studentId});

        const removeId = notifications.find((notif) => notif.bookingId && notif.bookingId == bookingId);
        console.log("remove" , removeId)
        console.log("umat" , notifications)
       
     // Update the notifications in the database
     await Notification.deleteOne({ bookingId: removeId.bookingId });
      await student.save();
  
      res.json({ message: 'Payment form filled out successfully. Payment status updated to paid.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


module.exports = router;