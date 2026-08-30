// server/src/controllers/auth.controller.js
import jwt from 'jsonwebtoken';
import { User } from '../../models/user.models.js';
import { generateToken, generateRefreshToken } from '../../utils/generateToken.js';
import { AppError, asyncHandler } from '../../middleware/error.middleware.js';
import { sendEmail } from '../../utils/sendEmail.js';
import { 
  passwordResetSuccessTemplate, 
  passwordChangeTemplate, 
  emailChangeTemplate,
  phoneVerifiedTemplate
} from '../../utils/emailTemplates.js';
import { hashPassword, comparePassword } from '../../utils/password.utils.js';
import { createOTP, verifyOTP, checkOTPRateLimit } from '../../utils/otp.utils.js';
import { createPhoneOTP } from '../../utils/phone.utils.js'; 
import redis from '../../config/redis.config.js';

// ============ REGISTRATION ============

// @desc    Register user - Step 1: Create pending user + Send OTP
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, username } = req.body;

  if (!name || !email || !password || !role) {
    throw new AppError('Please provide all required fields', 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError('Please provide a valid email', 400);
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }

  if (!['client', 'freelancer'].includes(role)) {
    throw new AppError('Invalid role specified', 400);
  }

  const userExists = await User.findOne({ 
    $or: [{ email }, { username }]
  });
  
  if (userExists) {
    throw new AppError('User already exists', 400);
  }

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    name,
    email,
    username: username || email.split('@')[0],
    password: hashedPassword,
    role,
    isEmailVerified: false
  });

  await checkOTPRateLimit(email, 'registration');
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

  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  // Find user
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Check if account is locked
  if (user.lockUntil && user.lockUntil > new Date()) {
    const remainingMinutes = Math.ceil((user.lockUntil - new Date()) / 60000);
    throw new AppError(`Account locked. Try again in ${remainingMinutes} minutes`, 423);
  }

  // Check email verified
  if (!user.isEmailVerified) {
    throw new AppError('Please verify your email before login', 403);
  }

  // Check password
  const isPasswordMatch = await comparePassword(password, user.password);
  if (!isPasswordMatch) {
    // Increment login attempts
    user.loginAttempts += 1;
    
    // Lock account after 5 failed attempts
    if (user.loginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min lock
      user.loginAttempts = 0;
      await user.save();
      throw new AppError('Account locked for 15 minutes due to too many failed attempts', 423);
    }
    
    await user.save();
    throw new AppError(`Invalid credentials. ${5 - user.loginAttempts} attempts remaining`, 401);
  }

  // Check if blocked
  if (user.isBlocked) {
    throw new AppError('Your account has been blocked', 403);
  }

  // Reset login attempts on success
  if (user.loginAttempts > 0) {
    user.loginAttempts = 0;
    await user.save();
  }

  // Check rate limit
  await checkOTPRateLimit(email, 'login');

  // Send OTP
  await createOTP(email, 'login');

  res.status(200).json({
    success: true,
    message: 'Password verified. OTP sent to your email',
    requiresOTP: true
  });
});

// ============ CHANGE PASSWORD ============

// @desc    Change password (logged-in user)
// @route   POST /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError('Please provide current and new password', 400);
  }

  if (newPassword.length < 6) {
    throw new AppError('New password must be at least 6 characters', 400);
  }

  if (currentPassword === newPassword) {
    throw new AppError('New password must be different from current password', 400);
  }

  // Get user with password
  const user = await User.findById(req.user.id).select('+password');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Verify current password
  const isMatch = await comparePassword(currentPassword, user.password);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 401);
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password and increment token version
  user.password = hashedPassword;
  user.lastPasswordChange = new Date();
  user.tokenVersion += 1;
  await user.save();

  // Send notification email
  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Changed Successfully',
      html: passwordChangeTemplate(user)
    });
  } catch (emailError) {
    console.error('Password change email failed:', emailError.message);
  }

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
});

// ============ USER INFO ============

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('-password');
  
  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    user
  });
});

