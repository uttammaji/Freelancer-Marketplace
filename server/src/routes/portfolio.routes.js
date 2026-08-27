// server/src/routes/portfolio.routes.js
import express from 'express';
import {
  addPortfolioItem,
  getMyPortfolio,
  getUserPortfolio,
  getPortfolioById,
  updatePortfolioItem,
  deletePortfolioItem,
  getFeaturedPortfolio
} from '../controllers/portfolio.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { isFreelancer } from '../middleware/role.middleware.js';

const router = express.Router();

// Public routes
router.get('/featured', getFeaturedPortfolio);
router.get('/user/:userId', getUserPortfolio);
router.get('/:id', getPortfolioById);

// Freelancer only routes
router.post('/', protect, isFreelancer, addPortfolioItem);
router.get('/my', protect, isFreelancer, getMyPortfolio);
router.put('/:id', protect, isFreelancer, updatePortfolioItem);
router.delete('/:id', protect, isFreelancer, deletePortfolioItem);

export default router;