// server/src/routes/dispute.routes.js
import express from 'express';
import {
  createDispute,
  getAllDisputes,
  getMyDisputes,
  getDisputeById,
  updateDispute,
  resolveDispute,
  closeDispute,
  getDisputeStats,
} from '../controllers/dispute.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/role.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// ============ USER ROUTES (Client/Freelancer) ============

// Create dispute
router.post('/', createDispute);

// Get my disputes
router.get('/my', getMyDisputes);

// Get all disputes
router.get('/', isAdmin, getAllDisputes);

// Get dispute stats
router.get('/stats', isAdmin, getDisputeStats);

// Get single dispute
router.get('/:id', getDisputeById);

// Update dispute (openedBy only)
router.put('/:id', updateDispute);

// Cancel dispute (openedBy only)
router.patch('/:id/cancel', closeDispute);

// Resolve dispute
router.patch('/:id/resolve', isAdmin, resolveDispute);

export default router;