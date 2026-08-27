// server/src/routes/review.routes.js
import express from 'express';
import {
  createReview,
  getUserReviews,
  getMyReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getReviewSummary
} from '../controllers/review.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/user/:userId', getUserReviews);
router.get('/summary/:userId', getReviewSummary);
router.get('/:id', getReviewById);

// Private routes
router.post('/', protect, createReview);
router.get('/my', protect, getMyReviews);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

export default router;