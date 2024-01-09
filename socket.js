// socket.js
const socketIo = require('socket.io');

let io;

module.exports = {
  init: (httpServer) => {
    io = socketIo(httpServer);
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.IO not initialized!');
    }
    return io;
  },
};