// server/src/routes/review.routes.js
import express from 'express';
import {
  createReview,
  getUserReviews,
  getMyReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getReviewSummary,
  getAllReviews,
} from '../controllers/review.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/role.middleware.js';
import { cacheMiddleware } from '../middleware/cache.middleware.js';

const router = express.Router();

// ============ PRIVATE ROUTES (BEFORE /:id) ============

// Get my reviews - MUST BE BEFORE /:id
router.get('/my', protect, getMyReviews);

// Create review
router.post('/', protect, createReview);

// Admin - get all reviews
router.get('/', protect, isAdmin, getAllReviews);

// Update review
router.put('/:id', protect, updateReview);

// Delete review
router.delete('/:id', protect, deleteReview);

// ============ PUBLIC ROUTES ============

// Get user reviews
router.get('/user/:userId', cacheMiddleware('user-reviews', 300), getUserReviews);

// Get review summary
router.get('/summary/:userId', cacheMiddleware('review-summary', 300), getReviewSummary);

// Get single review - MUST BE LAST
router.get('/:id', cacheMiddleware('review', 300), getReviewById);

export default router;