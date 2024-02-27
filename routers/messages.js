  
const router = require('express').Router();
const  User  = require('../models/student');
const  Teacher  = require('../models/teacher');
const  Message  = require('../models/message');

  // Get all messages
  router.get('/', async (req, res) => {
    try {
        
      const messages = await Message.find();
      res.json(messages);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });


  module.exports = router;

