// server/src/controllers/delivery.controller.js
import { Delivery } from '../models/delivery.model.js';
import { Contract } from '../models/contract.model.js';
import { Project } from '../models/project.model.js';
import { Transaction } from '../models/transaction.model.js';
import { User } from '../models/user.models.js';
import { AppError, asyncHandler } from '../middleware/error.middleware.js';
import { deleteCacheByPattern } from '../utils/cache.utils.js';
import { sendWorkSubmittedEmail, sendWorkAcceptedEmail } from '../utils/notificationEmails.js';

/**
 * Submit work delivery (Freelancer)
 * @route POST /api/deliveries
 * @access Private (Freelancer)
 */
export const createDelivery = asyncHandler(async (req, res, next) => {
  const {
    contractId,
    title,
    description,
    attachments,
    githubUrl,
    liveDemoUrl,
  } = req.body;

  if (!contractId || !title || !description) {
    throw new AppError('Please provide contractId, title, and description', 400);
  }

  const contract = await Contract.findById(contractId);
  if (!contract) {
    throw new AppError('Contract not found', 404);
  }

  if (contract.freelancerId.toString() !== req.user.id) {
    throw new AppError('Only freelancer can submit work', 403);
  }

  if (contract.status !== 'active' && contract.status !== 'in_progress') {
    throw new AppError('Contract is not in progress', 400);
  }

  const existingDelivery = await Delivery.findOne({
    contractId,
    status: { $in: ['submitted', 'revision_requested'] },
  });

  if (existingDelivery) {
    throw new AppError('You already have a pending delivery for this contract', 400);
  }

  const delivery = await Delivery.create({
    contractId,
    projectId: contract.projectId,
    freelancerId: req.user.id,
    message: description,
    githubUrl: githubUrl || null,
    liveUrl: liveDemoUrl || null,
    status: 'submitted',
  });

  contract.status = 'submitted';
  await contract.save();

  await deleteCacheByPattern('deliveries:*');
  await deleteCacheByPattern('contracts:*');

  // Send email to client
  try {
    const client = await User.findById(contract.clientId);
    if (client) {
      sendWorkSubmittedEmail(client, delivery);
    }
  } catch (emailError) {
    console.error('Work submitted email failed:', emailError.message);
  }

  res.status(201).json({
    success: true,
    message: 'Work submitted successfully',
    delivery,
  });
});

/**
 * Get deliveries for a contract
 * @route GET /api/deliveries/contract/:contractId
 * @access Private (Client or Freelancer)
 */
export const getContractDeliveries = asyncHandler(async (req, res, next) => {
  const contract = await Contract.findById(req.params.contractId);
  if (!contract) {
    throw new AppError('Contract not found', 404);
  }

  const isInvolved =
    contract.clientId.toString() === req.user.id ||
    contract.freelancerId.toString() === req.user.id;

  if (!isInvolved) {
    throw new AppError('Not authorized to view deliveries', 403);
  }

  const deliveries = await Delivery.find({ contractId: req.params.contractId })
    .populate('freelancerId', 'name email avatar')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: deliveries.length,
    deliveries,
  });
});

/**
 * Get my deliveries (Freelancer)
 * @route GET /api/deliveries/my
 * @access Private (Freelancer)
 */
export const getMyDeliveries = asyncHandler(async (req, res, next) => {
  const deliveries = await Delivery.find({ freelancerId: req.user.id })
    .populate('projectId', 'title')
    .populate('contractId', 'amount platformFee freelancerAmount')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: deliveries.length,
    deliveries,
  });
});

/**
 * Get single delivery
 * @route GET /api/deliveries/:id
 * @access Private
 */
export const getDeliveryById = asyncHandler(async (req, res, next) => {
  const delivery = await Delivery.findById(req.params.id)
    .populate('freelancerId', 'name email avatar')
    .populate('projectId', 'title');

  if (!delivery) {
    throw new AppError('Delivery not found', 404);
  }

  const contract = await Contract.findById(delivery.contractId);
  const isInvolved =
    delivery.freelancerId._id.toString() === req.user.id ||
    (contract && contract.clientId.toString() === req.user.id);

  if (!isInvolved && req.user.role !== 'admin') {
    throw new AppError('Not authorized to view this delivery', 403);
  }

  res.status(200).json({
    success: true,
    delivery,
  });
});

/**
 * Accept delivery (Client)
 * @route PATCH /api/deliveries/:id/accept
 * @access Private (Client)
 */
