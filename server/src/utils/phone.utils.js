// server/src/utils/phone.utils.js
import redis from '../config/redis.config.js';
import bcrypt from 'bcryptjs';
import { AppError } from '../middleware/error.middleware.js';

// TextBee API configuration
const TEXTBEE_BASE_URL = 'https://api.textbee.dev/api/v1';
const TEXTBEE_API_KEY = process.env.TEXTBEE_API_KEY;

/**
 * Generate 6-digit OTP
 */
export const generatePhoneOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hash OTP before storing
 */
export const hashPhoneOTP = async (otp) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(otp, salt);
};

/**
 * Verify OTP against hash
 */
export const verifyPhoneOTPHash = async (otp, hashedOTP) => {
  return await bcrypt.compare(otp, hashedOTP);
};

/**
 * Send SMS via TextBee API
 * @param {string} phone - Phone number (with country code)
 * @param {string} message - SMS message
 * @returns {Promise<Object>} Response from TextBee
 */
export const sendSMS = async (phone, message) => {
  try {
    // Format phone number (ensure +91 prefix)
    const formattedPhone = formatPhoneNumber(phone);

    const response = await fetch(`${TEXTBEE_BASE_URL}/gateway/send-sms`, {
      method: 'POST',
      headers: {
        'x-api-key': TEXTBEE_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipients: [formattedPhone],
        message: message,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send SMS');
    }

    return data;
  } catch (error) {
    console.error('TextBee SMS error:', error.message);
    throw new AppError('Failed to send SMS. Please try again', 500);
  }
};

/**
 * Create and store phone OTP in Redis (hashed)
 * @param {string} phone - Phone number
 * @param {string} purpose - OTP purpose
 * @returns {Promise<string>} OTP
 */
export const createPhoneOTP = async (phone, purpose) => {
  const otp = generatePhoneOTP();
  const key = `otp:${purpose}:${phone}`;

  // Hash OTP before storing
  const hashedOTP = await hashPhoneOTP(otp);

  // Store hashed OTP with 5 minutes expiry
  await redis.set(key, hashedOTP, 'EX', 300);

  // Initialize attempts counter
  await redis.set(`${key}:attempts`, 0, 'EX', 300);

  // Send SMS with plain OTP
  const message = `Your Freelancer Marketplace verification code is: ${otp}. Valid for 5 minutes. Do not share this code with anyone.`;

  await sendSMS(phone, message);

  return otp;
};

/**
 * Verify phone OTP from Redis (with hashed comparison)
 * @param {string} phone - Phone number
 * @param {string} otp - OTP to verify
 * @param {string} purpose - OTP purpose
 * @returns {Promise<boolean>} True if valid
 */
export const verifyPhoneOTP = async (phone, otp, purpose) => {
  const key = `otp:${purpose}:${phone}`;

  // Get stored hashed OTP
  const storedHashedOTP = await redis.get(key);

  if (!storedHashedOTP) {
    throw new AppError('OTP has expired. Please request new OTP', 400);
  }

  const attempts = parseInt(await redis.get(`${key}:attempts`) || '0');

  if (attempts >= 5) {
    await redis.del(key);
    await redis.del(`${key}:attempts`);
    throw new AppError('Too many attempts. Please request new OTP', 400);
  }

  // Verify OTP against hash
  const isOTPValid = await verifyPhoneOTPHash(otp, storedHashedOTP);

  if (!isOTPValid) {
    await redis.incr(`${key}:attempts`);
    throw new AppError('Invalid OTP', 400);
  }

  await redis.del(key);
  await redis.del(`${key}:attempts`);

  return true;
};

/**
 * Format phone number to international format
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // If starts with 91, add +
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return `+${cleaned}`;
  }

  // If 10 digits, assume Indian number
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }

  // Return as is if already has + prefix
  return phone.startsWith('+') ? phone : `+${cleaned}`;
};

/**
 * Check phone OTP rate limit
 * @param {string} phone - Phone number
 * @param {string} purpose - OTP purpose
 * @returns {Promise<boolean>} True if allowed
 */
export const checkPhoneOTPRateLimit = async (phone, purpose) => {
  const key = `otp:ratelimit:${purpose}:${phone}`;

  const count = await redis.get(key);

  if (count && parseInt(count) >= 3) {
    const ttl = await redis.ttl(key);
    throw new AppError(`Too many OTP requests. Try again in ${Math.ceil(ttl / 60)} minutes`, 429);
  }

  if (!count) {
    await redis.set(key, 1, 'EX', 900); // 15 minutes
  } else {
    await redis.incr(key);
    const ttl = await redis.ttl(key);
    if (ttl === -1) {
      await redis.expire(key, 900);
    }
  }

  return true;
};