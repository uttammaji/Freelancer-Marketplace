// server/src/controllers/proposal.controller.js
import { Proposal } from '../models/proposal.model.js';
import { Project } from '../models/project.model.js';
import { AppError, asyncHandler } from '../middleware/error.middleware.js';
import { deleteCacheByPattern } from '../utils/cache.utils.js';

// @desc    Submit a proposal for a project
// @route   POST /api/proposals
// @access  Private (Freelancer only)
export const submitProposal = asyncHandler(async (req, res, next) => {
  const {
    projectId,
    coverLetter,
    bidAmount,
    deliveryDays,
    attachments
  } = req.body;

  // Check if project exists
  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  // Check if project is open
  if (project.status !== 'open') {
    throw new AppError('This project is not open for proposals', 400);
  }

  // Check if freelancer already submitted proposal
  const existingProposal = await Proposal.findOne({
    projectId,
    freelancerId: req.user.id
  });

  if (existingProposal) {
    throw new AppError('You have already submitted a proposal for this project', 400);
  }

  // Validate bid amount against project budget
  if (bidAmount < project.budgetMin || bidAmount > project.budgetMax) {
    throw new AppError(`Bid amount must be between ${project.budgetMin} and ${project.budgetMax}`, 400);
  }

  // Create proposal
  const proposal = await Proposal.create({
    projectId,
    freelancerId: req.user.id,
    coverLetter,
    bidAmount,
    deliveryDays,
    attachments
  });

  // Update project proposal count
  project.proposalCount += 1;
  await project.save();
  await deleteCacheByPattern('projects:*');

  res.status(201).json({
    success: true,
    message: 'Proposal submitted successfully',
    proposal
  });
});

// @desc    Get all proposals for a specific project
// @route   GET /api/proposals/project/:projectId
// @access  Private (Client only - project owner)
export const getProjectProposals = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.projectId);

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  // Check if user is the project owner
  if (project.clientId.toString() !== req.user.id) {
    throw new AppError('Not authorized to view these proposals', 403);
  }

  const proposals = await Proposal.find({ projectId: req.params.projectId })
    .populate('freelancerId', 'name email avatar')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: proposals.length,
    proposals
  });
});

// @desc    Get freelancer's own proposals
// @route   GET /api/proposals/my
// @access  Private (Freelancer only)
export const getMyProposals = asyncHandler(async (req, res, next) => {
  const proposals = await Proposal.find({ freelancerId: req.user.id })
    .populate('projectId', 'title budgetMin budgetMax status clientId')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: proposals.length,
    proposals
  });
});

// @desc    Get single proposal by ID
// @route   GET /api/proposals/:id
// @access  Private
export const getProposalById = asyncHandler(async (req, res, next) => {
  const proposal = await Proposal.findById(req.params.id)
    .populate('projectId', 'title description budgetMin budgetMax')
    .populate('freelancerId', 'name email avatar');

  if (!proposal) {
    throw new AppError('Proposal not found', 404);
  }

  // Check if user is proposal owner or project owner
  const project = await Project.findById(proposal.projectId);
  if (
    proposal.freelancerId._id.toString() !== req.user.id &&
    project.clientId.toString() !== req.user.id
  ) {
    throw new AppError('Not authorized to view this proposal', 403);
  }

  res.status(200).json({
    success: true,
    proposal
  });
});

// @desc    Update proposal (freelancer can edit if still pending)
// @route   PUT /api/proposals/:id
// @access  Private (Freelancer only)
export const updateProposal = asyncHandler(async (req, res, next) => {
  let proposal = await Proposal.findById(req.params.id);

  if (!proposal) {
    throw new AppError('Proposal not found', 404);
  }

  // Check if user is the proposal owner
  if (proposal.freelancerId.toString() !== req.user.id) {
    throw new AppError('Not authorized to update this proposal', 403);
  }

  // Check if proposal is still pending
  if (proposal.status !== 'pending') {
    throw new AppError('Cannot update proposal that is not pending', 400);
  }

  const { coverLetter, bidAmount, deliveryDays } = req.body;

  proposal = await Proposal.findByIdAndUpdate(
    req.params.id,
    {
      coverLetter: coverLetter || proposal.coverLetter,
      bidAmount: bidAmount || proposal.bidAmount,
      deliveryDays: deliveryDays || proposal.deliveryDays
    },
    { new: true, runValidators: true }
  );

  await deleteCacheByPattern('projects:*');

  res.status(200).json({
    success: true,
    message: 'Proposal updated successfully',
    proposal
  });
});

