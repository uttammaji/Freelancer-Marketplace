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

// Create delivery
router.post('/', isFreelancer, createDelivery);

// Get my deliveries
router.get('/my', isFreelancer, getMyDeliveries);

// Update delivery (after revision)
router.put('/:id', isFreelancer, updateDelivery);

// Delete delivery
router.delete('/:id', isFreelancer, deleteDelivery);

// ============ CLIENT ROUTES ============

// Accept delivery
router.patch('/:id/accept', isClient, acceptDelivery);

// Request revision
router.patch('/:id/request-revision', isClient, requestRevision);

// ============ SHARED ROUTES ============

// Get contract deliveries
router.get('/contract/:contractId', getContractDeliveries);

// Get single delivery
router.get('/:id', getDeliveryById);

export default router;