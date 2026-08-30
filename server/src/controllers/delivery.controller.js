// server/src/controllers/delivery.controller.js
import { Delivery } from '../models/delivery.model.js';
import { Contract } from '../models/contract.model.js';
import { Project } from '../models/project.model.js';
import { AppError, asyncHandler } from '../middleware/error.middleware.js';
import { deleteCacheByPattern } from '../utils/cache.utils.js';

// ============ CREATE DELIVERY ============

// @desc    Submit work delivery (Freelancer)
// @route   POST /api/deliveries
// @access  Private (Freelancer)
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

  // Check contract exists
  const contract = await Contract.findById(contractId);
  if (!contract) {
    throw new AppError('Contract not found', 404);
  }

  // Check if user is the freelancer
  if (contract.freelancerId.toString() !== req.user.id) {
    throw new AppError('Only freelancer can submit work', 403);
  }

  // Check contract status
  if (contract.status !== 'active' && contract.status !== 'in_progress') {
    throw new AppError('Contract is not in progress', 400);
  }

  // Check if delivery already pending
  const existingDelivery = await Delivery.findOne({
    contractId,
    status: { $in: ['submitted', 'under_review'] },
  });

  if (existingDelivery) {
    throw new AppError('You already have a pending delivery for this contract', 400);
  }

  // Create delivery
  const delivery = await Delivery.create({
    contractId,
    projectId: contract.projectId,
    freelancerId: req.user.id,
    title,
    description,
    attachments: attachments || [],
    githubUrl: githubUrl || null,
    liveDemoUrl: liveDemoUrl || null,
    status: 'submitted',
  });

  // Update contract
  contract.status = 'submitted';
  await contract.save();

  await deleteCacheByPattern('deliveries:*');
  await deleteCacheByPattern('contracts:*');

  res.status(201).json({
    success: true,
    message: 'Work submitted successfully',
    delivery,
  });
});

// ============ GET DELIVERIES ============

// @desc    Get deliveries for a contract
// @route   GET /api/deliveries/contract/:contractId
// @access  Private (Client or Freelancer)
export const getContractDeliveries = asyncHandler(async (req, res, next) => {
  const contract = await Contract.findById(req.params.contractId);
  if (!contract) {
    throw new AppError('Contract not found', 404);
  }

  // Check authorization
  const isInvolved =
    contract.clientId.toString() === req.user.id ||
    contract.freelancerId.toString() === req.user.id;

  if (!isInvolved) {
    throw new AppError('Not authorized to view deliveries', 403);
  }

  const deliveries = await Delivery.find({ contractId: req.params.contractId })
    .populate('freelancerId', 'name email avatar')
    .populate('reviewedBy', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: deliveries.length,
    deliveries,
  });
});

// @desc    Get my deliveries (Freelancer)
// @route   GET /api/deliveries/my
// @access  Private (Freelancer)
export const getMyDeliveries = asyncHandler(async (req, res, next) => {
  const deliveries = await Delivery.find({ freelancerId: req.user.id })
    .populate('projectId', 'title')
    .populate('contractId', 'projectTitle')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: deliveries.length,
    deliveries,
  });
});

// @desc    Get single delivery
// @route   GET /api/deliveries/:id
// @access  Private
export const getDeliveryById = asyncHandler(async (req, res, next) => {
  const delivery = await Delivery.findById(req.params.id)
    .populate('freelancerId', 'name email avatar')
    .populate('projectId', 'title')
    .populate('reviewedBy', 'name email');

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

// ============ REVIEW DELIVERY ============

// @desc    Accept delivery (Client)
// @route   PATCH /api/deliveries/:id/accept
// @access  Private (Client)
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

  // Check if user is client
  if (contract.clientId.toString() !== req.user.id) {
    throw new AppError('Only client can accept delivery', 403);
  }

  // Check delivery status
  if (delivery.status !== 'submitted' && delivery.status !== 'under_review') {
    throw new AppError('Delivery already processed', 400);
  }

  // Update delivery
  delivery.status = 'accepted';
  delivery.reviewedBy = req.user.id;
  delivery.reviewedAt = new Date();
  delivery.feedback = feedback || '';
  await delivery.save();

  // Update contract
  contract.status = 'completed';
  contract.completedAt = new Date();
  await contract.save();

  // Update project
  await Project.findByIdAndUpdate(contract.projectId, { status: 'completed' });

  await deleteCacheByPattern('deliveries:*');
  await deleteCacheByPattern('contracts:*');
  await deleteCacheByPattern('projects:*');

  res.status(200).json({
    success: true,
    message: 'Delivery accepted. Contract completed!',
    delivery,
  });
});

// @desc    Request revision (Client)
// @route   PATCH /api/deliveries/:id/request-revision
// @access  Private (Client)
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
  delivery.reviewedBy = req.user.id;
  delivery.reviewedAt = new Date();
  delivery.feedback = feedback;
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

// ============ UPDATE DELIVERY ============

// @desc    Update delivery (Freelancer - after revision)
// @route   PUT /api/deliveries/:id
// @access  Private (Freelancer)
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

  const { title, description, attachments, githubUrl, liveDemoUrl } = req.body;

  delivery = await Delivery.findByIdAndUpdate(
    req.params.id,
    {
      title: title || delivery.title,
      description: description || delivery.description,
      attachments: attachments || delivery.attachments,
      githubUrl: githubUrl || delivery.githubUrl,
      liveDemoUrl: liveDemoUrl || delivery.liveDemoUrl,
      status: 'submitted',
      feedback: null,
    },
    { new: true, runValidators: true }
  );

  // Update contract
  await Contract.findByIdAndUpdate(delivery.contractId, { status: 'submitted' });

  await deleteCacheByPattern('deliveries:*');

  res.status(200).json({
    success: true,
    message: 'Delivery updated and resubmitted',
    delivery,
  });
});

// ============ DELETE DELIVERY ============

// @desc    Delete delivery (Freelancer - if not processed)
// @route   DELETE /api/deliveries/:id
// @access  Private (Freelancer)
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

  // Restore contract status
  await Contract.findByIdAndUpdate(delivery.contractId, { status: 'in_progress' });

  await deleteCacheByPattern('deliveries:*');

  res.status(200).json({
    success: true,
    message: 'Delivery deleted successfully',
  });
});