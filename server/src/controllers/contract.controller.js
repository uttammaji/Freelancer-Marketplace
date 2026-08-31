// server/src/controllers/contract.controller.js
import { Contract } from '../models/contract.model.js';
import { Project } from '../models/project.model.js';
import { Proposal } from '../models/proposal.model.js';
import { User } from '../models/user.models.js';
import { AppError, asyncHandler } from '../middleware/error.middleware.js';
import { deleteCacheByPattern } from '../utils/cache.utils.js';
import { sendContractCreatedEmail } from '../utils/notificationEmails.js';

/**
 * Create contract (Client hires freelancer)
 * @route POST /api/contracts
 * @access Private (Client)
 */
export const createContract = asyncHandler(async (req, res, next) => {
  const { projectId, proposalId } = req.body;

  if (!projectId || !proposalId) {
    throw new AppError('Please provide both projectId and proposalId', 400);
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  if (project.clientId.toString() !== req.user.id) {
    throw new AppError('Not authorized to create contract for this project', 403);
  }

  const proposal = await Proposal.findById(proposalId);
  if (!proposal) {
    throw new AppError('Proposal not found', 404);
  }

  if (proposal.projectId.toString() !== projectId) {
    throw new AppError('Proposal does not belong to this project', 400);
  }

  const existingContract = await Contract.findOne({ projectId });
  if (existingContract) {
    return res.status(200).json({
      success: true,
      message: 'Contract already exists for this project',
      contract: existingContract,
    });
  }

  const amount = proposal.bidAmount;
  const platformFee = Math.round(amount * 0.05);
  const freelancerAmount = amount - platformFee;

  const contract = await Contract.create({
    projectId,
    proposalId,
    clientId: req.user.id,
    freelancerId: proposal.freelancerId,
    amount,
    platformFee,
    freelancerAmount,
    startDate: new Date(),
    deadline: new Date(Date.now() + proposal.deliveryDays * 24 * 60 * 60 * 1000),
    status: 'pending_payment',
  });

  project.status = 'in_progress';
  project.hiredFreelancerId = proposal.freelancerId;
  await project.save();

  proposal.status = 'accepted';
  await proposal.save();

  await deleteCacheByPattern('contracts:*');
  await deleteCacheByPattern('projects:*');

  // Send email to freelancer (non-blocking)
  try {
    const freelancer = await User.findById(contract.freelancerId);
    if (freelancer) {
      sendContractCreatedEmail(freelancer, contract);
    }
  } catch (emailError) {
    console.error('Contract email failed:', emailError.message);
  }

  res.status(201).json({
    success: true,
    message: 'Contract created successfully',
    contract,
  });
});

/**
 * Get contract by ID
 * @route GET /api/contracts/:id
 * @access Private
 */
export const getContractById = asyncHandler(async (req, res, next) => {
  const contract = await Contract.findById(req.params.id)
    .populate('projectId', 'title description')
    .populate('clientId', 'name email avatar')
    .populate('freelancerId', 'name email avatar');

  if (!contract) {
    throw new AppError('Contract not found', 404);
  }

  if (
    contract.clientId._id.toString() !== req.user.id &&
    contract.freelancerId._id.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    throw new AppError('Not authorized to view this contract', 403);
  }

  res.status(200).json({
    success: true,
    contract,
  });
});

/**
 * Get client's contracts
 * @route GET /api/contracts/client
 * @access Private (Client)
 */
export const getClientContracts = asyncHandler(async (req, res, next) => {
  const contracts = await Contract.find({ clientId: req.user.id })
    .populate('projectId', 'title')
    .populate('freelancerId', 'name email avatar')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: contracts.length,
    contracts,
  });
});

/**
 * Get freelancer's contracts
 * @route GET /api/contracts/freelancer
 * @access Private (Freelancer)
 */
export const getFreelancerContracts = asyncHandler(async (req, res, next) => {
  const contracts = await Contract.find({ freelancerId: req.user.id })
    .populate('projectId', 'title')
    .populate('clientId', 'name email avatar')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: contracts.length,
    contracts,
  });
});

/**
 * Update contract status
 * @route PATCH /api/contracts/:id/status
 * @access Private (Client)
 */
export const updateContractStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  const validStatuses = ['active', 'completed', 'cancelled', 'disputed'];
  if (!validStatuses.includes(status)) {
    throw new AppError('Invalid contract status', 400);
  }

  const contract = await Contract.findById(req.params.id);

  if (!contract) {
    throw new AppError('Contract not found', 404);
  }

  if (contract.clientId.toString() !== req.user.id) {
    throw new AppError('Not authorized to update this contract', 403);
  }

  contract.status = status;

  if (status === 'completed') {
    contract.completedAt = new Date();
  }

  await contract.save();
  await deleteCacheByPattern('contracts:*');

  const project = await Project.findById(contract.projectId);
  if (project) {
    project.status = status === 'completed' ? 'completed' : 'cancelled';
    await project.save();
  }
  await deleteCacheByPattern('projects:*');

  res.status(200).json({
    success: true,
    message: 'Contract status updated',
    contract,
  });
});

/**
 * Update contract progress
 * @route PATCH /api/contracts/:id/progress
 * @access Private (Freelancer)
 */
export const updateContractProgress = asyncHandler(async (req, res, next) => {
  const { progress } = req.body;

  if (progress < 0 || progress > 100) {
    throw new AppError('Progress must be between 0 and 100', 400);
  }

  const contract = await Contract.findById(req.params.id);

  if (!contract) {
    throw new AppError('Contract not found', 404);
  }

  if (contract.freelancerId.toString() !== req.user.id) {
    throw new AppError('Not authorized to update this contract', 403);
  }

  contract.progress = progress;
  await contract.save();
  await deleteCacheByPattern('contracts:*');

  res.status(200).json({
    success: true,
    message: 'Progress updated',
    progress: contract.progress,
  });
});

/**
 * Get contract stats
 * @route GET /api/contracts/stats
 * @access Private
 */
export const getContractStats = asyncHandler(async (req, res, next) => {
  let query = {};

  if (req.user.role === 'client') {
    query.clientId = req.user.id;
  } else {
    query.freelancerId = req.user.id;
  }

  const activeCount = await Contract.countDocuments({ ...query, status: 'active' });
  const completedCount = await Contract.countDocuments({ ...query, status: 'completed' });
  const disputedCount = await Contract.countDocuments({ ...query, status: 'disputed' });

  const totalEarnings = await Contract.aggregate([
    { $match: { ...query, status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$freelancerAmount' } } },
  ]);

  res.status(200).json({
    success: true,
    stats: {
      active: activeCount,
      completed: completedCount,
      disputed: disputedCount,
      totalEarnings: totalEarnings.length > 0 ? totalEarnings[0].total : 0,
    },
  });
});