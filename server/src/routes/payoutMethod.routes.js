// server/src/routes/payoutMethod.routes.js
import express from 'express';
import {
  addPayoutMethod,
  getMyPayoutMethods,
  getPayoutMethodById,
  updatePayoutMethod,
  setPrimaryPayoutMethod,
  deletePayoutMethod,
} from '../controllers/payoutMethod.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { isFreelancer } from '../middleware/role.middleware.js';

const router = express.Router();

// All routes require authentication + freelancer role
router.use(protect, isFreelancer);

// Routes
router.post('/', addPayoutMethod);
router.get('/my', getMyPayoutMethods);
router.get('/:id', getPayoutMethodById);
router.put('/:id', updatePayoutMethod);
router.patch('/:id/primary', setPrimaryPayoutMethod);
router.delete('/:id', deletePayoutMethod);

export default router;