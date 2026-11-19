// server/src/controllers/payment.controller.js
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Payment } from '../models/payment.model.js';
import { Contract } from '../models/contract.model.js';
import { Transaction } from '../models/transaction.model.js';
import { User } from '../models/user.models.js';
import { AppError, asyncHandler } from '../middleware/error.middleware.js';
import { sendPaymentSuccessEmail, sendContractCreatedEmail } from '../utils/notificationEmails.js';
import { sendEmailAsync } from '../utils/sendEmail.js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create Razorpay order for contract payment
 * @route POST /api/payments/create-order
 * @access Private (Client)
 */
export const createPaymentOrder = asyncHandler(async (req, res, next) => {
  const { contractId } = req.body;

  const contract = await Contract.findById(contractId);
  if (!contract) {
    throw new AppError('Contract not found', 404);
  }

  if (contract.clientId.toString() !== req.user.id) {
    throw new AppError('Not authorized to pay for this contract', 403);
  }

  if (contract.status === 'active') {
    throw new AppError('Contract is already active', 400);
  }

  const options = {
    amount: Math.round(contract.amount * 100),
    currency: 'INR',
    receipt: `contract_${contractId}`,
    notes: {
      contractId: contractId,
      projectId: contract.projectId.toString(),
      clientId: contract.clientId.toString(),
      freelancerId: contract.freelancerId.toString(),
    },
  };

  const order = await razorpay.orders.create(options);

  const payment = await Payment.create({
    clientId: contract.clientId,
    freelancerId: contract.freelancerId,
    projectId: contract.projectId,
    contractId: contract._id,
    orderId: order.id,
    amount: contract.amount,
    currency: 'INR',
    status: 'created',
  });

  res.status(201).json({
    success: true,
    message: 'Payment order created',
    order: {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    },
    payment,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  });
});

/**
 * Verify Razorpay payment signature and activate contract
 * @route POST /api/payments/verify
 * @access Private (Client)
 */
export const verifyPayment = asyncHandler(async (req, res, next) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    paymentId,
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new AppError('Missing payment verification data', 400);
  }

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    throw new AppError('Invalid payment signature', 400);
  }

  const payment = await Payment.findOne({ orderId: razorpay_order_id });
  if (!payment) {
    throw new AppError('Payment record not found', 404);
  }

  payment.paymentId = razorpay_payment_id;
  payment.signature = razorpay_signature;
  payment.status = 'paid';
  payment.paidAt = new Date();
  await payment.save();

  const contract = await Contract.findById(payment.contractId);
  if (contract) {
    contract.status = 'active';
    contract.startDate = new Date();
    await contract.save();
  }

  await Transaction.create({
    userId: payment.clientId,
    projectId: payment.projectId,
    contractId: payment.contractId,
    paymentId: payment._id,
    type: 'project_payment',
    direction: 'debit',
    amount: payment.amount,
    currency: payment.currency,
    status: 'completed',
    description: `Payment for contract ${contract?.projectId || ''}`,
  });

  const platformFee = payment.amount * 0.05;
  if (platformFee > 0) {
    await Transaction.create({
      userId: payment.clientId,
      projectId: payment.projectId,
      contractId: payment.contractId,
      paymentId: payment._id,
      type: 'platform_fee',
      direction: 'credit',
      amount: platformFee,
      currency: payment.currency,
      status: 'completed',
      description: 'Platform fee (5%)',
    });
  }

  const freelancerAmount = payment.amount - platformFee;
  await Transaction.create({
    userId: payment.freelancerId,
    projectId: payment.projectId,
    contractId: payment.contractId,
    paymentId: payment._id,
    type: 'freelancer_earning',
    direction: 'credit',
    amount: freelancerAmount,
    currency: payment.currency,
    status: 'pending',
    description: 'Escrow held - pending work completion',
  });

  // Send notification emails (non-blocking)
  try {
    const client = await User.findById(payment.clientId);
    const freelancer = await User.findById(payment.freelancerId);

    if (client) {
      sendEmailAsync({
        email: client.email,
        subject: 'Payment Successful - Escrow Funded',
        html: await sendPaymentSuccessEmail(client, payment, contract),
      });
    }

    if (freelancer) {
      sendEmailAsync({
        email: freelancer.email,
        subject: 'You Have Been Hired',
        html: await sendContractCreatedEmail(freelancer, contract),
      });
    }
  } catch (emailError) {
    console.error('Email notification failed:', emailError.message);
  }

  res.status(200).json({
    success: true,
    message: 'Payment verified successfully. Contract activated!',
    payment,
    contract,
  });
});

/**
 * Get payment by ID
 * @route GET /api/payments/:id
 * @access Private
 */
export const getPaymentById = asyncHandler(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id)
    .populate('clientId', 'name email')
    .populate('freelancerId', 'name email')
    .populate('projectId', 'title');

  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  const isClient = payment.clientId._id.toString() === req.user.id;
  const isFreelancer = payment.freelancerId._id.toString() === req.user.id;

  if (!isClient && !isFreelancer && req.user.role !== 'admin') {
    throw new AppError('Not authorized to view this payment', 403);
  }

  res.status(200).json({
    success: true,
    payment,
  });
});

/**
 * Get client's payments
 * @route GET /api/payments/client
 * @access Private (Client)
 */
export const getClientPayments = asyncHandler(async (req, res, next) => {
  const payments = await Payment.find({ clientId: req.user.id })
    .populate('freelancerId', 'name email avatar')
    .populate('projectId', 'title')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: payments.length,
    payments,
  });
});

/**
 * Get freelancer's payments
 * @route GET /api/payments/freelancer
 * @access Private (Freelancer)
 */
export const getFreelancerPayments = asyncHandler(async (req, res, next) => {
  const payments = await Payment.find({ freelancerId: req.user.id })
    .populate('clientId', 'name email avatar')
    .populate('projectId', 'title')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: payments.length,
    payments,
  });
});

/**
 * Get all payments (Admin)
 * @route GET /api/payments
 * @access Private (Admin)
 */
export const getAllPayments = asyncHandler(async (req, res, next) => {
  const payments = await Payment.find()
    .populate('clientId', 'name email')
    .populate('freelancerId', 'name email')
    .populate('projectId', 'title')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: payments.length,
    payments,
  });
});