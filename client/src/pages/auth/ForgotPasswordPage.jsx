// client/src/pages/auth/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Briefcase, Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';

export function ForgotPasswordPage() {
  const { forgotPassword, resetPassword, resendResetOTP } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Step 1: Email
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Step 2: OTP
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Step 3: New Password
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Timer for resend OTP
  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.warning('Email Required', 'Please enter your email address.');
      return;
    }

    setIsLoading(true);
    const result = await forgotPassword(email);
    setIsLoading(false);

    if (result.success) {
      toast.success('OTP Sent', 'Check your email for reset code.');
      setShowOTP(true);
      setResendTimer(60);
    } else {
      toast.error('Request Failed', result.error);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.warning('Invalid OTP', 'Please enter the 6-digit OTP.');
      return;
    }

    // Just verify OTP format, don't reset yet
    // Actual verification happens in Step 3 with new password
    setShowNewPassword(true);
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.warning('Password Required', 'Please enter your new password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Password Mismatch', 'Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      toast.warning('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    setIsResetting(true);
    const result = await resetPassword(email, otp, newPassword);
    setIsResetting(false);

    if (result.success) {
      toast.success('Password Reset', 'Your password has been updated. Please login.');
      navigate('/login');
    } else {
      toast.error('Reset Failed', result.error);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    try {
      const result = await resendResetOTP(email);
      if (result.success) {
        toast.success('OTP Resent', 'Check your email for new OTP.');
        setResendTimer(60);
      }
    } catch (error) {
      toast.error('Resend Failed', error.response?.data?.message || 'Try again later.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 p-8 rounded-3xl shadow-soft-lg">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold shadow-soft">
              <Briefcase className="w-5 h-5 stroke-[2.2]" />
            </div>
          </Link>

          {!showOTP && !showNewPassword ? (
            <>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Forgot Password
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter your email to receive a reset OTP
              </p>
            </>
          ) : showOTP && !showNewPassword ? (
            <>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Enter OTP
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter the 6-digit code sent to {email}
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Set New Password
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Create your new password
              </p>
            </>
          )}
        </div>

        {/* Step 1: Email Form */}
        {!showOTP && !showNewPassword && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              required
            />

            <Button type="submit" variant="primary" size="lg" className="w-full font-bold" isLoading={isLoading}>
              Send OTP
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        )}

        {/* Step 2: OTP Form */}
        {showOTP && !showNewPassword && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="flex justify-center">
              <ShieldCheck className="w-16 h-16 text-primary-600 dark:text-primary-400" />
            </div>

            <Input
              label="Enter OTP"
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              maxLength={6}
              required
            />

            <Button type="submit" variant="primary" size="lg" className="w-full font-bold" isLoading={isVerifying}>
              Verify OTP
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendTimer > 0}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-primary-600 disabled:opacity-50"
              >
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowOTP(false)}
              className="w-full text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700"
            >
              ← Back
            </button>
          </form>
        )}

        {/* Step 3: New Password Form */}
        {showNewPassword && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              icon={Lock}
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={Lock}
              required
            />

            <Button type="submit" variant="primary" size="lg" className="w-full font-bold" isLoading={isResetting}>
              Reset Password
            </Button>

            <button
              type="button"
              onClick={() => {
                setShowNewPassword(false);
                setShowOTP(false);
              }}
              className="w-full text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700"
            >
              ← Back
            </button>
          </form>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Remember your password?{' '}
          <Link to="/login" className="text-primary-600 dark:text-primary-400 font-bold hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}