// server/src/routes/payment.routes.js
import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  getPaymentById,
  getClientPayments,
  getFreelancerPayments,
  getAllPayments,
} from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { isClient, isFreelancer, isAdmin } from '../middleware/role.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Client routes
router.post('/create-order', isClient, createPaymentOrder);
router.post('/verify', isClient, verifyPayment);
router.get('/client', isClient, getClientPayments);

// Freelancer routes
router.get('/freelancer', isFreelancer, getFreelancerPayments);

// Admin routes
router.get('/', isAdmin, getAllPayments);

// Shared route (involved parties)
router.get('/:id', getPaymentById);

export default router;