// client/src/services/message.service.js
import api from './api';

// Find or create conversation
export const findOrCreateConversation = async (receiverId) => {
  const response = await api.post('/messages/conversation', { receiverId });
  return response.data;
};

// Get all conversations
export const getMyConversations = async () => {
  const response = await api.get('/messages/conversations');
  return response.data;
};

// Get messages for a conversation
export const getConversationMessages = async (conversationId, page = 1, limit = 50) => {
  const response = await api.get(`/messages/conversation/${conversationId}?page=${page}&limit=${limit}`);
  return response.data;
};

// Get conversation info
export const getConversationInfo = async (conversationId) => {
  const response = await api.get(`/messages/conversation/${conversationId}/info`);
  return response.data;
};

// Send message
export const sendMessage = async (data) => {
  const response = await api.post('/messages', data);
  return response.data;
};

// Mark message as read
export const markMessageAsRead = async (messageId) => {
  const response = await api.patch(`/messages/${messageId}/read`);
  return response.data;
};

// Delete message
export const deleteMessage = async (messageId) => {
  const response = await api.delete(`/messages/${messageId}`);
  return response.data;
};

// Get unread count
export const getUnreadMessagesCount = async () => {
  const response = await api.get('/messages/unread/count');
  return response.data;
};