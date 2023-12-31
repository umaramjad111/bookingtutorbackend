const router = require('express').Router();
const  User  = require('../models/student');
const bcrypt = require('bcrypt');
const Token = require('../models/token');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const path = require("path");
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

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

        res.status(200).send({ message: 'Email Verified Successfully' });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});


router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
  
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
      res.status(200).json({ message: 'Login successfully' , user });
    } catch (error) {
      res.status(500).json({ error: error.message });
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