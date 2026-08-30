// client/src/services/socket.service.js
import { io } from 'socket.io-client';

// ============ MODULE STATE ============

/**
 * Singleton Socket.IO instance
 * Maintains a single connection throughout the application lifecycle
 */
let socket = null;

// ============ CONNECTION MANAGEMENT ============

/**
 * Establishes a Socket.IO connection with the backend server
 * 
 * @param {string} token - JWT authentication token
 * @returns {Socket} Connected Socket.IO instance
 * 
 * @description
 * - Disconnects any existing connection before creating a new one
 * - Uses WebSocket transport for real-time communication
 * - Implements automatic reconnection with exponential backoff
 */
export const connectSocket = (token) => {
  // Terminate existing connection if present
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  // Initialize new connection
 const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const socketUrl = apiUrl.replace(/\/api$/, ''); // Remove trailing /api

  console.log('Socket URL:', socketUrl);
  
  socket = io(socketUrl, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  // Register connection lifecycle handlers
  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error.message);
  });

  return socket;
};

/**
 * Retrieves the current Socket.IO instance
 * 
 * @returns {Socket|null} Active socket instance or null if not connected
 */
export const getSocket = () => socket;

/**
 * Terminates the active Socket.IO connection
 * 
 * @description
 * Safely disconnects and clears the singleton instance
 * Called during user logout or application cleanup
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// ============ EVENT LISTENERS ============

/**
 * Subscribes to incoming chat messages
 * 
 * @param {Function} callback - Handler function receiving message data
 * @returns {Function} Cleanup function to unsubscribe
 * 
 * @description
 * Returns a cleanup function to prevent memory leaks
 * Listener is automatically removed during component unmount
 */
export const onReceiveMessage = (callback) => {
  if (!socket) {
    console.warn('Socket not connected. Cannot listen for messages.');
    return () => {};
  }

  const handler = (data) => {
    callback(data);
  };

  socket.on('receive_message', handler);

  return () => {
    socket.off('receive_message', handler);
  };
};

/**
 * Subscribes to typing indicator events
 * 
 * @param {Function} callback - Handler function receiving typing status
 * @returns {Function} Cleanup function to unsubscribe
 */
export const onUserTyping = (callback) => {
  if (!socket) {
    return () => {};
  }

  const handler = (data) => {
    callback(data);
  };

  socket.on('user_typing', handler);

  return () => {
    socket.off('user_typing', handler);
  };
};

/**
 * Subscribes to real-time notification events
 * 
 * @param {Function} callback - Handler function receiving notification data
 * @returns {Function} Cleanup function to unsubscribe
 */
export const onReceiveNotification = (callback) => {
  if (!socket) {
    return () => {};
  }

  const handler = (data) => {
    callback(data);
  };

  socket.on('receive_notification', handler);

  return () => {
    socket.off('receive_notification', handler);
  };
};

/**
 * Subscribes to message read receipt events
 * 
 * @param {Function} callback - Handler function receiving read confirmation
 * @returns {Function} Cleanup function to unsubscribe
 */
export const onMessageRead = (callback) => {
  if (!socket) {
    return () => {};
  }

  const handler = (data) => {
    callback(data);
  };

  socket.on('message_read', handler);

  return () => {
    socket.off('message_read', handler);
  };
};

/**
 * Subscribes to message deletion events
 * 
 * @param {Function} callback - Handler function receiving deleted message info
 * @returns {Function} Cleanup function to unsubscribe
 */
export const onMessageDeleted = (callback) => {
  if (!socket) {
    return () => {};
  }

  const handler = (data) => {
    callback(data);
  };

  socket.on('message_deleted', handler);

  return () => {
    socket.off('message_deleted', handler);
  };
};

// ============ EVENT EMITTERS ============

/**
 * Emits typing status to a specific user
 * 
 * @param {string} receiverId - Target user ID
 * @param {boolean} isTyping - Current typing state
 */
export const sendTyping = (receiverId, isTyping) => {
  if (socket && socket.connected) {
    socket.emit('typing', { receiverId, isTyping });
  }
};

/**
 * Emits a notification to a specific user
 * 
 * @param {string} receiverId - Target user ID
 * @param {Object} data - Notification payload
 */
export const sendNotification = (receiverId, data) => {
  if (socket && socket.connected) {
    socket.emit('send_notification', { receiverId, ...data });
  }
};