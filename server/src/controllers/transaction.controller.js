// server/src/controllers/transaction.controller.js
import { Transaction } from '../models/transaction.model.js';
import { AppError, asyncHandler } from '../middleware/error.middleware.js';
import { deleteCacheByPattern } from '../utils/cache.utils.js';

// @desc    Get current user's transactions
// @route   GET /api/transactions
// @access  Private
export const getMyTransactions = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  let query = { userId: req.user.id };

  if (req.query.type) {
    query.type = req.query.type;
  }

  if (req.query.status) {
    query.status = req.query.status;
  }

  if (req.query.direction) {
    query.direction = req.query.direction;
  }

  const transactions = await Transaction.find(query)
    .populate('projectId', 'title')
    .populate('contractId', 'projectTitle')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Transaction.countDocuments(query);

  res.status(200).json({
    success: true,
    count: transactions.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    transactions,
  });
});

// @desc    Get all transactions (Admin)
// @route   GET /api/transactions/all
// @access  Private (Admin)
export const getAllTransactions = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  let query = {};

  if (req.query.type) query.type = req.query.type;
  if (req.query.status) query.status = req.query.status;
  if (req.query.userId) query.userId = req.query.userId;

  const transactions = await Transaction.find(query)
    .populate('userId', 'name email avatar')
    .populate('projectId', 'title')
    .populate('contractId', 'projectTitle')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Transaction.countDocuments(query);

  res.status(200).json({
    success: true,
    count: transactions.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    transactions,
  });
});

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
export const getTransactionById = asyncHandler(async (req, res, next) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate('userId', 'name email avatar')
    .populate('projectId', 'title')
    .populate('contractId', 'projectTitle');

  if (!transaction) {
    throw new AppError('Transaction not found', 404);
  }

  if (transaction.userId.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('Not authorized to view this transaction', 403);
  }

  res.status(200).json({
    success: true,
    transaction,
  });
});

// @desc    Create transaction
// @route   POST /api/transactions
// @access  Private (Admin or System)
export const createTransaction = asyncHandler(async (req, res, next) => {
  const {
    userId,
    projectId,
    contractId,
    paymentId,
    type,
    direction,
    amount,
    currency,
    description,
  } = req.body;

  if (!userId || !type || !direction || !amount) {
    throw new AppError('Please provide userId, type, direction, and amount', 400);
  }

  const validTypes = ['project_payment', 'platform_fee', 'freelancer_earning', 'refund', 'withdrawal'];
  if (!validTypes.includes(type)) {
    throw new AppError('Invalid transaction type', 400);
  }

  const validDirections = ['credit', 'debit'];
  if (!validDirections.includes(direction)) {
    throw new AppError('Invalid direction', 400);
  }

  const transaction = await Transaction.create({
    userId,
    projectId: projectId || null,
    contractId: contractId || null,
    paymentId: paymentId || null,
    type,
    direction,
    amount,
    currency: currency || 'INR',
    description: description || `${type.replace(/_/g, ' ')}`,
    status: 'completed',
  });

  await deleteCacheByPattern('transactions:*');

  res.status(201).json({
    success: true,
    message: 'Transaction created successfully',
    transaction,
  });
});

// @desc    Get transaction stats for current user
// @route   GET /api/transactions/stats
// @access  Private
export const getTransactionStats = asyncHandler(async (req, res, next) => {
  // Total credits
  const credits = await Transaction.aggregate([
    { $match: { userId: req.user._id, direction: 'credit', status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  // Total debits
  const debits = await Transaction.aggregate([
    { $match: { userId: req.user._id, direction: 'debit', status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  // Counts
  const totalCount = await Transaction.countDocuments({ userId: req.user.id });
  const pendingCount = await Transaction.countDocuments({ userId: req.user.id, status: 'pending' });

  res.status(200).json({
    success: true,
    stats: {
      totalCredits: credits.length > 0 ? credits[0].total : 0,
      totalDebits: debits.length > 0 ? debits[0].total : 0,
      totalCount,
      pendingCount,
    },
  });
});

// @desc    Get platform stats (Admin)
// @route   GET /api/transactions/platform-stats
// @access  Private (Admin)
export const getPlatformStats = asyncHandler(async (req, res, next) => {
  const totalTransactions = await Transaction.countDocuments();
  const completedTransactions = await Transaction.countDocuments({ status: 'completed' });
  
  const totalCredits = await Transaction.aggregate([
    { $match: { direction: 'credit', status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalTransactions,
      completedTransactions,
      totalVolume: totalCredits.length > 0 ? totalCredits[0].total : 0,
    },
  });
});