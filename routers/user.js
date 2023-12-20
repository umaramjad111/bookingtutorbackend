// routes/users.js
const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const router = express.Router();
const User = require('../models/user')

// Register a new user
router.post('/register', async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const newUser = new User({ username, email, password });
      await newUser.save();
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // User login
router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const isPasswordValid = await user.comparePassword(password);
  
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid password' });
      }
  
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
      res.status(200).json({ token });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  router.get('/singleUser', async (req, res) => {
    try {
    //   const user = await User.findById(req.user.userId);
    //   res.status(200).json(user);
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log("token" , decoded)
    const user = await User.findOne({ _id: decoded.userId });
    console.log("user" , user)
    if(!user) return res.status(401).send({ message: 'Please Login to Continue!' });
    res.status(200).send(user);
    // res.status(200).send({ userData: user, message: 'Logged in Successfully.' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Read all users
router.get('/allUsers', async (req, res) => {
    try {
      const users = await User.find();
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Update a user
router.patch('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { username, email } = req.body;
      const updatedUser = await User.findByIdAndUpdate(id, { username, email }, { new: true });
      res.status(200).json(updatedUser);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

  // Delete a user
router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await User.findByIdAndDelete(id);
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });


  module.exports = router;