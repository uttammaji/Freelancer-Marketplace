// server/src/controllers/otp.controller.js
import { asyncHandler, AppError } from "../../middleware/error.middleware.js";
import { createOTP, verifyOTP, checkOTPRateLimit } from "../../utils/otp.utils.js";
import { User } from "../../models/user.models.js";
import { generateToken, generateRefreshToken } from "../../utils/generateToken.js";
import { sendEmail } from "../../utils/sendEmail.js";
import { welcomeEmailTemplate, phoneVerifiedTemplate, emailChangeTemplate } from "../../utils/emailTemplates.js";
import { createPhoneOTP, verifyPhoneOTP as verifyPhoneOTPFromUtils } from "../../utils/phone.utils.js";

// ============ REGISTRATION OTP ============

// @desc    Verify registration OTP - Activate account
// @route   POST /api/auth/verify-registration
// @access  Public
export const verifyRegistration = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new AppError("Please provide email and OTP", 400);
  }

  await verifyOTP(email, otp, "registration");

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.isEmailVerified) {
    throw new AppError("Email already verified. Please login", 400);
  }

  user.isEmailVerified = true;
  await user.save();

  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  // Send welcome email
  try {
    await sendEmail({
      email: user.email,
      subject: "Welcome to Freelancer Marketplace",
      html: welcomeEmailTemplate({
        name: user.name,
        role: user.role,
      }),
    });
  } catch (emailError) {
    console.error("Welcome email failed:", emailError.message);
  }

  res.status(200).json({
    success: true,
    message: "Email verified successfully",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      username: user.username,
      isEmailVerified: user.isEmailVerified,
    },
  });
});

// @desc    Resend registration OTP
// @route   POST /api/auth/resend-registration-otp
// @access  Public
export const resendRegistrationOTP = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError("Please provide email", 400);
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("User not found. Please register first", 404);
  }

  if (user.isEmailVerified) {
    throw new AppError("Email already verified. Please login", 400);
  }

  await checkOTPRateLimit(email, "registration");
  await createOTP(email, "registration");

  res.status(200).json({
    success: true,
    message: "OTP resent to your email",
  });
});

// ============ LOGIN OTP ============

// @desc    Verify login OTP - Generate tokens
// @route   POST /api/auth/verify-login-otp
// @access  Public
export const verifyLoginOTP = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new AppError("Please provide email and OTP", 400);
  }

  // Verify OTP
  await verifyOTP(email, otp, "login");

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("User not found", 404);
  }
  // Check if email is verified
  if (!user.isEmailVerified) {
    throw new AppError("Please verify your email first", 403);
  }
  // Check if blocked
  if (user.isBlocked) {
    throw new AppError('Your account has been blocked', 403);
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate tokens
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      username: user.username,
      isEmailVerified: user.isEmailVerified,
    },
  });
});

// @desc    Resend login OTP
// @route   POST /api/auth/resend-login-otp
// @access  Public
export const resendLoginOTP = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError("Please provide email", 400);
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.isEmailVerified) {
    throw new AppError("Please verify your email first", 403);
  }

  await checkOTPRateLimit(email, "login");
  await createOTP(email, "login");

  res.status(200).json({
    success: true,
    message: "Login OTP resent to your email",
  });
});

// ============ PASSWORD RESET OTP ============

// @desc    Resend password reset OTP
// @route   POST /api/auth/resend-reset-otp
// @access  Public
export const resendResetOTP = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError("Please provide email", 400);
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.isEmailVerified) {
    throw new AppError("Please verify your email first", 403);
  }

  await checkOTPRateLimit(email, "password_reset");
  await createOTP(email, "password_reset");

  res.status(200).json({
    success: true,
    message: "Password reset OTP resent to your email",
  });
});



// ============ PHONE VERIFICATION ============

// @desc    Send OTP for phone verification
// @route   POST /api/auth/send-phone-otp
// @access  Private
export const sendPhoneOTP = asyncHandler(async (req, res, next) => {
  const { phone } = req.body;

  if (!phone) {
    throw new AppError("Please provide phone number", 400);
  }

  // Validate phone format (Indian format)
  const phoneRegex = /^\+?91[\s-]?[6-9]\d{9}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    throw new AppError("Please provide a valid Indian phone number", 400);
  }

  // Check if phone already verified by another user
  const existingUser = await User.findOne({ 
    phone: phone.replace(/\s/g, ''),
    isPhoneVerified: true,
    _id: { $ne: req.user.id }
  });
  
  if (existingUser) {
    throw new AppError("This phone number is already verified by another account", 400);
  }

  // Check rate limit
  await checkOTPRateLimit(phone, 'phone_verification');

  // Generate and send OTP via SMS
  await createPhoneOTP(phone, 'phone_verification');

  res.status(200).json({
    success: true,
    message: "OTP sent to your phone",
  });
});

