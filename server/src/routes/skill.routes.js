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

const router = express.Router();

// Public routes
router.get('/', getAllSkills);
router.get('/popular', getPopularSkills);
router.get('/:id', getSkillById);

// Admin only routes
router.post('/', protect, isAdmin, createSkill);
router.put('/:id', protect, isAdmin, updateSkill);
router.delete('/:id', protect, isAdmin, deleteSkill);

export default router;