// server/src/controllers/payoutMethod.controller.js
import { PayoutMethod } from '../models/payoutMethod.model.js';
import { AppError, asyncHandler } from '../middleware/error.middleware.js';
import { deleteCacheByPattern } from '../utils/cache.utils.js';

// @desc    Add payout method (UPI or Bank)
// @route   POST /api/payout-methods
// @access  Private (Freelancer only)
export const addPayoutMethod = asyncHandler(async (req, res, next) => {
  const { type, upiId, accountHolderName, accountNumber, ifscCode, bankName, branchName } = req.body;

  // Validate type
  if (!['upi', 'bank'].includes(type)) {
    throw new AppError('Invalid payout method type. Must be upi or bank', 400);
  }

  // Validate UPI fields
  if (type === 'upi') {
    if (!upiId) {
      throw new AppError('Please provide UPI ID', 400);
    }
    // Validate UPI format
    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(upiId)) {
      throw new AppError('Invalid UPI ID format', 400);
    }
    // Check if UPI already exists
    const existingUpi = await PayoutMethod.findOne({ userId: req.user.id, type: 'upi', upiId });
    if (existingUpi) {
      throw new AppError('This UPI ID already exists', 400);
    }
  }

  // Validate bank fields
  if (type === 'bank') {
    if (!accountHolderName || !accountNumber || !ifscCode || !bankName) {
      throw new AppError('Please provide account holder name, account number, IFSC code, and bank name', 400);
    }
    // Validate IFSC
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) {
      throw new AppError('Invalid IFSC code format', 400);
    }
    // Check if bank account already exists
    const existingBank = await PayoutMethod.findOne({ 
      userId: req.user.id, 
      type: 'bank', 
      accountNumber 
    });
    if (existingBank) {
      throw new AppError('This bank account already exists', 400);
    }
  }

  // Check if this is first method - make it primary
  const existingMethods = await PayoutMethod.countDocuments({ userId: req.user.id });
  const isPrimary = existingMethods === 0;

  const displayInfo = type === 'upi' 
  ? upiId.toLowerCase()
  : `••••${accountNumber.slice(-4)}`;


  // Create payout method
  const payoutMethod = await PayoutMethod.create({
    userId: req.user.id,
    type,
    upiId: type === 'upi' ? upiId.toLowerCase() : null,
    accountHolderName: type === 'bank' ? accountHolderName : null,
    accountNumber: type === 'bank' ? accountNumber : null,
    ifscCode: type === 'bank' ? ifscCode.toUpperCase() : null,
    bankName: type === 'bank' ? bankName : null,
    branchName: type === 'bank' ? branchName || null : null,
     displayInfo,
    isPrimary,
  });

  await deleteCacheByPattern('payout-methods:*');

  res.status(201).json({
    success: true,
    message: 'Payout method added successfully',
    payoutMethod,
  });
});

// @desc    Get current user's payout methods
// @route   GET /api/payout-methods/my
// @access  Private
export const getMyPayoutMethods = asyncHandler(async (req, res, next) => {
  const payoutMethods = await PayoutMethod.find({ 
    userId: req.user.id, 
    isActive: true 
  })
    .sort({ isPrimary: -1, createdAt: -1 });

  res.status(200).json({
    success: true,
    count: payoutMethods.length,
    payoutMethods,
  });
});

// @desc    Get single payout method
// @route   GET /api/payout-methods/:id
// @access  Private (Owner)
export const getPayoutMethodById = asyncHandler(async (req, res, next) => {
  const payoutMethod = await PayoutMethod.findById(req.params.id);

  if (!payoutMethod) {
    throw new AppError('Payout method not found', 404);
  }

  // Check ownership
  if (payoutMethod.userId.toString() !== req.user.id) {
    throw new AppError('Not authorized to view this payout method', 403);
  }

  res.status(200).json({
    success: true,
    payoutMethod,
  });
});

// @desc    Update payout method
// @route   PUT /api/payout-methods/:id
// @access  Private (Owner)
export const updatePayoutMethod = asyncHandler(async (req, res, next) => {
  let payoutMethod = await PayoutMethod.findById(req.params.id);

  if (!payoutMethod) {
    throw new AppError('Payout method not found', 404);
  }

  // Check ownership
  if (payoutMethod.userId.toString() !== req.user.id) {
    throw new AppError('Not authorized to update this payout method', 403);
  }

  const { accountHolderName, bankName, branchName, upiId } = req.body;

  const updateData = {};
  
  if (payoutMethod.type === 'upi' && upiId) {
    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(upiId)) {
      throw new AppError('Invalid UPI ID format', 400);
    }
    updateData.upiId = upiId.toLowerCase();
  }

  if (payoutMethod.type === 'bank') {
    if (accountHolderName) updateData.accountHolderName = accountHolderName;
    if (bankName) updateData.bankName = bankName;
    if (branchName) updateData.branchName = branchName;
  }

  payoutMethod = await PayoutMethod.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  await deleteCacheByPattern('payout-methods:*');

  res.status(200).json({
    success: true,
    message: 'Payout method updated successfully',
    payoutMethod,
  });
});

// @desc    Set payout method as primary
// @route   PATCH /api/payout-methods/:id/primary
// @access  Private (Owner)
export const setPrimaryPayoutMethod = asyncHandler(async (req, res, next) => {
  const payoutMethod = await PayoutMethod.findById(req.params.id);

  if (!payoutMethod) {
    throw new AppError('Payout method not found', 404);
  }

  // Check ownership
  if (payoutMethod.userId.toString() !== req.user.id) {
    throw new AppError('Not authorized to update this payout method', 403);
  }

  // Remove primary from all methods
  await PayoutMethod.updateMany(
    { userId: req.user.id },
    { isPrimary: false }
  );

  // Set this method as primary
  payoutMethod.isPrimary = true;
  await payoutMethod.save();

  await deleteCacheByPattern('payout-methods:*');

  res.status(200).json({
    success: true,
    message: 'Payout method set as primary',
    payoutMethod,
  });
});

// @desc    Delete payout method
// @route   DELETE /api/payout-methods/:id
// @access  Private (Owner)
export const deletePayoutMethod = asyncHandler(async (req, res, next) => {
  const payoutMethod = await PayoutMethod.findById(req.params.id);

  if (!payoutMethod) {
    throw new AppError('Payout method not found', 404);
  }

  // Check ownership
  if (payoutMethod.userId.toString() !== req.user.id) {
    throw new AppError('Not authorized to delete this payout method', 403);
  }

  // Soft delete
  payoutMethod.isActive = false;
  payoutMethod.isPrimary = false;
  await payoutMethod.save();

  // If this was primary, make another method primary
  const otherMethod = await PayoutMethod.findOne({ 
    userId: req.user.id, 
    isActive: true 
  });
  if (otherMethod) {
    otherMethod.isPrimary = true;
    await otherMethod.save();
  }

  await deleteCacheByPattern('payout-methods:*');

  res.status(200).json({
    success: true,
    message: 'Payout method deleted successfully',
  });
});