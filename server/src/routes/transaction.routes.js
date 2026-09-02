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

router.use(protect);

// ============ USER ROUTES (BEFORE /:id) ============

// Get my transactions
router.get('/', getMyTransactions);

// Get my transaction stats
router.get('/stats', getTransactionStats);

// ============ ADMIN ROUTES (BEFORE /:id) ============

// Get all transactions
router.get('/all', isAdmin, getAllTransactions);

// Get platform stats
router.get('/platform-stats', isAdmin, getPlatformStats);

// ============ DYNAMIC ROUTES (LAST) ============

// Get single transaction
router.get('/:id', getTransactionById);

// Create transaction
router.post('/', isAdmin, createTransaction);

export default router;