// server/src/controllers/auth.controller.js
import jwt from 'jsonwebtoken';
import { User } from '../models/user.models.js';
import { generateToken, generateRefreshToken } from '../utils/generateToken.js';
import { AppError, asyncHandler } from '../middleware/error.middleware.js';
import { sendEmail } from '../utils/sendEmail.js';
import { passwordResetSuccessTemplate } from '../utils/emailTemplates.js';
import { hashPassword, comparePassword } from '../utils/password.utils.js';
import { createOTP, verifyOTP, checkOTPRateLimit } from '../utils/otp.utils.js';

// ============ REGISTRATION ============

// @desc    Register user - Step 1: Create pending user + Send OTP
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, username } = req.body;

  // Validate input
  if (!name || !email || !password || !role) {
    throw new AppError('Please provide all required fields', 400);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError('Please provide a valid email', 400);
  }

  // Validate password strength
  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }

  // Validate role
  if (!['client', 'freelancer'].includes(role)) {
    throw new AppError('Invalid role specified', 400);
  }

  // Check if user exists
  const userExists = await User.findOne({ 
    $or: [{ email }, { username }]
  });
  
  if (userExists) {
    throw new AppError('User already exists', 400);
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create pending user
  const user = await User.create({
    name,
    email,
    username: username || email.split('@')[0],
    password: hashedPassword,
    role,
    isEmailVerified: false
  });

  // Check rate limit
  await checkOTPRateLimit(email, 'registration');

  // Send OTP
  await createOTP(email, 'registration');

  res.status(201).json({
    success: true,
    message: 'Registration initiated. OTP sent to your email',
    requiresOTP: true
  });
});


// ============ LOGIN ============

// @desc    Login - Step 1: Verify password + Send OTP
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate
  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  // Find user
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Check email verified
  if (!user.isEmailVerified) {
    throw new AppError('Please verify your email before login', 403);
  }

  // Check password
  const isPasswordMatch = await comparePassword(password, user.password);
  if (!isPasswordMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  // Check if blocked
  if (user.isBlocked) {
    throw new AppError('Your account has been blocked', 403);
  }

  // Check rate limit
  await checkOTPRateLimit(email, 'login');

  // Generate and send OTP
  await createOTP(email, 'login');

  // Response - No token yet
  res.status(200).json({
    success: true,
    message: 'Password verified. OTP sent to your email',
    requiresOTP: true
  });
});

// ============ USER INFO ============

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    user
  });
});

// ============ LOGOUT ============

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res, next) => {
  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// ============ REFRESH TOKEN ============

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
// @access  Public
export const refreshToken = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new AppError('No refresh token provided', 401);
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      token: newToken
    });
  } catch (error) {
    throw new AppError('Invalid or expired refresh token', 401);
  }
});

// ============ PASSWORD RESET ============

// @desc    Send OTP for password reset
// @route   POST /api/auth/send-reset-otp
// @access  Public
export const sendResetOTP = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Please provide email', 400);
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!user.isEmailVerified) {
    throw new AppError('Please verify your email first', 403);
  }

  await checkOTPRateLimit(email, 'password_reset');
  await createOTP(email, 'password_reset');

  res.status(200).json({
    success: true,
    message: 'Password reset OTP sent to your email'
  });
});

// @desc    Verify OTP and reset password
// @route   POST /api/auth/verify-reset-otp
// @access  Public
export const verifyResetOTP = asyncHandler(async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    throw new AppError('Please provide email, OTP, and new password', 400);
  }

  if (newPassword.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }

  await verifyOTP(email, otp, 'password_reset');

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const hashedPassword = await hashPassword(newPassword);
  user.password = hashedPassword;
  await user.save();

  // Send password reset success email
  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Successful',
      html: passwordResetSuccessTemplate(user)
    });
  } catch (emailError) {
    console.error('Password reset email failed:', emailError.message);
  }

  res.status(200).json({
    success: true,
    message: 'Password reset successful. Please login with your new password'
  });
});