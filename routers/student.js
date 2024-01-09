const router = require('express').Router();
const  User  = require('../models/student');
const  Teacher  = require('../models/teacher');
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

        let user = await User.findOne({ email: req.body.email });
        if (user)  return res.status(409).send({ message: 'Student already registered.' });

        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const passwordHash = await bcrypt.hash(req.body.password, salt);
        // userImage: req.file.filename,
        user = await new User({ ...req.body, password: passwordHash }).save();

        const token = await new Token({
            userId: user._id,
            token: crypto.randomBytes(32).toString('hex'),
        }).save();
        const url = `${process.env.BASE_URL}api/students/${user._id}/verify/${token.token}`; 
        
        await sendEmail(user.email, 'Email Verification', url);
        console.log({message: "Already Send an Email Please Verify."})
        
        res.status(200).send({message: "Already Send an Email Please Verify."});
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
    }
});

router.get('/:id/verify/:token', async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id });
        if (!user)
            return res.status(400).send({ message: 'Invalid Link' });

        const token = await Token.findOne({ userId: user._id, token: req.params.token });
        if (!token)
            return res.status(400).send({ message: 'Invalid Link or Expired' });

        await User.findOneAndUpdate({ _id: user._id }, { verified: true });

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
      const user = await User.findOne({ email });
      // const user = await User.findOne({ email: req.body.email });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      if (!user.verified) {
        return res.status(403).json({ message: 'Email not verified.' });
      }
  
      const passwordMatch = await bcrypt.compare(password, user.password);
  
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid password.' });
      }
  
      // Password is correct, proceed with login

      let token = null;

      if(user) {
        token = user.generateAuthToken();
        res.status(200).send({ userData: user, tokens: {access_token: token, expires_in: "1d"} , message: 'Logged in Successfully.' });
    }

      // res.status(200).json({ message: 'Login successfully' , user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

        // Read a single item by ID
router.get('/get/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const item = await User.findById(itemId);

    if (!item) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/get/:studentId/:teacherId', async (req, res) => {
  try {
    const { studentId, teacherId } = req.params;

    // Find the student by studentId
    const student = await User.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Find the specific chat messages for the given teacherId
    const teacherMessages = student.messages.filter(
      message => String(message.from) === teacherId
    );

    res.json(teacherMessages );
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

    if (!student || !teacher) {
      return res.status(404).json({ message: 'Student or Teacher not found' });
    }

    teacher.messages.push({ from: studentId, message , role: "student" ,  name: student.name  });
    await teacher.save();

    const io = getIO();
    io.to(teacher).emit('studentSendMessage', { from: studentId, message });

    res.status(200).json({ message: 'Message sent to Teacher', teacher });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});






















// Create user and send verification email
// router.post('/create', async (req, res) => {
//     const { studentName,subject , age ,  gender, email, password } = req.body;
  
//     try {
//       const token = crypto.randomBytes(20).toString('hex');
//       const hashedPassword = await bcrypt.hash(password, 10);
//       const newUser = new User({
//         studentName,
//         subject,
//         age,
//         gender,
//         email,
//         password: hashedPassword,
//         verificationToken: token
//       });
  
//       await newUser.save();
//       await sendVerificationEmail(email, token);
  
//       res.status(201).json({ message: 'User created. Check your email for verification.' });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   });
  
//   // Verify email
//   router.get('/verify/:token', async (req, res) => {
//     const token = req.params.token;
  
//     try {
//       const user = await User.findOne({ verificationToken: token });
  
//       if (!user) {
//         return res.status(404).json({ message: 'Invalid token or user not found.' });
//       }
  
//       user.verified = true;
//       user.verificationToken = undefined;
//       await user.save();
  
//       res.status(200).json({ message: 'Email verified successfully.' });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   });

module.exports = router;