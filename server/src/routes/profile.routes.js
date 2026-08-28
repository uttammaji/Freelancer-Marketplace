// server/src/routes/profile.routes.js
import express from 'express';
import {
  createOrUpdateProfile,
  getMyProfile,
  getProfileByUserId,
  getAllFreelancers,
  deleteProfile,
  updateAvailability
} from '../controllers/profile.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { isFreelancer } from '../middleware/role.middleware.js';
import { cacheMiddleware } from '../middleware/cache.middleware.js';

const router = express.Router();

// Public routes
router.get('/freelancers', cacheMiddleware('freelancers', 300), getAllFreelancers);
router.get('/user/:userId', cacheMiddleware('freelancer-profile', 300), getProfileByUserId);

// Private routes (any logged-in user)
router.get('/me', protect, getMyProfile);

// Freelancer only routes
router.post('/', protect, isFreelancer, createOrUpdateProfile);
router.delete('/', protect, isFreelancer, deleteProfile);
router.patch('/availability', protect, isFreelancer, updateAvailability);

export default router;