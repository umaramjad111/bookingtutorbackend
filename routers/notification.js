
const express = require('express');
const router = express.Router();
const Notification = require('../models/notification');

// Route to get all notifications for a specific student
router.get('/student/:studentId', async (req, res) => {
    try {
      const studentId = req.params.studentId;
     console.log("studentid" , studentId)
      // Query the database to find all notifications for the specified student
      const notifications = await Notification.find({ studentId });
  
      // Respond with the list of notifications
      res.json(notifications);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  module.exports = router;