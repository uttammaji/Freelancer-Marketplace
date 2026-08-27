// server/src/routes/contract.routes.js
import express from 'express';
import {
  createContract,
  getContractById,
  getClientContracts,
  getFreelancerContracts,
  updateContractStatus,
  updateContractProgress,
  getContractStats
} from '../controllers/contract.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { isClient, isFreelancer } from '../middleware/role.middleware.js';

const router = express.Router();

// All contract routes require authentication
router.use(protect);

// Client routes
router.post('/', isClient, createContract);
router.get('/client', isClient, getClientContracts);
router.patch('/:id/status', isClient, updateContractStatus);

// Freelancer routes
router.get('/freelancer', isFreelancer, getFreelancerContracts);
router.patch('/:id/progress', isFreelancer, updateContractProgress);

// Shared routes (both client and freelancer)
router.get('/stats', getContractStats);
router.get('/:id', getContractById);

export default router;