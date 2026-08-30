// server/src/controllers/dispute.controller.js
import { Dispute } from '../models/dispute.model.js';
import { Contract } from '../models/contract.model.js';
import { Project } from '../models/project.model.js';
import { AppError, asyncHandler } from '../middleware/error.middleware.js';
import { deleteCacheByPattern } from '../utils/cache.utils.js';

// @desc    Create dispute
// @route   POST /api/disputes
// @access  Private
export const createDispute = asyncHandler(async (req, res, next) => {
  const { contractId, reason, description, evidence } = req.body;

  if (!contractId || !reason || !description) {
    throw new AppError('Please provide contractId, reason, and description', 400);
  }

  const contract = await Contract.findById(contractId);
  if (!contract) {
    throw new AppError('Contract not found', 404);
  }

  // Check if user is part of contract
  const isClient = contract.clientId.toString() === req.user.id;
  const isFreelancer = contract.freelancerId.toString() === req.user.id;

  if (!isClient && !isFreelancer) {
    throw new AppError('Not authorized to open dispute for this contract', 403);
  }

  // Determine who dispute is against
  const against = isClient ? contract.freelancerId : contract.clientId;

  // Check existing dispute
  const existingDispute = await Dispute.findOne({ 
    contractId, 
    status: { $in: ['open', 'under_review'] } 
  });
  
  if (existingDispute) {
    throw new AppError('Dispute already exists for this contract', 400);
  }

  // Create dispute
  const dispute = await Dispute.create({
    projectId: contract.projectId,
    contractId,
    openedBy: req.user.id,
    against,
    reason,
    description,
    evidence: evidence || [],
    status: 'open',
  });

  // Update contract
  contract.status = 'disputed';
  await contract.save();

  await deleteCacheByPattern('disputes:*');

  res.status(201).json({
    success: true,
    message: 'Dispute opened successfully',
    dispute,
  });
});

// @desc    Get all disputes (Admin)
// @route   GET /api/disputes
// @access  Admin
export const getAllDisputes = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let query = {};
  if (req.query.status) query.status = req.query.status;

  const disputes = await Dispute.find(query)
    .populate('projectId', 'title')
    .populate('contractId', 'projectTitle clientId freelancerId')
    .populate('openedBy', 'name email role')
    .populate('against', 'name email role')
    .populate('adminId', 'name email')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Dispute.countDocuments(query);

  res.status(200).json({
    success: true,
    count: disputes.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    disputes,
  });
});

// @desc    Get dispute statistics (Admin)
// @route   GET /api/disputes/stats
// @access  Admin
export const getDisputeStats = asyncHandler(async (req, res, next) => {
  const [total, open, underReview, resolved, closed] = await Promise.all([
    Dispute.countDocuments(),
    Dispute.countDocuments({ status: 'open' }),
    Dispute.countDocuments({ status: 'under_review' }),
    Dispute.countDocuments({ status: 'resolved' }),
    Dispute.countDocuments({ status: 'closed' }),
  ]);

  res.status(200).json({
    success: true,
    stats: {
      total,
      open,
      underReview,
      resolved,
      closed,
    },
  });
});

// @desc    Get my disputes
// @route   GET /api/disputes/my
// @access  Private
export const getMyDisputes = asyncHandler(async (req, res, next) => {
  const disputes = await Dispute.find({
    $or: [
      { openedBy: req.user.id },
      { against: req.user.id },
    ],
  })
    .populate('projectId', 'title')
    .populate('contractId', 'projectTitle')
    .populate('openedBy', 'name email')
    .populate('against', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: disputes.length,
    disputes,
  });
});

