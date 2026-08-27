// server/src/controllers/message.controller.js
import { Message } from '../models/message.model.js';
import { Conversation } from '../models/conversation.model.js';
import { AppError, asyncHandler } from '../middleware/error.middleware.js';

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
export const sendMessage = asyncHandler(async (req, res, next) => {
  const { conversationId, receiverId, message, attachments } = req.body;

  let conversation;

  // If conversationId provided, use existing conversation
  if (conversationId) {
    conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    // Check if user is part of this conversation
    if (!conversation.participants.includes(req.user.id)) {
      throw new AppError('Not authorized to send message in this conversation', 403);
    }

    // Determine receiver
    const receiver = conversation.participants.find(
      p => p.toString() !== req.user.id
    );

    // Create message
    const newMessage = await Message.create({
      conversationId: conversation._id,
      senderId: req.user.id,
      receiverId: receiver,
      message,
      attachments
    });

    // Update conversation
    conversation.lastMessage = newMessage._id;
    conversation.updatedAt = new Date();
    await conversation.save();

    return res.status(201).json({
      success: true,
      message: 'Message sent',
      data: newMessage
    });
  }

  // If no conversationId, create new conversation
  if (!receiverId) {
    throw new AppError('Please provide receiverId or conversationId', 400);
  }

  // Check if conversation already exists between these users
  conversation = await Conversation.findOne({
    participants: { $all: [req.user.id, receiverId] }
  });

  if (!conversation) {
    // Create new conversation
    conversation = await Conversation.create({
      participants: [req.user.id, receiverId]
    });
  }

  // Create message
  const newMessage = await Message.create({
    conversationId: conversation._id,
    senderId: req.user.id,
    receiverId,
    message,
    attachments
  });

  // Update conversation
  conversation.lastMessage = newMessage._id;
  conversation.updatedAt = new Date();
  await conversation.save();

  res.status(201).json({
    success: true,
    message: 'Message sent',
    data: newMessage,
    conversationId: conversation._id
  });
});

// @desc    Get conversation messages
// @route   GET /api/messages/conversation/:conversationId
// @access  Private
export const getConversationMessages = asyncHandler(async (req, res, next) => {
  const conversation = await Conversation.findById(req.params.conversationId);

  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  // Check if user is part of this conversation
  if (!conversation.participants.includes(req.user.id)) {
    throw new AppError('Not authorized to view this conversation', 403);
  }

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  // Get messages
  const messages = await Message.find({ conversationId: req.params.conversationId })
    .populate('senderId', 'name email avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Mark messages as read
  await Message.updateMany(
    {
      conversationId: req.params.conversationId,
      receiverId: req.user.id,
      isRead: false
    },
    { isRead: true, readAt: new Date() }
  );

  res.status(200).json({
    success: true,
    count: messages.length,
    messages: messages.reverse() // Return in chronological order
  });
});

// @desc    Get user's conversations
// @route   GET /api/messages/conversations
// @access  Private
export const getMyConversations = asyncHandler(async (req, res, next) => {
  const conversations = await Conversation.find({
    participants: req.user.id
  })
    .populate('participants', 'name email avatar')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

  // Get unread count for each conversation
  const conversationsWithUnread = await Promise.all(
    conversations.map(async (conv) => {
      const unreadCount = await Message.countDocuments({
        conversationId: conv._id,
        receiverId: req.user.id,
        isRead: false
      });

      return {
        ...conv.toObject(),
        unreadCount
      };
    })
  );

  res.status(200).json({
    success: true,
    count: conversationsWithUnread.length,
    conversations: conversationsWithUnread
  });
});

// @desc    Get single conversation
// @route   GET /api/messages/conversation/:conversationId/info
// @access  Private
export const getConversationInfo = asyncHandler(async (req, res, next) => {
  const conversation = await Conversation.findById(req.params.conversationId)
    .populate('participants', 'name email avatar')
    .populate('lastMessage');

  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  // Check if user is part of this conversation
  if (!conversation.participants.some(p => p._id.toString() === req.user.id)) {
    throw new AppError('Not authorized to view this conversation', 403);
  }

  res.status(200).json({
    success: true,
    conversation
  });
});

// @desc    Mark message as read
// @route   PATCH /api/messages/:id/read
// @access  Private
export const markMessageAsRead = asyncHandler(async (req, res, next) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    throw new AppError('Message not found', 404);
  }

  // Check if user is the receiver
  if (message.receiverId.toString() !== req.user.id) {
    throw new AppError('Not authorized to update this message', 403);
  }

  message.isRead = true;
  message.readAt = new Date();
  await message.save();

  res.status(200).json({
    success: true,
    message: 'Message marked as read'
  });
});

// @desc    Delete message
// @route   DELETE /api/messages/:id
// @access  Private (Sender only)
export const deleteMessage = asyncHandler(async (req, res, next) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    throw new AppError('Message not found', 404);
  }

  // Check if user is the sender
  if (message.senderId.toString() !== req.user.id) {
    throw new AppError('Not authorized to delete this message', 403);
  }

  await Message.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Message deleted successfully'
  });
});

// @desc    Get unread messages count
// @route   GET /api/messages/unread/count
// @access  Private
export const getUnreadMessagesCount = asyncHandler(async (req, res, next) => {
  const unreadCount = await Message.countDocuments({
    receiverId: req.user.id,
    isRead: false
  });

  res.status(200).json({
    success: true,
    unreadCount
  });
});