// @desc    Verify phone OTP
// @route   POST /api/auth/verify-phone-otp
// @access  Private
export const verifyPhoneOTP = asyncHandler(async (req, res, next) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    throw new AppError("Please provide phone and OTP", 400);
  }

  // Verify OTP
  await verifyPhoneOTPFromUtils(phone, otp, 'phone_verification');

  // Update user
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { 
      phone: phone.replace(/\s/g, ''),
      isPhoneVerified: true 
    },
    { new: true }
  ).select('-password');

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Send confirmation email
  try {
    await sendEmail({
      email: user.email,
      subject: "Phone Number Verified",
      html: phoneVerifiedTemplate(user, user.phone),
    });
  } catch (emailError) {
    console.error("Phone verification email failed:", emailError.message);
  }

  res.status(200).json({
    success: true,
    message: "Phone verified successfully",
    user: {
      id: user._id,
      phone: user.phone,
      isPhoneVerified: user.isPhoneVerified,
    },
  });
});

// ============ EMAIL CHANGE ============

// @desc    Request email change - Step 1: Send OTP to both emails
// @route   POST /api/auth/change-email
// @access  Private
export const changeEmail = asyncHandler(async (req, res, next) => {
  const { newEmail } = req.body;

  if (!newEmail) {
    throw new AppError("Please provide new email", 400);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newEmail)) {
    throw new AppError("Please provide a valid email", 400);
  }

  // Check if new email is same as current
  if (newEmail.toLowerCase() === req.user.email.toLowerCase()) {
    throw new AppError("New email must be different from current email", 400);
  }

  // Check if new email already exists
  const emailExists = await User.findOne({ email: newEmail.toLowerCase() });
  if (emailExists) {
    throw new AppError("This email is already registered", 400);
  }

  const oldEmail = req.user.email;

  // Send OTP to old email
  await checkOTPRateLimit(oldEmail, 'email_change_old');
  await createOTP(oldEmail, 'email_change_old');

  // Send OTP to new email
  await checkOTPRateLimit(newEmail, 'email_change_new');
  await createOTP(newEmail, 'email_change_new');

  // Store pending email
  await User.findByIdAndUpdate(req.user.id, {
    pendingEmail: newEmail.toLowerCase(),
    pendingEmailExpires: new Date(Date.now() + 15 * 60 * 1000), // 15 min
  });

  res.status(200).json({
    success: true,
    message: "OTP sent to both old and new email addresses",
  });
});

// @desc    Verify email change - Step 2: Verify both OTPs
// @route   POST /api/auth/verify-email-change
// @access  Private
export const verifyEmailChange = asyncHandler(async (req, res, next) => {
  const { newEmail, oldEmailOTP, newEmailOTP } = req.body;

  if (!newEmail || !oldEmailOTP || !newEmailOTP) {
    throw new AppError("Please provide new email and both OTPs", 400);
  }

  const oldEmail = req.user.email;

  // Verify old email OTP
  await verifyOTP(oldEmail, oldEmailOTP, 'email_change_old');

  // Verify new email OTP
  await verifyOTP(newEmail, newEmailOTP, 'email_change_new');

  // Check pending email matches
  const user = await User.findById(req.user.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.pendingEmail || user.pendingEmail !== newEmail.toLowerCase()) {
    throw new AppError("Email change request expired or invalid", 400);
  }

  if (user.pendingEmailExpires < new Date()) {
    throw new AppError("Email change request expired. Please try again", 400);
  }

  // Update email
  user.email = newEmail.toLowerCase();
  user.pendingEmail = null;
  user.pendingEmailExpires = null;
  await user.save();

  // Send notification to both emails
  try {
    // Notify old email
    await sendEmail({
      email: oldEmail,
      subject: "Email Changed Successfully",
      html: emailChangeTemplate(user, newEmail),
    });

    // Notify new email
    await sendEmail({
      email: newEmail,
      subject: "Email Changed Successfully",
      html: emailChangeTemplate(user, newEmail),
    });
  } catch (emailError) {
    console.error("Email change notification failed:", emailError.message);
  }

  res.status(200).json({
    success: true,
    message: "Email changed successfully",
    user: {
      id: user._id,
      email: user.email,
    },
  });
});