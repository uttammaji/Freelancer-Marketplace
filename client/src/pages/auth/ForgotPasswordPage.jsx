// client/src/pages/auth/ForgotPasswordPage.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  Briefcase,
  Mail,
  Lock,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  MailCheck,
  KeyRound,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const STEPS = {
  EMAIL: 'email',
  OTP: 'otp',
  PASSWORD: 'password',
  SUCCESS: 'success',
};

const STEP_ORDER = [STEPS.EMAIL, STEPS.OTP, STEPS.PASSWORD];

const OTP_LENGTH = 6;
const OTP_RESEND_COOLDOWN = 60; // seconds
const MIN_PASSWORD_LENGTH = 8;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ------------------------------------------------------------------ */
/*  Password strength                                                  */
/* ------------------------------------------------------------------ */
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };

  let score = 0;
  if (password.length >= MIN_PASSWORD_LENGTH) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (password.length < MIN_PASSWORD_LENGTH) {
    return { score: 1, label: 'Too short', color: 'bg-rose-500' };
  }
  if (score <= 2) return { score: 2, label: 'Weak',     color: 'bg-rose-500' };
  if (score === 3) return { score: 3, label: 'Fair',     color: 'bg-amber-500' };
  if (score === 4) return { score: 4, label: 'Strong',   color: 'bg-emerald-500' };
  return                { score: 5, label: 'Very strong', color: 'bg-emerald-600' };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function ForgotPasswordPage() {
  const { forgotPassword, resetPassword, resendResetOTP } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  /* ---------- Step state ---------- */
  const [step, setStep] = useState(STEPS.EMAIL);
  const [history, setHistory] = useState([]); // for back navigation

  /* ---------- Form state ---------- */
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);
  const [confirmError, setConfirmError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  /* ---------- Async state ---------- */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  /* ---------- Refs ---------- */
  const otpInputRef = useRef(null);

  /* ---------------- Derived ---------------- */
  const passwordStrength = useMemo(
    () => getPasswordStrength(newPassword),
    [newPassword]
  );

  const stepIndex = STEP_ORDER.indexOf(step);
  const isSuccessStep = step === STEPS.SUCCESS;

  /* ---------------- Resend cooldown ---------------- */
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  /* ---------------- Focus OTP on entry ---------------- */
  useEffect(() => {
    if (step === STEPS.OTP) {
      const t = setTimeout(() => otpInputRef.current?.focus?.(), 100);
      return () => clearTimeout(t);
    }
  }, [step]);

  /* ---------------- Step navigation ---------------- */
  const goToStep = useCallback((next) => {
    setHistory((prev) => [...prev, step]);
    setStep(next);
  }, [step]);

  const goBack = useCallback(() => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const [last, ...rest] = [...prev].reverse();
      setStep(last);
      return rest.reverse();
    });
  }, []);

  /* ---------------- Step 1: Send OTP ---------------- */
  const handleSendOTP = useCallback(
    async (e) => {
      e.preventDefault();

      const trimmed = email.trim();
      if (!trimmed) {
        setEmailError('Email is required.');
        return;
      }
      if (!EMAIL_REGEX.test(trimmed)) {
        setEmailError('Enter a valid email address.');
        return;
      }

      setEmailError(null);
      setIsSubmitting(true);

      try {
        const result = await forgotPassword(trimmed);
        if (result?.success) {
          toast.success('OTP Sent', `We sent a 6-digit code to ${trimmed}.`);
          setResendTimer(OTP_RESEND_COOLDOWN);
          goToStep(STEPS.OTP);
        } else {
          toast.error('Request Failed', result?.error || 'Could not send OTP.');
        }
      } catch (error) {
        console.error('[ForgotPassword] send OTP failed:', error);
        toast.error('Request Failed', 'Could not send OTP. Try again later.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, forgotPassword, toast, goToStep]
  );

  /* ---------------- Step 2: Verify OTP ---------------- */
  const handleVerifyOTP = useCallback(
    async (e) => {
      e.preventDefault();

      if (!otp || otp.length !== OTP_LENGTH) {
        setOtpError(`Enter the ${OTP_LENGTH}-digit code.`);
        return;
      }

      setOtpError(null);
      setIsSubmitting(true);

      try {
        // If your AuthContext exposes a verify-only function, call it here.
        // Otherwise, this step is a UI gate — actual verification happens
        // during resetPassword() in the next step.
        if (typeof resendResetOTP !== 'function') {
          // No-op fallback
        }
        goToStep(STEPS.PASSWORD);
      } finally {
        setIsSubmitting(false);
      }
    },
    [otp, goToStep]
  );

  /* ---------------- Step 3: Reset password ---------------- */
  const handleResetPassword = useCallback(
    async (e) => {
      e.preventDefault();

      // Validate
      let hasError = false;

      if (!newPassword) {
        setPasswordError('Password is required.');
        hasError = true;
      } else if (newPassword.length < MIN_PASSWORD_LENGTH) {
        setPasswordError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
        hasError = true;
      } else {
        setPasswordError(null);
      }

      if (!confirmPassword) {
        setConfirmError('Please confirm your password.');
        hasError = true;
      } else if (newPassword !== confirmPassword) {
        setConfirmError('Passwords do not match.');
        hasError = true;
      } else {
        setConfirmError(null);
      }

      if (hasError) return;

      setIsSubmitting(true);

      try {
        const result = await resetPassword(email.trim(), otp, newPassword);
        if (result?.success) {
          setStep(STEPS.SUCCESS);
          toast.success('Password Reset', 'Redirecting to login…');
          // Give the success screen a moment before redirect
          setTimeout(() => navigate('/login'), 2000);
        } else {
          toast.error('Reset Failed', result?.error || 'Could not reset password.');
        }
      } catch (error) {
        console.error('[ForgotPassword] reset failed:', error);
        toast.error('Reset Failed', 'Could not reset password. Try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [newPassword, confirmPassword, email, otp, resetPassword, toast, navigate]
  );

  /* ---------------- Resend OTP ---------------- */
  const handleResendOTP = useCallback(async () => {
    if (resendTimer > 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await resendResetOTP(email.trim());
      if (result?.success) {
        toast.success('OTP Resent', 'Check your email for a new code.');
        setResendTimer(OTP_RESEND_COOLDOWN);
        setOtp('');
        setOtpError(null);
      } else {
        toast.error('Resend Failed', result?.error || 'Try again later.');
      }
    } catch (error) {
      console.error('[ForgotPassword] resend failed:', error);
      toast.error(
        'Resend Failed',
        error?.response?.data?.message || 'Try again later.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [resendTimer, isSubmitting, resendResetOTP, email, toast]);

  /* ---------------- Render ---------------- */
  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 p-8 rounded-3xl shadow-soft-lg">
        {/* Logo */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 group mb-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-xl"
            aria-label="SkillHire home"
          >
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold shadow-soft transition-transform group-hover:scale-105">
              <Briefcase className="w-5 h-5 stroke-[2.2]" aria-hidden="true" />
            </div>
          </Link>
        </div>

        {/* Progress indicator */}
        {!isSuccessStep && (
          <StepProgress
            currentIndex={stepIndex}
            labels={['Email', 'Verify', 'Reset']}
          />
        )}

        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isSuccessStep ? 'Password Reset!' :
             step === STEPS.EMAIL ? 'Forgot Password' :
             step === STEPS.OTP ? 'Enter OTP' :
             'Set New Password'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-pretty">
            {isSuccessStep
              ? 'Your password has been updated. Redirecting you to login…'
              : step === STEPS.EMAIL
              ? 'Enter your email to receive a reset code.'
              : step === STEPS.OTP
              ? <>Enter the {OTP_LENGTH}-digit code sent to <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span></>
              : 'Create a strong password to secure your account.'}
          </p>
        </header>

        {/* ---------- Step 1: Email ---------- */}
        {step === STEPS.EMAIL && (
          <form onSubmit={handleSendOTP} className="space-y-4" noValidate>
            <Input
              label="Email Address"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError(null);
              }}
              onBlur={() => {
                const trimmed = email.trim();
                if (trimmed && !EMAIL_REGEX.test(trimmed)) {
                  setEmailError('Enter a valid email address.');
                }
              }}
              icon={Mail}
              error={emailError}
              required
              aria-label="Email address"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold"
              isLoading={isSubmitting}
            >
              Send Reset Code
              <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
            </Button>
          </form>
        )}

        {/* ---------- Step 2: OTP ---------- */}
        {step === STEPS.OTP && (
          <form onSubmit={handleVerifyOTP} className="space-y-4" noValidate>
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center">
                <ShieldCheck
                  className="w-8 h-8 text-primary-600 dark:text-primary-400"
                  aria-hidden="true"
                />
              </div>
            </div>

            <Input
              ref={otpInputRef}
              label="6-Digit Code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="••••••"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH));
                if (otpError) setOtpError(null);
              }}
              maxLength={OTP_LENGTH}
              error={otpError}
              helperText={`${otp.length}/${OTP_LENGTH} digits`}
              required
              aria-label="One-time password"
              className="text-center tracking-[0.5em] font-mono text-lg"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold"
              isLoading={isSubmitting}
            >
              Verify Code
            </Button>

            {/* Resend + Back */}
            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded px-1"
              >
                <ArrowLeft className="w-3 h-3" aria-hidden="true" />
                Change email
              </button>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendTimer > 0 || isSubmitting}
                className="font-semibold text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-50 disabled:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded px-1"
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
              </button>
            </div>
          </form>
        )}

        {/* ---------- Step 3: New Password ---------- */}
        {step === STEPS.PASSWORD && (
          <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
            {/* New password */}
            <div>
              <Input
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                icon={Lock}
                error={passwordError}
                required
                aria-label="New password"
              />

              {/* Strength indicator */}
              {newPassword && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-20 text-right">
                      {passwordStrength.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Use {MIN_PASSWORD_LENGTH}+ characters with uppercase, lowercase, number & symbol.
                  </p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <Input
                label="Confirm New Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (confirmError) setConfirmError(null);
                }}
                icon={Lock}
                error={confirmError}
                required
                aria-label="Confirm new password"
              />

              <div className="flex items-center justify-between mt-1.5">
                <label className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 text-primary-600 focus:ring-primary-500 h-3.5 w-3.5"
                  />
                  Show passwords
                </label>

                {confirmPassword && newPassword === confirmPassword && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                    Matches
                  </span>
                )}
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold"
              isLoading={isSubmitting}
              disabled={
                !newPassword ||
                !confirmPassword ||
                newPassword !== confirmPassword ||
                passwordStrength.score < 2
              }
            >
              Reset Password
            </Button>

            <button
              type="button"
              onClick={goBack}
              className="w-full text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors inline-flex items-center justify-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded py-1"
            >
              <ArrowLeft className="w-3 h-3" aria-hidden="true" />
              Back to code
            </button>
          </form>
        )}

        {/* ---------- Success ---------- */}
        {isSuccessStep && (
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
              <CheckCircle2
                className="w-9 h-9 text-emerald-600 dark:text-emerald-400"
                aria-hidden="true"
              />
            </div>
            <Button
              variant="primary"
              size="lg"
              className="w-full font-bold"
              onClick={() => navigate('/login')}
            >
              Go to Login
              <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
            </Button>
          </div>
        )}

        {/* Footer */}
        {!isSuccessStep && (
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Remember your password?{' '}
            <Link
              to="/login"
              className="text-primary-600 dark:text-primary-400 font-bold hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded px-1"
            >
              Back to login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Subcomponents                                                      */
/* ------------------------------------------------------------------ */
function StepProgress({ currentIndex, labels }) {
  return (
    <nav
      className="flex items-center justify-center gap-2"
      aria-label="Password reset progress"
    >
      {labels.map((label, i) => {
        const isDone = i < currentIndex;
        const isActive = i === currentIndex;
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center gap-1 min-w-[48px]">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  isDone
                    ? 'bg-emerald-500 text-white'
                    : isActive
                    ? 'bg-primary-600 text-white ring-4 ring-primary-100 dark:ring-primary-950/50'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
                aria-current={isActive ? 'step' : undefined}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider ${
                  isActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-slate-400'
                }`}
              >
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div
                className={`h-px w-8 mb-4 transition-colors ${
                  i < currentIndex ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'
                }`}
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export default ForgotPasswordPage;