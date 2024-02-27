const router = require('express').Router();
const  Teacher  = require('../models/teacher');
const  User  = require('../models/student');
const  Message  = require('../models/message');
const bcrypt = require('bcrypt');
const Token = require('../models/token');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const path = require("path");
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const { getIO } = require('../socket');

router.post('/create', async (req, res) => {
   
    try {
        // const { error } = validate(req.body);
        // if (error)
        //     return res.status(400).send({ message: error.details[0].message });

        let teacher = await Teacher.findOne({ email: req.body.email });
        if (teacher)  return res.status(409).send({ message: 'Teacher already registered.' });

        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const passwordHash = await bcrypt.hash(req.body.password, salt);
        // userImage: req.file.filename,
        teacher = await new Teacher({ ...req.body, password: passwordHash }).save();

        const token = await new Token({
            userId: teacher._id,
            token: crypto.randomBytes(32).toString('hex'),
        }).save();
        const url = `${process.env.BASE_URL}api/teachers/${teacher._id}/verify/${token.token}`; 
        
        await sendEmail(teacher.email, 'Email Verification', url);
        console.log({message: "Already Send an Email Please Verify."})
        
        res.status(200).send({message: "Already Send an Email Please Verify."});
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
    }
});


router.get('/:id/verify/:token', async (req, res) => {
    try {
        const teacher = await Teacher.findOne({ _id: req.params.id });
        if (!teacher)
            return res.status(400).send({ message: 'Invalid Link' });

        const token = await Token.findOne({ userId: teacher._id, token: req.params.token });
        if (!token)
            return res.status(400).send({ message: 'Invalid Link or Expired' });

        await Teacher.findOneAndUpdate({ _id: teacher._id }, { verified: true });

        await Token.deleteOne({ _id: token._id });

        const htmlMessage = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verified</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              text-align: center;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #fff;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              padding: 30px;
            }
            h1 {
              color: #333;
            }
            p {
              color: #666;
            }
            .btn {
              display: inline-block;
              padding: 10px 20px;
              margin-top: 20px;
              text-decoration: none;
              background-color: #007bff;
              color: #fff;
              border-radius: 5px;
              transition: background-color 0.3s ease;
            }
            .btn:hover {
              background-color: #0056b3;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Email Verified Successfully</h1>
            <p>Your email has been successfully verified. You can close this window or go back to the application.</p>
          </div>
        </body>
      </html>
    `;

        // res.status(200).send({ message: 'Email Verified Successfully' });
        res.status(200).send(htmlMessage);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const teacher = await Teacher.findOne({ email });
  
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found.' });
      }
  
      if (!teacher.verified) {
        return res.status(403).json({ message: 'Email not verified.' });
      }
  
      const passwordMatch = await bcrypt.compare(password, teacher.password);
  
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid password.' });
      }

        // Check if user is already online
    // if (teacher.isOnline) {
    //   return res.status(200).json({ message: 'Teacher already logged in.' });
    // }

      teacher.isOnline = true;
      await teacher.save();

      let token = null;

      if(teacher) {
        token = teacher.generateAuthToken();
        res.status(200).send({ userData: teacher, tokens: {access_token: token, expires_in: "1d"} , message: 'Logged in Successfully.' });
    }
  
      // // Password is correct, proceed with login
      // res.status(200).json({ message: 'Login successfully' , teacher });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


  router.post('/logout', async (req, res) => {
   
  
    try {
     const { email } = req.body;
      const teacher = await Teacher.findOne({ email });
      teacher.isOnline = false;
      await teacher.save();  
      res.status(200).send(teacher)
      // res.status(200).json({ message: 'Login successfully' , user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


  // Get all users
router.get('/all', async (req, res) => {
    try {
        
      const teachers = await Teacher.find();
      console.log("object" , teachers)
      res.json(teachers);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

          // Read a single item by ID
router.get('/get/:id', async (req, res) => {
    try {
      const itemId = req.params.id;
      const item = await Teacher.findById(itemId);
  
      if (!item) {
        return res.status(404).json({ message: 'Teacher not found' });
      }
  
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });


  // specific chat individual between student and teacher 
  router.get('/get/:studentId/:teacherId', async (req, res) => {
    try {
      const { studentId, teacherId } = req.params;
  
      // Find the student by studentId
      const teacher = await Teacher.findById(teacherId);
  
      if (!teacher) {
        return res.status(404).json({ message: 'teacher not found' });
      }
  
      // Find the specific chat messages for the given teacherId
      const studentMessages = teacher.messages.filter(
        message => String(message.from) === studentId
      );
  
      res.json(studentMessages );
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });


  // specific students which students send message to which teacher 
  router.get('/getstudents/:teacherId', async (req, res) => {
    try {
      const { teacherId } = req.params;
  
      // const students = await User.find({
      //   'messages.from': teacherId, // Consider messages where the role is 'student'
      // });

      // console.log("umar" , teacherId , students)
  
      // if (!students || students.length === 0) {
      //   return res.status(404).json({ message: 'No students found for this teacher' });
      // }
  
      // // Extract details of students who sent messages to the teacher
      // const studentDetails = students.map(student => ({
      //   studentId: student._id,
      //   studentName: student.name,
      //   studentEmail: student.email,
      //   subject: student.subject,
      //   teacherId: teacherId
      //   // Add more fields as needed
      // }));
  
      // res.json({ students: studentDetails });
      // res.json(studentDetails);

      const allMessages = await Message.find({ teacherId: teacherId });
      const studentIdsWithMessages = allMessages.map(message => message.studentId);
      
      const studentsWithMessages = await User.find({ _id: { $in: studentIdsWithMessages } });
      
      res.json(studentsWithMessages);

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });





  // Send a message from a student to a teacher
router.post('/messages/:studentId/:teacherId', async (req, res) => {
  try {
    const { studentId , teacherId  } = req.params;
    const {  message  } = req.body;
    const sender = await User.findById(studentId);
    const receiver = await Teacher.findById(teacherId);

    const newMessage = new Message({
      studentId: studentId,
      teacherId: teacherId,
      message,
      role: 'teacher',
      studentName: sender.name,
      teacherName: receiver.name,
    });

    await newMessage.save();
    res.json(newMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get('/getstudentmessages/:studentId/:teacherId', async (req, res) => {
  try {
    const { studentId, teacherId } = req.params;

    // Find the student by studentId
    const allmessages = await Message.find();

    console.log("dda" , allmessages , teacherId)
    const allmessage = allmessages.filter((item) => item.studentId == studentId && item.teacherId == teacherId && item.role === "student")

    res.json(allmessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

  
  

  //send message to teacher

router.post('/sendmessage/:studentId/:teacherId', async (req, res) => {
  try {
    
    const { studentId , teacherId } = req.params;
    const {  message } = req.body;

    console.log("object" , studentId , teacherId , message)
                            
    const student = await User.findById(studentId);
    const teacher = await Teacher.findById(teacherId);

    console.log("umaramjad" , student , teacher)

    if (!student || !teacher) {
      return res.status(404).json({ message: 'Student or Teacher not found' });
    }

    student.messages.push({ from: teacherId, message , role: "teacher" , name: teacher.name });
    await student.save();

    const io = getIO();
    io.to(student).emit('teacherSendMessage', { from: teacherId, message });

    res.status(200).json({ message: 'Message sent to Student', student });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;

