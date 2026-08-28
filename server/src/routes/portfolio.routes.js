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
import { cacheMiddleware } from '../middleware/cache.middleware.js';

const router = express.Router();

// Public routes
router.get('/featured', cacheMiddleware('featured-portfolio', 300), getFeaturedPortfolio);
router.get('/user/:userId', cacheMiddleware('user-portfolio', 300), getUserPortfolio);
router.get('/:id', cacheMiddleware('portfolio', 300), getPortfolioById);

// Freelancer only routes
router.post('/', protect, isFreelancer, addPortfolioItem);
router.get('/my', protect, isFreelancer, getMyPortfolio);
router.put('/:id', protect, isFreelancer, updatePortfolioItem);
router.delete('/:id', protect, isFreelancer, deletePortfolioItem);

export default router;