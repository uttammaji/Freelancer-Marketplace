// server/src/routes/skill.routes.js
import express from 'express';
import {
  createSkill,
  getAllSkills,
  getSkillById,
  updateSkill,
  deleteSkill,
  getPopularSkills
} from '../controllers/skill.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/role.middleware.js';
import { cacheMiddleware } from '../middleware/cache.middleware.js';

const router = express.Router();

// Public routes
router.get('/', cacheMiddleware('skills', 600), getAllSkills);
router.get('/popular', cacheMiddleware('popular-skills', 600), getPopularSkills);
router.get('/:id', cacheMiddleware('skill', 600), getSkillById);

// Admin only routes
router.post('/', protect, isAdmin, createSkill);
router.put('/:id', protect, isAdmin, updateSkill);
router.delete('/:id', protect, isAdmin, deleteSkill);

export default router;