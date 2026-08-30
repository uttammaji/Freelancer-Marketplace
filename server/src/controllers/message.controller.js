// server/src/controllers/message.controller.js
import mongoose from 'mongoose';
import { Message } from '../models/message.model.js';
import { Conversation } from '../models/conversation.model.js';
import { AppError, asyncHandler } from '../middleware/error.middleware.js';
import { getIO } from '../sockets/socket.js';

// ============ HELPERS ============

/**
 * Convert string to ObjectId safely
 */
const toObjectId = (id) => {
  try {
    return new mongoose.Types.ObjectId(id);
  } catch {
    return null;
  }
};

/**
 * Check if user is participant in conversation
 */
const isParticipantInConversation = (conversation, userId) => {
  const userIdStr = userId?.toString();
  return conversation.participants.some(p => {
    const participantId = p?._id?.toString() || p?.toString();
    return participantId === userIdStr;
  });
};

/**
 * Get other participant from conversation
 */
const getOtherParticipantId = (conversation, userId) => {
  const userIdStr = userId?.toString();
  const other = conversation.participants.find(p => {
    const participantId = p?._id?.toString() || p?.toString();
    return participantId !== userIdStr;
  });
  return other?._id || other;
};

/**
 * Emit message to receiver via Socket.IO
 */
const emitMessageToReceiver = (receiverId, conversationId, messageData) => {
  try {
    const io = getIO();
    io.to(`user:${receiverId}`).emit('receive_message', {
      conversationId,
      message: messageData,
    });
  } catch (error) {
    console.error('Socket emit error:', error.message);
  }
};

// ============ CONVERSATION CONTROLLERS ============

/**
 * Find or create conversation between two users
 * @route POST /api/messages/conversation
 * @access Private
 */
export const findOrCreateConversation = asyncHandler(async (req, res, next) => {
  const { receiverId } = req.body;

  if (!receiverId) {
    throw new AppError('Please provide receiverId', 400);
  }

  const userId = toObjectId(req.user.id);
  const receiverObjId = toObjectId(receiverId);

  if (!userId || !receiverObjId) {
    throw new AppError('Invalid user ID', 400);
  }

  // Prevent self-conversation
  if (userId.equals(receiverObjId)) {
    throw new AppError('Cannot create conversation with yourself', 400);
  }

  // Find existing conversation
  let conversation = await Conversation.findOne({
    participants: { $all: [userId, receiverObjId] }
  });

  let isNew = false;

  // Create if not exists
  if (!conversation) {
    conversation = await Conversation.create({
      participants: [userId, receiverObjId]
    });
    isNew = true;
  }

  // Populate conversation details
  conversation = await Conversation.findById(conversation._id)
    .populate('participants', 'name email avatar role')
    .populate('lastMessage');

  res.status(200).json({
    success: true,
    conversation,
    isNew,
  });
});

/**
 * Get all conversations for current user
 * @route GET /api/messages/conversations
 * @access Private
 */
