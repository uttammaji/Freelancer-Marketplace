// server/src/controllers/contract.controller.js
import { Contract } from '../models/contract.model.js';
import { Project } from '../models/project.model.js';
import { Proposal } from '../models/proposal.model.js';
import { AppError, asyncHandler } from '../middleware/error.middleware.js';
import { deleteCacheByPattern } from '../utils/cache.utils.js';

// @desc    Create a contract (when client hires freelancer)
// @route   POST /api/contracts
// @access  Private (Client only)
export const createContract = asyncHandler(async (req, res, next) => {
  const { projectId, proposalId } = req.body;

  // Check if project exists
  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  // Check if user is the project owner
  if (project.clientId.toString() !== req.user.id) {
    throw new AppError('Not authorized to create contract for this project', 403);
  }

  // Check if proposal exists
  const proposal = await Proposal.findById(proposalId);
  if (!proposal) {
    throw new AppError('Proposal not found', 404);
  }

  // Check if proposal is for this project
  if (proposal.projectId.toString() !== projectId) {
    throw new AppError('Proposal does not belong to this project', 400);
  }

  // Check if contract already exists
  const existingContract = await Contract.findOne({ projectId });
  if (existingContract) {
    throw new AppError('Contract already exists for this project', 400);
  }

  // Create contract
  const contract = await Contract.create({
    projectId,
    clientId: req.user.id,
    freelancerId: proposal.freelancerId,
    amount: proposal.bidAmount,
    startDate: new Date(),
    deadline: new Date(Date.now() + proposal.deliveryDays * 24 * 60 * 60 * 1000),
    status: 'active'
  });

  // Update project status
  project.status = 'in_progress';
  project.hiredFreelancerId = proposal.freelancerId;
  await project.save();

  // Update proposal status
  proposal.status = 'accepted';
  await proposal.save();
  await deleteCacheByPattern('contracts:*');
  res.status(201).json({
    success: true,
    message: 'Contract created successfully',
    contract
  });
});

// @desc    Get contract by ID
// @route   GET /api/contracts/:id
// @access  Private
export const getContractById = asyncHandler(async (req, res, next) => {
  const contract = await Contract.findById(req.params.id)
    .populate('projectId', 'title description')
    .populate('clientId', 'name email avatar')
    .populate('freelancerId', 'name email avatar');

  if (!contract) {
    throw new AppError('Contract not found', 404);
  }

  // Check if user is part of this contract
  if (
    contract.clientId._id.toString() !== req.user.id &&
    contract.freelancerId._id.toString() !== req.user.id
  ) {
    throw new AppError('Not authorized to view this contract', 403);
  }

  res.status(200).json({
    success: true,
    contract
  });
});

// @desc    Get client's contracts
// @route   GET /api/contracts/client
// @access  Private (Client only)
export const getClientContracts = asyncHandler(async (req, res, next) => {
  const contracts = await Contract.find({ clientId: req.user.id })
    .populate('projectId', 'title')
    .populate('freelancerId', 'name email avatar')
    .sort({ createdAt: -1 });

  
  res.status(200).json({
    success: true,
    count: contracts.length,
    contracts
  });
});

// @desc    Get freelancer's contracts
// @route   GET /api/contracts/freelancer
// @access  Private (Freelancer only)
export const getFreelancerContracts = asyncHandler(async (req, res, next) => {
  const contracts = await Contract.find({ freelancerId: req.user.id })
    .populate('projectId', 'title')
    .populate('clientId', 'name email avatar')
    .sort({ createdAt: -1 });

  
  res.status(200).json({
    success: true,
    count: contracts.length,
    contracts
  });
});

// @desc    Update contract status
// @route   PATCH /api/contracts/:id/status
// @access  Private (Client only)
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

  // Check if user is the client
  if (contract.clientId.toString() !== req.user.id) {
    throw new AppError('Not authorized to update this contract', 403);
  }

  contract.status = status;

  // Set completion date if completed
  if (status === 'completed') {
    contract.completedAt = new Date();
  }

  await contract.save();
  await deleteCacheByPattern('contracts:*');

  // Update project status
  const project = await Project.findById(contract.projectId);
  if (project) {
    project.status = status === 'completed' ? 'completed' : 'cancelled';
    await project.save();
  }
  await deleteCacheByPattern('projects:*');


  res.status(200).json({
    success: true,
    message: 'Contract status updated',
    contract
  });
});

// @desc    Update contract progress (freelancer)
// @route   PATCH /api/contracts/:id/progress
// @access  Private (Freelancer only)
export const updateContractProgress = asyncHandler(async (req, res, next) => {
  const { progress } = req.body;

  if (progress < 0 || progress > 100) {
    throw new AppError('Progress must be between 0 and 100', 400);
  }

  const contract = await Contract.findById(req.params.id);

  if (!contract) {
    throw new AppError('Contract not found', 404);
  }

  // Check if user is the freelancer
  if (contract.freelancerId.toString() !== req.user.id) {
    throw new AppError('Not authorized to update this contract', 403);
  }

  contract.progress = progress;
  await contract.save();
  await deleteCacheByPattern('contracts:*');
  

  res.status(200).json({
    success: true,
    message: 'Progress updated',
    progress: contract.progress
  });
});

// @desc    Get active contracts count
// @route   GET /api/contracts/stats
// @access  Private
export const getContractStats = asyncHandler(async (req, res, next) => {
  let query = {};
  
  // Different stats for client vs freelancer
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
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  res.status(200).json({
    success: true,
    stats: {
      active: activeCount,
      completed: completedCount,
      disputed: disputedCount,
      totalEarnings: totalEarnings.length > 0 ? totalEarnings[0].total : 0
    }
  });
});