// ============ LOGOUT (With Token Blacklist) ============

// @desc    Logout - Blacklist current token
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res, next) => {
  // Get token from header or cookie
  let token;
  if (req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Blacklist token
  if (token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const ttl = decoded.exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) {
      await redis.set(`blacklist:${token}`, '1', 'EX', ttl);
    }
  }

  // Clear refresh token cookie
  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// ============ REFRESH TOKEN (With Rotation) ============

// @desc    Refresh token with rotation
// @route   POST /api/auth/refresh-token
// @access  Public
export const refreshToken = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new AppError('No refresh token provided', 401);
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Check if refresh token is blacklisted
    const isBlacklisted = await redis.get(`blacklist:refresh:${refreshToken}`);
    if (isBlacklisted) {
      throw new AppError('Refresh token revoked', 401);
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Generate new tokens
    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Blacklist old refresh token (rotation)
    const oldTokenTTL = decoded.exp - Math.floor(Date.now() / 1000);
    if (oldTokenTTL > 0) {
      await redis.set(`blacklist:refresh:${refreshToken}`, '1', 'EX', oldTokenTTL);
    }

    // Set new refresh token
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
  user.lastPasswordChange = new Date();
  user.tokenVersion += 1;
  await user.save();

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

// ============ AVATAR UPDATE ============

// @desc    Update user avatar
// @route   PATCH /api/auth/avatar
// @access  Private
export const updateAvatar = asyncHandler(async (req, res, next) => {
  const { avatar, avatarPublicId } = req.body;

  if (avatar === undefined || avatar === null) {
    throw new AppError('Please provide avatar URL', 400);
  }

  const existingUser = await User.findById(req.user.id);
  
  if (!existingUser) {
    throw new AppError('User not found', 404);
  }

  if (existingUser.avatarPublicId && existingUser.avatarPublicId !== avatarPublicId) {
    try {
      const cloudinary = (await import('../../config/cloudinary.config.js')).default;
      await cloudinary.uploader.destroy(existingUser.avatarPublicId);
    } catch (error) {
      console.error('Failed to delete old avatar:', error.message);
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { 
      avatar: avatar || '',
      avatarPublicId: avatarPublicId || null
    },
    { new: true }
  ).select('-password');

  res.status(200).json({
    success: true,
    message: avatar ? 'Avatar updated' : 'Avatar removed',
    user: {
      id: user._id,
      avatar: user.avatar,
      avatarPublicId: user.avatarPublicId
    }
  });
});

// ============ USERNAME CHANGE ============

// @desc    Change username (rate limited)
// @route   PATCH /api/auth/username
// @access  Private
export const changeUsername = asyncHandler(async (req, res, next) => {
  const { username } = req.body;

  if (!username) {
    throw new AppError('Please provide username', 400);
  }

  // Validate username format
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  if (!usernameRegex.test(username)) {
    throw new AppError('Username must be 3-30 characters, alphanumeric or underscore only', 400);
  }

  // Check if same as current
  if (username.toLowerCase() === req.user.username.toLowerCase()) {
    throw new AppError('New username must be different from current', 400);
  }

  // Rate limit check (3 changes per hour)
  const rateLimitKey = `username_change:ratelimit:${req.user.id}`;
  const changeCount = await redis.get(rateLimitKey);

  if (changeCount && parseInt(changeCount) >= 3) {
    const ttl = await redis.ttl(rateLimitKey);
    throw new AppError(`Too many username changes. Try again in ${Math.ceil(ttl / 60)} minutes`, 429);
  }

  // Check if username already taken
  const existingUser = await User.findOne({ 
    username: username.toLowerCase(),
    _id: { $ne: req.user.id }
  });

  if (existingUser) {
    throw new AppError('Username already taken', 400);
  }

  // Update username
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { username: username.toLowerCase() },
    { new: true }
  ).select('-password');

  // Update rate limit counter
  if (!changeCount) {
    await redis.set(rateLimitKey, 1, 'EX', 3600); // 1 hour
  } else {
    await redis.incr(rateLimitKey);
  }

  res.status(200).json({
    success: true,
    message: 'Username updated successfully',
    user: {
      id: user._id,
      username: user.username,
    },
  });
});

// ============ PHONE CHANGE  ============

// @desc    Step 1: Initiate phone change - Send OTP to OLD phone
// @route   POST /api/auth/change-phone
// @access  Private
export const changePhone = asyncHandler(async (req, res, next) => {
  const { newPhone } = req.body;

  if (!newPhone) {
    throw new AppError('Please provide new phone number', 400);
  }

  // Validate phone format
  const phoneRegex = /^\+?91[\s-]?[6-9]\d{9}$/;
  const cleanedPhone = newPhone.replace(/\s/g, '');
  if (!phoneRegex.test(cleanedPhone)) {
    throw new AppError('Please provide a valid Indian phone number', 400);
  }

  // Check if old phone is verified
  if (!req.user.isPhoneVerified || !req.user.phone) {
    throw new AppError('Please verify your current phone number first', 400);
  }

  // Check if new phone is same as current
  if (cleanedPhone === req.user.phone || newPhone === req.user.phone) {
    throw new AppError('New phone must be different from current', 400);
  }

  // Check if new phone already verified by another user
  const existingUser = await User.findOne({ 
    phone: cleanedPhone,
    isPhoneVerified: true,
    _id: { $ne: req.user.id }
  });

  if (existingUser) {
    throw new AppError('This phone number is already verified by another account', 400);
  }

  // Rate limit
  await checkOTPRateLimit(req.user.id, 'phone_change');

  // Send OTP to OLD phone
  const oldPhone = req.user.phone;
  await createPhoneOTP(oldPhone, 'phone_change_old');

  res.status(200).json({
    success: true,
    message: `OTP sent to your old phone number ending in ${oldPhone.slice(-4)}`,
    step: 'verify_old_phone',
  });
});

// @desc    Step 2: Verify OLD phone OTP - Send OTP to NEW phone
// @route   POST /api/auth/verify-old-phone-otp
// @access  Private
export const verifyOldPhoneOTP = asyncHandler(async (req, res, next) => {
  const { newPhone, oldPhoneOTP } = req.body;

  if (!newPhone || !oldPhoneOTP) {
    throw new AppError('Please provide new phone and OTP', 400);
  }

  const cleanedPhone = newPhone.replace(/\s/g, '');
  const oldPhone = req.user.phone;

  // Verify old phone OTP
  await verifyOTP(oldPhone, oldPhoneOTP, 'phone_change_old');

  // Send OTP to NEW phone
  await createPhoneOTP(cleanedPhone, 'phone_change_new');

  res.status(200).json({
    success: true,
    message: `OTP sent to your new phone number ${cleanedPhone}`,
    step: 'verify_new_phone',
  });
});

// @desc    Step 3: Verify NEW phone OTP - Complete phone change
// @route   POST /api/auth/verify-new-phone-otp
// @access  Private
export const verifyNewPhoneOTP = asyncHandler(async (req, res, next) => {
  const { newPhone, newPhoneOTP } = req.body;

  if (!newPhone || !newPhoneOTP) {
    throw new AppError('Please provide new phone and OTP', 400);
  }

  const cleanedPhone = newPhone.replace(/\s/g, '');

  // Verify new phone OTP
  await verifyOTP(cleanedPhone, newPhoneOTP, 'phone_change_new');

  // Update user phone
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { 
      phone: cleanedPhone,
      isPhoneVerified: true 
    },
    { new: true }
  ).select('-password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Send confirmation email
  try {
    await sendEmail({
      email: user.email,
      subject: 'Phone Number Changed',
      html: phoneVerifiedTemplate(user, user.phone),
    });
  } catch (emailError) {
    console.error('Phone change email failed:', emailError.message);
  }

  res.status(200).json({
    success: true,
    message: 'Phone number changed successfully',
    user: {
      id: user._id,
      phone: user.phone,
      isPhoneVerified: user.isPhoneVerified,
    },
  });
});