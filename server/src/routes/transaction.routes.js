// server/src/routes/transaction.routes.js
import express from 'express';
import {
  getMyTransactions,
  getAllTransactions,
  getTransactionById,
  createTransaction,
  getTransactionStats,
  getPlatformStats,
} from '../controllers/transaction.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/role.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// ============ USER ROUTES ============

// Get my transactions
router.get('/', getMyTransactions);

// Get my transaction stats
router.get('/stats', getTransactionStats);

// Get single transaction
router.get('/:id', getTransactionById);

// ============ ADMIN ROUTES ============

// Get all transactions
router.get('/all', isAdmin, getAllTransactions);

// Create transaction
router.post('/', isAdmin, createTransaction);

// Get platform stats
router.get('/platform-stats', isAdmin, getPlatformStats);

export default router;