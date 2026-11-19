// server/src/controllers/payout.controller.js
import axios from 'axios';
import { PayoutMethod } from '../models/payoutMethod.model.js';
import { Transaction } from '../models/transaction.model.js';
import { AppError, asyncHandler } from '../middleware/error.middleware.js';
import { deleteCacheByPattern } from '../utils/cache.utils.js';
import { sendPayoutSentEmail } from '../utils/notificationEmails.js';

const RAZORPAYX_API = 'https://api.razorpay.com/v1';

const getAuthHeader = () => {
  const auth = Buffer.from(
    `${process.env.RAZORPAYX_KEY_ID}:${process.env.RAZORPAYX_KEY_SECRET}`
  ).toString('base64');
  return { Authorization: `Basic ${auth}` };
};

const createContact = async (user) => {
  try {
    const contactData = {
      name: user.name,
      email: user.email,
      contact: user.phone || '',
      type: 'vendor',
      reference_id: user._id.toString(),
    };

    const response = await axios.post(
      `${RAZORPAYX_API}/contacts`,
      contactData,
      {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.id;
  } catch (error) {
    console.error('Contact creation failed:', error.response?.data || error.message);
    throw new AppError(
      error.response?.data?.error?.description || 'Failed to create contact',
      500
    );
  }
};

const createFundAccount = async (contactId, payoutMethod) => {
  try {
    const fundAccountData = {
      contact_id: contactId,
      account_type: payoutMethod.type === 'upi' ? 'vpa' : 'bank_account',
    };

    if (payoutMethod.type === 'upi') {
      fundAccountData.vpa = { address: payoutMethod.upiId };
    } else {
      fundAccountData.bank_account = {
        name: payoutMethod.accountHolderName,
        account_number: payoutMethod.accountNumber,
        ifsc: payoutMethod.ifscCode,
      };
    }

    const response = await axios.post(
      `${RAZORPAYX_API}/fund_accounts`,
      fundAccountData,
      {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.id;
  } catch (error) {
    console.error('Fund account failed:', error.response?.data || error.message);
    throw new AppError(
      error.response?.data?.error?.description || 'Failed to create fund account',
      500
    );
  }
};

/**
 * Create payout (Freelancer withdraw)
 * @route POST /api/payouts
 * @access Private (Freelancer)
 */
export const createPayout = asyncHandler(async (req, res, next) => {
  const { amount, payoutMethodId } = req.body;

  if (!amount || amount <= 0) {
    throw new AppError('Please provide a valid amount', 400);
  }

  if (amount < 100) {
    throw new AppError('Minimum withdrawal amount is ₹100', 400);
  }

  if (!payoutMethodId) {
    throw new AppError('Please select a payout method', 400);
  }

  const payoutMethod = await PayoutMethod.findById(payoutMethodId);
  if (!payoutMethod) {
    throw new AppError('Payout method not found', 404);
  }

  if (payoutMethod.userId.toString() !== req.user.id) {
    throw new AppError('Not authorized to use this payout method', 403);
  }

  const user = req.user;

  try {
    let contactId = payoutMethod.razorpayContactId;
    if (!contactId) {
      contactId = await createContact(user);
      payoutMethod.razorpayContactId = contactId;
      await payoutMethod.save();
    }

    let fundAccountId = payoutMethod.razorpayFundAccountId;
    if (!fundAccountId) {
      fundAccountId = await createFundAccount(contactId, payoutMethod);
      payoutMethod.razorpayFundAccountId = fundAccountId;
      await payoutMethod.save();
    }

    const payoutData = {
      account_number: process.env.RAZORPAY_ACCOUNT_NUMBER,
      fund_account_id: fundAccountId,
      amount: Math.round(amount * 100),
      currency: 'INR',
      mode: payoutMethod.type === 'upi' ? 'UPI' : 'IMPS',
      purpose: 'payout',
      queue_if_low_balance: true,
      reference_id: `payout_${Date.now()}`,
      narration: 'SkillHire Payout',
    };

    const response = await axios.post(
      `${RAZORPAYX_API}/payouts`,
      payoutData,
      {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
      }
    );

    const payout = response.data;

    const initialStatus = payout.status === 'processed' ? 'completed' : 'pending';

    const transaction = await Transaction.create({
      userId: req.user.id,
      type: 'withdrawal',
      direction: 'debit',
      amount: amount,
      currency: 'INR',
      status: initialStatus,
      description: `Payout to ${payoutMethod.type === 'upi' ? payoutMethod.upiId : payoutMethod.bankName} [${payout.id}]`,
    });

    payoutMethod.totalWithdrawn += amount;
    payoutMethod.lastWithdrawalAt = new Date();
    payoutMethod.lastWithdrawalAmount = amount;
    await payoutMethod.save();

    await deleteCacheByPattern('payouts:*');
    await deleteCacheByPattern('transactions:*');

    // Send payout email (non-blocking)
    try {
      sendPayoutSentEmail(user, {
        id: payout.id,
        amount: amount,
        status: payout.status,
      });
    } catch (emailError) {
      console.error('Payout email failed:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: initialStatus === 'completed' ? 'Payout completed' : 'Payout initiated',
      payout: {
        id: payout.id,
        amount: payout.amount / 100,
        status: payout.status,
        mode: payout.mode,
      },
      transaction,
    });
  } catch (error) {
    console.error('Payout failed:', error.response?.data || error.message);
    throw new AppError(
      error.response?.data?.error?.description || 'Payout failed',
      500
    );
  }
});

/**
 * Check payout status
 * @route GET /api/payouts/:id/status
 * @access Private (Freelancer)
 */
export const checkPayoutStatus = asyncHandler(async (req, res, next) => {
  try {
    const response = await axios.get(
      `${RAZORPAYX_API}/payouts/${req.params.id}`,
      { headers: getAuthHeader() }
    );

    const payout = response.data;

    if (payout.status === 'processed') {
      await Transaction.findOneAndUpdate(
        { description: { $regex: req.params.id } },
        { status: 'completed' }
      );
    }

    if (['rejected', 'failed', 'reversed', 'cancelled'].includes(payout.status)) {
      await Transaction.findOneAndUpdate(
        { description: { $regex: req.params.id } },
        { status: 'failed' }
      );
    }

    res.status(200).json({
      success: true,
      payout: {
        id: payout.id,
        amount: payout.amount / 100,
        status: payout.status,
        mode: payout.mode,
        utr: payout.utr || null,
        failureReason: payout.status_details?.description || null,
      },
    });
  } catch (error) {
    console.error('Status check failed:', error.response?.data || error.message);
    throw new AppError('Failed to fetch payout status', 500);
  }
});

/**
 * Get my payouts with auto-sync
 * @route GET /api/payouts/my
 * @access Private (Freelancer)
 */
export const getMyPayouts = asyncHandler(async (req, res, next) => {
  const payouts = await Transaction.find({
    userId: req.user.id,
    type: 'withdrawal',
  }).sort({ createdAt: -1 }).limit(20);

  for (const payout of payouts) {
    if (payout.status === 'pending') {
      const match = payout.description?.match(/\[(pout_[^\]]+)\]/);
      if (match && match[1]) {
        try {
          const response = await axios.get(
            `${RAZORPAYX_API}/payouts/${match[1]}`,
            { headers: getAuthHeader() }
          );

          if (response.data.status === 'processed') {
            payout.status = 'completed';
            await payout.save();
          }

          if (['rejected', 'failed', 'reversed', 'cancelled'].includes(response.data.status)) {
            payout.status = 'failed';
            await payout.save();
          }
        } catch (err) {
          console.error(`Failed to sync payout ${match[1]}:`, err.message);
        }
      }
    }
  }

  res.status(200).json({
    success: true,
    count: payouts.length,
    payouts,
  });
});

/**
 * Razorpay payout webhook
 * @route POST /api/payouts/webhook
 * @access Public (signature verified)
 */
export const payoutWebhook = asyncHandler(async (req, res) => {
  const webhookSignature = req.headers['x-razorpay-signature'];
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSignature || !webhookSecret) {
    return res.status(400).json({ success: false, message: 'Missing signature' });
  }

  const crypto = (await import('crypto')).default;
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (expectedSignature !== webhookSignature) {
    return res.status(400).json({ success: false, message: 'Invalid signature' });
  }

  const event = req.body;

  try {
    const payoutId = event.payload?.payout?.entity?.id;

    if (event.event === 'payout.processed' && payoutId) {
      await Transaction.findOneAndUpdate(
        { description: { $regex: payoutId } },
        { status: 'completed' }
      );
    }

    if (['payout.failed', 'payout.rejected', 'payout.reversed'].includes(event.event) && payoutId) {
      await Transaction.findOneAndUpdate(
        { description: { $regex: payoutId } },
        { status: 'failed' }
      );
    }

    res.status(200).json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
});