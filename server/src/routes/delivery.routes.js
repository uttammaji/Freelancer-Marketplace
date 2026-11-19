// server/src/routes/delivery.routes.js
import express from 'express';
import {
  createDelivery,
  getContractDeliveries,
  getMyDeliveries,
  getDeliveryById,
  acceptDelivery,
  requestRevision,
  updateDelivery,
  deleteDelivery,
} from '../controllers/delivery.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { isClient, isFreelancer } from '../middleware/role.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// ============ FREELANCER ROUTES ============
router.post('/', isFreelancer, createDelivery);
router.get('/my', isFreelancer, getMyDeliveries); // ✅ BEFORE /:id

// ============ CLIENT ROUTES ============
router.patch('/:id/accept', isClient, acceptDelivery);
router.patch('/:id/request-revision', isClient, requestRevision);

// ============ SHARED ROUTES ============
router.get('/contract/:contractId', getContractDeliveries); // ✅ BEFORE /:id

// ============ DYNAMIC ROUTES (MUST BE LAST) ============
router.get('/:id', getDeliveryById);
router.put('/:id', isFreelancer, updateDelivery);
router.delete('/:id', isFreelancer, deleteDelivery);

export default router;