export const getMyConversations = asyncHandler(async (req, res, next) => {
  const userId = toObjectId(req.user.id);

  const conversations = await Conversation.find({
    participants: { $in: [userId] }
  })
    .populate('participants', 'name email avatar role')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

  // Add unread count for each conversation
  const conversationsWithUnread = await Promise.all(
    conversations.map(async (conv) => {
      const unreadCount = await Message.countDocuments({
        conversationId: conv._id,
        receiverId: userId,
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

/**
 * Get single conversation info
 * @route GET /api/messages/conversation/:conversationId/info
 * @access Private
 */
export const getConversationInfo = asyncHandler(async (req, res, next) => {
  const conversation = await Conversation.findById(req.params.conversationId)
    .populate('participants', 'name email avatar role')
    .populate('lastMessage');

  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  if (!isParticipantInConversation(conversation, req.user.id)) {
    throw new AppError('Not authorized to view this conversation', 403);
  }

  res.status(200).json({
    success: true,
    conversation
  });
});

// ============ MESSAGE CONTROLLERS ============

/**
 * Send a message
 * @route POST /api/messages
 * @access Private
 */
export const sendMessage = asyncHandler(async (req, res, next) => {
  const { conversationId, receiverId, message, attachments } = req.body;

  const userId = toObjectId(req.user.id);
  let conversation;
  let finalReceiverId;

  // Case 1: Existing conversation
  if (conversationId) {
    conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    // Verify user is participant
    if (!isParticipantInConversation(conversation, req.user.id)) {
      throw new AppError('Not authorized to send message in this conversation', 403);
    }

    // Determine receiver
    finalReceiverId = getOtherParticipantId(conversation, req.user.id);
  }
  // Case 2: New conversation
  else {
    if (!receiverId) {
      throw new AppError('Please provide receiverId or conversationId', 400);
    }

    const receiverObjId = toObjectId(receiverId);

    if (!receiverObjId) {
      throw new AppError('Invalid receiver ID', 400);
    }

    if (userId.equals(receiverObjId)) {
      throw new AppError('Cannot send message to yourself', 400);
    }

    // Find or create conversation
    conversation = await Conversation.findOne({
      participants: { $all: [userId, receiverObjId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, receiverObjId]
      });
    }

    finalReceiverId = receiverObjId;
  }

  // Create message
  const newMessage = await Message.create({
    conversationId: conversation._id,
    senderId: userId,
    receiverId: finalReceiverId,
    message,
    attachments: attachments || [],
  });

  // Update conversation
  conversation.lastMessage = newMessage._id;
  conversation.lastMessageAt = new Date();
  await conversation.save();

  // Emit socket event
  emitMessageToReceiver(finalReceiverId.toString(), conversation._id.toString(), {
    _id: newMessage._id,
    senderId: req.user.id,
    senderName: req.user.name,
    senderAvatar: req.user.avatar,
    message: newMessage.message,
    attachments: newMessage.attachments,
    createdAt: newMessage.createdAt,
  });

  res.status(201).json({
    success: true,
    message: 'Message sent',
    data: newMessage,
    conversationId: conversation._id,
  });
});

/**
 * Get messages for a conversation
 * @route GET /api/messages/conversation/:conversationId
 * @access Private
 */
export const getConversationMessages = asyncHandler(async (req, res, next) => {
  const conversation = await Conversation.findById(req.params.conversationId);

  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  if (!isParticipantInConversation(conversation, req.user.id)) {
    throw new AppError('Not authorized to view this conversation', 403);
  }

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  // Get messages
  const messages = await Message.find({
    conversationId: req.params.conversationId
  })
    .populate('senderId', 'name email avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Mark as read
  await Message.updateMany(
    {
      conversationId: req.params.conversationId,
      receiverId: toObjectId(req.user.id),
      isRead: false
    },
    { isRead: true, readAt: new Date() }
  );

  res.status(200).json({
    success: true,
    count: messages.length,
    messages: messages.reverse()
  });
});

/**
 * Mark message as read
 * @route PATCH /api/messages/:id/read
 * @access Private
 */
export const markMessageAsRead = asyncHandler(async (req, res, next) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    throw new AppError('Message not found', 404);
  }

  if (message.receiverId.toString() !== req.user.id.toString()) {
    throw new AppError('Not authorized to update this message', 403);
  }

  message.isRead = true;
  message.readAt = new Date();
  await message.save();

  // Emit read receipt
  try {
    const io = getIO();
    io.to(`user:${message.senderId}`).emit('message_read', {
      messageId: message._id,
      readAt: message.readAt,
    });
  } catch (error) {
    console.error('Socket emit error:', error.message);
  }

  res.status(200).json({
    success: true,
    message: 'Message marked as read'
  });
});

/**
 * Delete message
 * @route DELETE /api/messages/:id
 * @access Private (Sender only)
 */
export const deleteMessage = asyncHandler(async (req, res, next) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    throw new AppError('Message not found', 404);
  }

  if (message.senderId.toString() !== req.user.id.toString()) {
    throw new AppError('Not authorized to delete this message', 403);
  }

  await Message.findByIdAndDelete(req.params.id);

  // Emit delete event
  try {
    const io = getIO();
    io.to(`user:${message.receiverId}`).emit('message_deleted', {
      messageId: message._id,
      conversationId: message.conversationId,
    });
  } catch (error) {
    console.error('Socket emit error:', error.message);
  }

  res.status(200).json({
    success: true,
    message: 'Message deleted successfully'
  });
});

/**
 * Get unread messages count
 * @route GET /api/messages/unread/count
 * @access Private
 */
export const getUnreadMessagesCount = asyncHandler(async (req, res, next) => {
  const unreadCount = await Message.countDocuments({
    receiverId: toObjectId(req.user.id),
    isRead: false
  });

  res.status(200).json({
    success: true,
    unreadCount
  });
});