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
  getSimilarProjects,
  getAllProjectsAdmin, // ✅ Added import
} from '../controllers/project.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { isClient, isAdmin } from '../middleware/role.middleware.js';
import { cacheMiddleware } from '../middleware/cache.middleware.js';

const router = express.Router();

//Admin route 
router.get('/admin/all', protect, isAdmin, getAllProjectsAdmin);

// My projects routes
router.get('/my/projects', protect, isClient, getMyProjects);

// Public routes WITH caching
router.get('/', cacheMiddleware('projects', 300), getAllProjects);
router.get('/:id/similar', cacheMiddleware('similar-projects', 300), getSimilarProjects);
router.get('/:id', cacheMiddleware('project', 300), getProjectById);

// Client only routes
router.post('/', protect, isClient, createProject);
router.put('/:id', protect, isClient, updateProject);
router.delete('/:id', protect, isClient, deleteProject);
router.patch('/:id/status', protect, isClient, updateProjectStatus);

export default router;