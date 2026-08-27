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

const router = express.Router();

// Public routes
router.get('/freelancers', getAllFreelancers);
router.get('/user/:userId', getProfileByUserId);

// Private routes (any logged-in user)
router.get('/me', protect, getMyProfile);

// Freelancer only routes
router.post('/', protect, isFreelancer, createOrUpdateProfile);
router.delete('/', protect, isFreelancer, deleteProfile);
router.patch('/availability', protect, isFreelancer, updateAvailability);

export default router;