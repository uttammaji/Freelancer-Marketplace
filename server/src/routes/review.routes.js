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
import { cacheMiddleware } from '../middleware/cache.middleware.js';

const router = express.Router();

// Public routes
router.get('/user/:userId', cacheMiddleware('user-reviews', 300), getUserReviews);
router.get('/summary/:userId', cacheMiddleware('review-summary', 300), getReviewSummary);
router.get('/:id', cacheMiddleware('review', 300), getReviewById);

// Private routes
router.post('/', protect, createReview);
router.get('/my', protect, getMyReviews);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

export default router;