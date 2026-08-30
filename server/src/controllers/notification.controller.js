// server/src/controllers/notification.controller.js
import { Notification } from '../models/notification.model.js';
import { AppError, asyncHandler } from '../middleware/error.middleware.js';
import { getIO } from '../sockets/socket.js';

// @desc    Get current user's notifications
// @route   GET /api/notifications
// @access  Private
export const getMyNotifications = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  let query = { recipientId: req.user.id };

  if (req.query.read === 'true') {
    query.isRead = true;
  } else if (req.query.read === 'false') {
    query.isRead = false;
  }

  if (req.query.type) {
    query.type = req.query.type;
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.countDocuments({
    recipientId: req.user.id,
    isRead: false
  });

  res.status(200).json({
    success: true,
    count: notifications.length,
    total,
    unreadCount,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    notifications
  });
});

// @desc    Get unread notifications count
// @route   GET /api/notifications/unread/count
// @access  Private
export const getUnreadCount = asyncHandler(async (req, res, next) => {
  const unreadCount = await Notification.countDocuments({
    recipientId: req.user.id,
    isRead: false
  });

  res.status(200).json({
    success: true,
    unreadCount
  });
});

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  if (notification.recipientId.toString() !== req.user.id) {
    throw new AppError('Not authorized to update this notification', 403);
  }

  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
    notification
  });
});

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
export const markAllAsRead = asyncHandler(async (req, res, next) => {
  await Notification.updateMany(
    { recipientId: req.user.id, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read'
  });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  if (notification.recipientId.toString() !== req.user.id) {
    throw new AppError('Not authorized to delete this notification', 403);
  }

  await Notification.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Notification deleted successfully'
  });
});

// @desc    Delete all notifications
// @route   DELETE /api/notifications/clear-all
// @access  Private
export const clearAllNotifications = asyncHandler(async (req, res, next) => {
  await Notification.deleteMany({ recipientId: req.user.id });

  res.status(200).json({
    success: true,
    message: 'All notifications cleared'
  });
});

// @desc    Get notification by ID
// @route   GET /api/notifications/:id
// @access  Private
export const getNotificationById = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  if (notification.recipientId.toString() !== req.user.id) {
    throw new AppError('Not authorized to view this notification', 403);
  }

  res.status(200).json({
    success: true,
    notification
  });
});

// Helper function to create notification (with socket emit)
export const createNotification = async ({
  recipientId,
  senderId,
  type,
  title,
  message,
  link
}) => {
  try {
    const notification = await Notification.create({
      recipientId,
      senderId,
      type,
      title,
      message,
      link
    });

    //Emit socket notification to recipient
    const io = getIO();
    io.to(`user:${recipientId}`).emit('receive_notification', {
      notification: {
        _id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        link: notification.link,
        createdAt: notification.createdAt,
      },
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};