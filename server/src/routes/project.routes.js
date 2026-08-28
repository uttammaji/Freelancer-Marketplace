// server/src/routes/project.routes.js
import express from 'express';
import {
  createProject,
  getAllProjects,
  getProjectById,
  getMyProjects,
  updateProject,
  deleteProject,
  updateProjectStatus,
  getSimilarProjects
} from '../controllers/project.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { isClient } from '../middleware/role.middleware.js';
import { cacheMiddleware } from '../middleware/cache.middleware.js';

const router = express.Router();

// Public routes WITH caching
router.get('/', cacheMiddleware('projects', 300), getAllProjects);
router.get('/:id', cacheMiddleware('project', 300), getProjectById);
router.get('/:id/similar', cacheMiddleware('similar-projects', 300), getSimilarProjects);

// Private routes (any logged-in user)
router.get('/my/projects', protect, isClient, getMyProjects);

// Client only routes
router.post('/', protect, isClient, createProject);
router.put('/:id', protect, isClient, updateProject);
router.delete('/:id', protect, isClient, deleteProject);
router.patch('/:id/status', protect, isClient, updateProjectStatus);

export default router;