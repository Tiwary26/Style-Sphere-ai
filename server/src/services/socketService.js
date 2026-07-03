const socketIo = require('socket.io');

let io;
const userSockets = new Map(); // Store userId -> socketId mapping

const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: '*', // Allow all origins for dev simplicity
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Register user ID with socket
    socket.on('register', (userId) => {
      if (userId) {
        userSockets.set(userId, socket.id);
        console.log(`User ${userId} associated with socket ${socket.id}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      // Clean up map
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          console.log(`Removed association for user ${userId}`);
          break;
        }
      }
    });
  });

  return io;
};

// Send real-time notification to a specific user
const sendRealTimeNotification = (userId, eventName, data) => {
  if (!io) return;
  const socketId = userSockets.get(userId.toString());
  if (socketId) {
    io.to(socketId).emit(eventName, data);
    console.log(`Sent real-time event "${eventName}" to user ${userId}`);
  } else {
    console.log(`User ${userId} is offline. Real-time event queued.`);
  }
};

module.exports = {
  initSocket,
  sendRealTimeNotification,
  getIo: () => io,
};
