// client/src/services/notification.service.js
import api from './api';

// Get my notifications
export const getMyNotifications = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await api.get(`/notifications${queryString ? `?${queryString}` : ''}`);
  return response.data;
};

// Get unread notifications count
export const getUnreadCount = async () => {
  const response = await api.get('/notifications/unread/count');
  return response.data;
};

// Get single notification
export const getNotificationById = async (notificationId) => {
  const response = await api.get(`/notifications/${notificationId}`);
  return response.data;
};

// Mark notification as read
export const markAsRead = async (notificationId) => {
  const response = await api.patch(`/notifications/${notificationId}/read`);
  return response.data;
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  const response = await api.patch('/notifications/read-all');
  return response.data;
};

// Delete single notification
export const deleteNotification = async (notificationId) => {
  const response = await api.delete(`/notifications/${notificationId}`);
  return response.data;
};

// Delete all notifications
export const clearAllNotifications = async () => {
  const response = await api.delete('/notifications/clear-all');
  return response.data;
};