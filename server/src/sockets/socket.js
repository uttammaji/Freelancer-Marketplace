// server/src/sockets/socket.js
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.models.js';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL ||'http://localhost:5173',
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.user.role})`);

    // Join user's personal room
    socket.join(`user:${socket.user.id}`);

    // Join role-based room
    socket.join(`role:${socket.user.role}`);

    // ============ CHAT EVENTS ============

    // Send message
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, receiverId, message } = data;
        
        // Emit to receiver
        io.to(`user:${receiverId}`).emit('receive_message', {
          conversationId,
          senderId: socket.user.id,
          senderName: socket.user.name,
          senderAvatar: socket.user.avatar,
          message,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Message error:', error.message);
      }
    });

    // Typing indicator
    socket.on('typing', ({ receiverId, isTyping }) => {
      io.to(`user:${receiverId}`).emit('user_typing', {
        userId: socket.user.id,
        userName: socket.user.name,
        isTyping,
      });
    });

    // ============ NOTIFICATION EVENTS ============

    // Send notification
    socket.on('send_notification', (data) => {
      io.to(`user:${data.receiverId}`).emit('receive_notification', {
        ...data,
        timestamp: new Date(),
      });
    });

    // ============ PROJECT EVENTS ============

    // New proposal notification
    socket.on('new_proposal', (data) => {
      io.to(`role:client`).emit('proposal_received', data);
    });

    // Project update
    socket.on('project_update', (data) => {
      io.to(`role:freelancer`).emit('project_updated', data);
    });

    // ============ DISCONNECT ============

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};