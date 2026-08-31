// server/src/routes/payout.routes.js
import express from 'express';
import {
  createPayout,
  checkPayoutStatus,
  getMyPayouts,
  payoutWebhook,
} from '../controllers/payout.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { isFreelancer } from '../middleware/role.middleware.js';

const router = express.Router();

// Webhook — Public (Razorpay calls this)
router.post('/webhook', payoutWebhook);

// Freelancer routes
router.post('/', protect, isFreelancer, createPayout);
router.get('/my', protect, isFreelancer, getMyPayouts);
router.get('/:id/status', protect, isFreelancer, checkPayoutStatus);

export default router;