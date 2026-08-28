// server/src/controllers/otp.controller.js
import { asyncHandler, AppError } from "../middleware/error.middleware.js";
import { createOTP, verifyOTP, checkOTPRateLimit } from "../utils/otp.utils.js";
import { User } from "../models/user.models.js";
import { generateToken, generateRefreshToken } from "../utils/generateToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import { welcomeEmailTemplate } from "../utils/emailTemplates.js";

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