// @desc    Get single dispute
// @route   GET /api/disputes/:id
// @access  Private
export const getDisputeById = asyncHandler(async (req, res, next) => {
  const dispute = await Dispute.findById(req.params.id)
    .populate('projectId', 'title')
    .populate('contractId', 'projectTitle clientId freelancerId')
    .populate('openedBy', 'name email role')
    .populate('against', 'name email role')
    .populate('adminId', 'name email');

  if (!dispute) {
    throw new AppError('Dispute not found', 404);
  }

  const isInvolved = 
    dispute.openedBy._id.toString() === req.user.id ||
    dispute.against._id.toString() === req.user.id;

  if (!isInvolved && req.user.role !== 'admin') {
    throw new AppError('Not authorized to view this dispute', 403);
  }

  res.status(200).json({
    success: true,
    dispute,
  });
});

// @desc    Update dispute (openedBy)
// @route   PUT /api/disputes/:id
// @access  Private
export const updateDispute = asyncHandler(async (req, res, next) => {
  let dispute = await Dispute.findById(req.params.id);

  if (!dispute) {
    throw new AppError('Dispute not found', 404);
  }

  if (dispute.openedBy.toString() !== req.user.id) {
    throw new AppError('Not authorized to update this dispute', 403);
  }

  if (dispute.status !== 'open') {
    throw new AppError('Cannot update dispute that is not open', 400);
  }

  const { reason, description, evidence } = req.body;

  dispute = await Dispute.findByIdAndUpdate(
    req.params.id,
    {
      reason: reason || dispute.reason,
      description: description || dispute.description,
      evidence: evidence || dispute.evidence,
    },
    { new: true, runValidators: true }
  );

  await deleteCacheByPattern('disputes:*');

  res.status(200).json({
    success: true,
    message: 'Dispute updated successfully',
    dispute,
  });
});

// @desc    Resolve dispute (Admin)
// @route   PATCH /api/disputes/:id/resolve
// @access  Admin
export const resolveDispute = asyncHandler(async (req, res, next) => {
  const { resolution, adminNote } = req.body;

  const validResolutions = ['refund_client', 'release_payment', 'partial_refund', 'no_action'];
  if (!resolution || !validResolutions.includes(resolution)) {
    throw new AppError('Invalid resolution type', 400);
  }

  const dispute = await Dispute.findById(req.params.id);
  if (!dispute) {
    throw new AppError('Dispute not found', 404);
  }

  if (dispute.status === 'resolved' || dispute.status === 'closed') {
    throw new AppError('Dispute already resolved', 400);
  }

  dispute.status = 'resolved';
  dispute.resolution = resolution;
  dispute.adminNote = adminNote || '';
  dispute.adminId = req.user.id;
  dispute.resolvedAt = new Date();
  await dispute.save();

  // Update contract
  const contract = await Contract.findById(dispute.contractId);
  if (contract) {
    if (resolution === 'refund_client') {
      contract.status = 'cancelled';
    } else if (resolution === 'release_payment') {
      contract.status = 'completed';
      contract.completedAt = new Date();
    }
    await contract.save();
  }

  await deleteCacheByPattern('disputes:*');
  await deleteCacheByPattern('contracts:*');

  res.status(200).json({
    success: true,
    message: 'Dispute resolved successfully',
    dispute,
  });
});

// @desc    Close dispute
// @route   PATCH /api/disputes/:id/close
// @access  Private (openedBy)
export const closeDispute = asyncHandler(async (req, res, next) => {
  const dispute = await Dispute.findById(req.params.id);

  if (!dispute) {
    throw new AppError('Dispute not found', 404);
  }

  if (dispute.openedBy.toString() !== req.user.id) {
    throw new AppError('Not authorized to close this dispute', 403);
  }

  if (dispute.status === 'closed') {
    throw new AppError('Dispute already closed', 400);
  }

  dispute.status = 'closed';
  dispute.resolvedAt = new Date();
  await dispute.save();

  // Restore contract
  const contract = await Contract.findById(dispute.contractId);
  if (contract) {
    contract.status = 'in_progress';
    await contract.save();
  }

  await deleteCacheByPattern('disputes:*');

  res.status(200).json({
    success: true,
    message: 'Dispute closed successfully',
    dispute,
  });
});