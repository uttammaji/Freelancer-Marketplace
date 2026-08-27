// server/src/routes/message.routes.js
import express from 'express';
import {
  sendMessage,
  getConversationMessages,
  getMyConversations,
  getConversationInfo,
  markMessageAsRead,
  deleteMessage,
  getUnreadMessagesCount
} from '../controllers/message.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All message routes require authentication
router.use(protect);

// Send message
router.post('/', sendMessage);

// Get conversations
router.get('/conversations', getMyConversations);
router.get('/conversation/:conversationId', getConversationMessages);
router.get('/conversation/:conversationId/info', getConversationInfo);

// Unread count
router.get('/unread/count', getUnreadMessagesCount);

// Message actions
router.patch('/:id/read', markMessageAsRead);
router.delete('/:id', deleteMessage);

export default router;