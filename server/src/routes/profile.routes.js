// server/src/routes/profile.routes.js
import express from 'express';
import {
  createOrUpdateProfile,
  getMyProfile,
  getProfileByUserId,
  getAllFreelancers,
  getAllClients,
  deleteProfile,
  updateAvailability
} from '../controllers/profile.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { isFreelancer } from '../middleware/role.middleware.js';
import { cacheMiddleware } from '../middleware/cache.middleware.js';

const router = express.Router();

// Private routes
router.get('/me', protect, getMyProfile);
router.post('/', protect, createOrUpdateProfile);
router.delete('/', protect, deleteProfile);
router.patch('/availability', protect, isFreelancer, updateAvailability);

// Public routes
router.get('/freelancers', cacheMiddleware('freelancers', 300), getAllFreelancers);
router.get('/clients', cacheMiddleware('clients', 300), getAllClients);
router.get('/user/:userId', cacheMiddleware('profile', 300), getProfileByUserId);

export default router;