require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const studentRoutes = require('./routers/student');
const teacherRoutes = require('./routers/teacher');
const messageRoutes = require('./routers/messages');
const bookingRoute = require('./routers/booktutor');
const notificationRoute = require('./routers/notification');
const userRoutes = require('./routers/user');
const http = require("http");
const socketIo = require('./socket'); 
// const { Server } = require("socket.io")
 // Load environment variables

const app = express();
app.use(cors());
const server = http.createServer(app);

// const io = new Server(server, {
//    cors: {
//     origin: "http://localhost:3002",
//     methods: ["GET" , "POST"]
//    },
// });

// Initialize Socket.IO
const io = socketIo.init(server);

// Middleware to attach Socket.IO instance to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});






app.use(express.json());


// Mongoose connection using environment variable
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});


// Routes
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/bookings', bookingRoute);
app.use('/api/notifications', notificationRoute);

// io.on("connection" , (socket) => {
//   console.log(`socket id: ${socket.id}`);
//   socket.on("disconnect" , () => {
//     console.log("User Disconnected" , socket.id)
//   })
// });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});


// Start the server
const PORT = process.env.PORT || 9000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});