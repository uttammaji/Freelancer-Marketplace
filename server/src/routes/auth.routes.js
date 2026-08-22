// server/src/routes/auth.routes.js
import express from 'express';
import { 
  register, 
  login, 
  getMe, 
  logout, 
  refreshToken 
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;