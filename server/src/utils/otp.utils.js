// server/src/utils/otp.utils.js
import redis from '../config/redis.config.js';
import bcrypt from 'bcryptjs';
import { sendEmail } from './sendEmail.js';
import { otpEmailTemplate } from './emailTemplates.js';
import { AppError } from '../middleware/error.middleware.js';

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hash OTP before storing
export const hashOTP = async (otp) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(otp, salt);
};

// Verify OTP against hash
export const verifyOTPHash = async (otp, hashedOTP) => {
  return await bcrypt.compare(otp, hashedOTP);
};

// Create and store OTP in Redis (hashed)
export const createOTP = async (email, purpose) => {
  const otp = generateOTP();
  const key = `otp:${purpose}:${email}`;
  
  // Hash OTP before storing
  const hashedOTP = await hashOTP(otp);
  
  // Store hashed OTP with 5 minutes expiry
  await redis.set(key, hashedOTP, 'EX', 300);
  
  // Initialize attempts counter
  await redis.set(`${key}:attempts`, 0, 'EX', 300);
  
  // Send email using template (plain OTP to user)
  await sendEmail({
    email,
    subject: getOTPSubject(purpose),
    html: otpEmailTemplate(otp, purpose)
  });
  
  return otp;
};

// Get subject based on purpose
const getOTPSubject = (purpose) => {
  const subjects = {
    registration: 'Your Registration OTP',
    login: 'Your Login OTP',
    password_reset: 'Your Password Reset OTP',
    email_change_old: 'Email Change Verification - Old Email',
    email_change_new: 'Email Change Verification - New Email',
    phone_verification: 'Phone Verification OTP'
  };
  return subjects[purpose] || 'Your OTP Code';
};

// Verify OTP from Redis (with hashed comparison)
export const verifyOTP = async (email, otp, purpose) => {
  const key = `otp:${purpose}:${email}`;
  
  // Get stored hashed OTP
  const storedHashedOTP = await redis.get(key);
  
  if (!storedHashedOTP) {
    throw new AppError('OTP has expired. Please request new OTP', 400);
  }
  
  // Check attempts
  const attempts = parseInt(await redis.get(`${key}:attempts`) || '0');
  
  if (attempts >= 5) {
    await redis.del(key);
    await redis.del(`${key}:attempts`);
    throw new AppError('Too many attempts. Please request new OTP', 400);
  }
  
  // Verify OTP against hash
  const isOTPValid = await verifyOTPHash(otp, storedHashedOTP);
  
  if (!isOTPValid) {
    await redis.incr(`${key}:attempts`);
    throw new AppError('Invalid OTP', 400);
  }
  
  // Delete OTP after success
  await redis.del(key);
  await redis.del(`${key}:attempts`);
  
  return true;
};

// Rate limit OTP requests
export const checkOTPRateLimit = async (email, purpose) => {
  const key = `otp:ratelimit:${purpose}:${email}`;
  
  // Get current count
  const count = await redis.get(key);
  
  // Check if rate limited
  if (count && parseInt(count) >= 3) {
    const ttl = await redis.ttl(key);
    throw new AppError(`Too many OTP requests. Try again in ${Math.ceil(ttl / 60)} minutes`, 429);
  }
  
  // Increment or set with TTL
  if (!count) {
    // First request
    await redis.set(key, 1, 'EX', 900); // 15 minutes
  } else {
    // Subsequent requests
    await redis.incr(key);
    // Ensure TTL is set (in case it was lost)
    const ttl = await redis.ttl(key);
    if (ttl === -1) {
      await redis.expire(key, 900); // Reset to 15 minutes
    }
  }
  
  return true;
};