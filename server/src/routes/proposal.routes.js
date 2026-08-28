// server/src/routes/proposal.routes.js
import express from 'express';
import {
  submitProposal,
  getProjectProposals,
  getMyProposals,
  getProposalById,
  updateProposal,
  withdrawProposal,
  shortlistProposal,
  acceptProposal,
  rejectProposal
} from '../controllers/proposal.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { isClient, isFreelancer } from '../middleware/role.middleware.js';


const router = express.Router();

// Freelancer routes
router.post('/', protect, isFreelancer, submitProposal);
router.get('/my', protect, isFreelancer, getMyProposals);
router.put('/:id', protect, isFreelancer, updateProposal);
router.delete('/:id', protect, isFreelancer, withdrawProposal);

// Client routes
router.get('/project/:projectId', protect, isClient, getProjectProposals);
router.patch('/:id/shortlist', protect, isClient, shortlistProposal);
router.patch('/:id/accept', protect, isClient, acceptProposal);
router.patch('/:id/reject', protect, isClient, rejectProposal);

// Shared route (both client and freelancer)
router.get('/:id', protect, getProposalById);

export default router;