export const acceptDelivery = asyncHandler(async (req, res, next) => {
  const { feedback } = req.body;

  const delivery = await Delivery.findById(req.params.id);
  if (!delivery) {
    throw new AppError('Delivery not found', 404);
  }

  const contract = await Contract.findById(delivery.contractId);
  if (!contract) {
    throw new AppError('Contract not found', 404);
  }

  if (contract.clientId.toString() !== req.user.id) {
    throw new AppError('Only client can accept delivery', 403);
  }

  if (delivery.status !== 'submitted') {
    throw new AppError('Delivery already processed', 400);
  }

  delivery.status = 'accepted';
  delivery.acceptedAt = new Date();
  await delivery.save();

  contract.status = 'completed';
  await contract.save();

  await Project.findByIdAndUpdate(contract.projectId, { status: 'completed' });

  await Transaction.updateMany(
    { 
      contractId: delivery.contractId,
      type: 'freelancer_earning',
      status: 'pending',
    },
    { 
      status: 'completed',
      description: 'Escrow released - work completed',
    }
  );

  await deleteCacheByPattern('deliveries:*');
  await deleteCacheByPattern('contracts:*');
  await deleteCacheByPattern('projects:*');
  await deleteCacheByPattern('transactions:*');

  // Send email to freelancer
  try {
    const freelancer = await User.findById(delivery.freelancerId);
    if (freelancer) {
      const amount = contract.freelancerAmount || contract.amount;
      sendWorkAcceptedEmail(freelancer, delivery, amount);
    }
  } catch (emailError) {
    console.error('Work accepted email failed:', emailError.message);
  }

  res.status(200).json({
    success: true,
    message: 'Delivery accepted. Contract completed. Escrow released.',
    delivery,
  });
});

/**
 * Request revision (Client)
 * @route PATCH /api/deliveries/:id/request-revision
 * @access Private (Client)
 */
export const requestRevision = asyncHandler(async (req, res, next) => {
  const { feedback } = req.body;

  if (!feedback) {
    throw new AppError('Please provide revision feedback', 400);
  }

  const delivery = await Delivery.findById(req.params.id);
  if (!delivery) {
    throw new AppError('Delivery not found', 404);
  }

  const contract = await Contract.findById(delivery.contractId);
  if (!contract) {
    throw new AppError('Contract not found', 404);
  }

  if (contract.clientId.toString() !== req.user.id) {
    throw new AppError('Only client can request revision', 403);
  }

  if (delivery.status !== 'submitted') {
    throw new AppError('Delivery already processed', 400);
  }

  delivery.status = 'revision_requested';
  delivery.revisionMessage = feedback;
  await delivery.save();

  contract.status = 'revision_requested';
  await contract.save();

  await deleteCacheByPattern('deliveries:*');
  await deleteCacheByPattern('contracts:*');

  res.status(200).json({
    success: true,
    message: 'Revision requested',
    delivery,
  });
});

/**
 * Update delivery after revision (Freelancer)
 * @route PUT /api/deliveries/:id
 * @access Private (Freelancer)
 */
export const updateDelivery = asyncHandler(async (req, res, next) => {
  let delivery = await Delivery.findById(req.params.id);

  if (!delivery) {
    throw new AppError('Delivery not found', 404);
  }

  if (delivery.freelancerId.toString() !== req.user.id) {
    throw new AppError('Not authorized to update this delivery', 403);
  }

  if (delivery.status !== 'revision_requested') {
    throw new AppError('Delivery is not in revision state', 400);
  }

  const { title, description, githubUrl, liveDemoUrl } = req.body;

  delivery = await Delivery.findByIdAndUpdate(
    req.params.id,
    {
      message: description || delivery.message,
      githubUrl: githubUrl || delivery.githubUrl,
      liveUrl: liveDemoUrl || delivery.liveUrl,
      status: 'submitted',
      revisionMessage: null,
    },
    { new: true, runValidators: true }
  );

  await Contract.findByIdAndUpdate(delivery.contractId, { status: 'submitted' });

  await deleteCacheByPattern('deliveries:*');
  await deleteCacheByPattern('contracts:*');

  res.status(200).json({
    success: true,
    message: 'Delivery updated and resubmitted',
    delivery,
  });
});

/**
 * Delete delivery (Freelancer)
 * @route DELETE /api/deliveries/:id
 * @access Private (Freelancer)
 */
export const deleteDelivery = asyncHandler(async (req, res, next) => {
  const delivery = await Delivery.findById(req.params.id);

  if (!delivery) {
    throw new AppError('Delivery not found', 404);
  }

  if (delivery.freelancerId.toString() !== req.user.id) {
    throw new AppError('Not authorized to delete this delivery', 403);
  }

  if (delivery.status === 'accepted') {
    throw new AppError('Cannot delete accepted delivery', 400);
  }

  await Delivery.findByIdAndDelete(req.params.id);

  await Contract.findByIdAndUpdate(delivery.contractId, { status: 'active' });

  await deleteCacheByPattern('deliveries:*');
  await deleteCacheByPattern('contracts:*');

  res.status(200).json({
    success: true,
    message: 'Delivery deleted successfully',
  });
});