// @desc    Withdraw proposal
// @route   DELETE /api/proposals/:id
// @access  Private (Freelancer only)
export const withdrawProposal = asyncHandler(async (req, res, next) => {
  const proposal = await Proposal.findById(req.params.id);

  if (!proposal) {
    throw new AppError('Proposal not found', 404);
  }

  // Check if user is the proposal owner
  if (proposal.freelancerId.toString() !== req.user.id) {
    throw new AppError('Not authorized to withdraw this proposal', 403);
  }

  // Check if proposal is still pending
  if (proposal.status !== 'pending') {
    throw new AppError('Cannot withdraw proposal that is not pending', 400);
  }

  // Update proposal status to withdrawn
  proposal.status = 'withdrawn';
  await proposal.save();
  await deleteCacheByPattern('projects:*');
  await deleteCacheByPattern('proposals:*');
  // Decrement project proposal count
  const project = await Project.findById(proposal.projectId);
  if (project) {
    project.proposalCount = Math.max(0, project.proposalCount - 1);
    await project.save();
  }

  res.status(200).json({
    success: true,
    message: 'Proposal withdrawn successfully'
  });
});

// @desc    Shortlist proposal
// @route   PATCH /api/proposals/:id/shortlist
// @access  Private (Client only)
export const shortlistProposal = asyncHandler(async (req, res, next) => {
  const proposal = await Proposal.findById(req.params.id);

  if (!proposal) {
    throw new AppError('Proposal not found', 404);
  }

  // Check if user is the project owner
  const project = await Project.findById(proposal.projectId);
  if (project.clientId.toString() !== req.user.id) {
    throw new AppError('Not authorized to shortlist this proposal', 403);
  }

  if (proposal.status !== 'pending') {
    throw new AppError('Only pending proposals can be shortlisted', 400);
  }

  proposal.status = 'shortlisted';
  await proposal.save();

  res.status(200).json({
    success: true,
    message: 'Proposal shortlisted',
    status: proposal.status
  });
});

// @desc    Accept proposal (hire freelancer)
// @route   PATCH /api/proposals/:id/accept
// @access  Private (Client only)
export const acceptProposal = asyncHandler(async (req, res, next) => {
  const proposal = await Proposal.findById(req.params.id);

  if (!proposal) {
    throw new AppError('Proposal not found', 404);
  }

  // Check if user is the project owner
  const project = await Project.findById(proposal.projectId);
  if (project.clientId.toString() !== req.user.id) {
    throw new AppError('Not authorized to accept this proposal', 403);
  }

  if (proposal.status !== 'pending' && proposal.status !== 'shortlisted') {
    throw new AppError('This proposal cannot be accepted', 400);
  }

  // Accept this proposal
  proposal.status = 'accepted';
  await proposal.save();
  

  // Reject all other proposals for this project
  await Proposal.updateMany(
    { 
      projectId: proposal.projectId, 
      _id: { $ne: proposal._id },
      status: { $in: ['pending', 'shortlisted'] }
    },
    { status: 'rejected' }
  );

  // Update project status
  project.status = 'in_progress';
  project.hiredFreelancerId = proposal.freelancerId;
  await project.save();
  await deleteCacheByPattern('projects:*');
  
  res.status(200).json({
    success: true,
    message: 'Proposal accepted, freelancer hired',
    proposal,
    project
  });
});

// @desc    Reject proposal
// @route   PATCH /api/proposals/:id/reject
// @access  Private (Client only)
export const rejectProposal = asyncHandler(async (req, res, next) => {
  const proposal = await Proposal.findById(req.params.id);

  if (!proposal) {
    throw new AppError('Proposal not found', 404);
  }

  // Check if user is the project owner
  const project = await Project.findById(proposal.projectId);
  if (project.clientId.toString() !== req.user.id) {
    throw new AppError('Not authorized to reject this proposal', 403);
  }

  if (proposal.status !== 'pending' && proposal.status !== 'shortlisted') {
    throw new AppError('This proposal cannot be rejected', 400);
  }

  proposal.status = 'rejected';
  await proposal.save();

  res.status(200).json({
    success: true,
    message: 'Proposal rejected',
    status: proposal.status
  });
});