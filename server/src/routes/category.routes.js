// server/src/routes/category.routes.js
import express from 'express';
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getProjectsByCategory
} from '../controllers/category.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/role.middleware.js';
import { cacheMiddleware } from '../middleware/cache.middleware.js';

const router = express.Router();

// Public routes
router.get('/', cacheMiddleware('categories', 600), getAllCategories);
router.get('/:id', cacheMiddleware('category', 600), getCategoryById);
router.get('/:id/projects', cacheMiddleware('category-projects', 300), getProjectsByCategory);

// Admin only routes
router.post('/', protect, isAdmin, createCategory);
router.put('/:id', protect, isAdmin, updateCategory);
router.delete('/:id', protect, isAdmin, deleteCategory);

export default router;