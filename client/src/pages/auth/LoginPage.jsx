// client/src/pages/auth/LoginPage.jsx
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { GoogleRoleModal } from './GoogleRoleModal';
import {
  Briefcase,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  UserPlus,
  X,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const OTP_LENGTH = 6;
const OTP_RESEND_COOLDOWN = 60;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLE_DASHBOARDS = {
  client: '/dashboard/client',
  freelancer: '/dashboard/freelancer',
  admin: '/admin',
};

/* ------------------------------------------------------------------ */
/*  Google icon                                                        */
/* ------------------------------------------------------------------ */
function GoogleIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
      <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
      <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function LoginPage() {
  const { login, verifyLogin, resendLoginOTP } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  /* ---------------- Step state ---------------- */
  const [step, setStep] = useState('credentials'); // 'credentials' | 'otp'

  /* ---------------- Form state ---------------- */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  /* ---------------- OTP state ---------------- */
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);

  /* ---------------- Async state ---------------- */
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showAccountNotFound, setShowAccountNotFound] = useState(false);

  /* ---------------- Refs ---------------- */
  const otpInputRef = useRef(null);
  const googleBtnRef = useRef(null);

  /* ---------------- Handle URL error params (from Google OAuth) ---------------- */
  useEffect(() => {
    const error = searchParams.get('error');
    if (!error) return;

    switch (error) {
      case 'account_not_found':
        setShowAccountNotFound(true);
        break;
      case 'account_blocked':
        toast.error('Account Blocked', 'Your account has been blocked. Contact support.');
        break;
      case 'google_auth_failed':
        toast.error('Login Failed', 'Google authentication failed. Please try again.');
        break;
      default:
        toast.error('Login Failed', 'Something went wrong. Please try again.');
    }

    // Clean the URL so refresh doesn't re-trigger
    navigate('/login', { replace: true });
  }, [searchParams, toast, navigate]);

  /* ---------------- Resend cooldown ---------------- */
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  /* ---------------- Focus OTP input ---------------- */
  useEffect(() => {
    if (step === 'otp') {
      const t = setTimeout(() => otpInputRef.current?.focus?.(), 100);
      return () => clearTimeout(t);
    }
  }, [step]);

  /* ---------------- Derived ---------------- */
  const destinationFor = useCallback(
    (role) => ROLE_DASHBOARDS[role] || '/',
    []
  );

  /* ---------------- Google login ---------------- */
  const handleGoogleLogin = useCallback(() => {
    setIsGoogleLoading(true);
    const API_URL =
      import.meta.env?.VITE_API_URL || 'http://localhost:3000/api';
    window.location.href = `${API_URL}/auth/google?intent=login`;
  }, []);

  /* ---------------- Step 1: Password login ---------------- */
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // Validate
      let hasError = false;
      const trimmedEmail = email.trim();

      if (!trimmedEmail) {
        setEmailError('Email is required.');
        hasError = true;
      } else if (!EMAIL_REGEX.test(trimmedEmail)) {
        setEmailError('Enter a valid email address.');
        hasError = true;
      } else {
        setEmailError(null);
      }

      if (!password) {
        setPasswordError('Password is required.');
        hasError = true;
      } else {
        setPasswordError(null);
      }

      if (hasError) return;

      setIsLoading(true);
      try {
        const result = await login(trimmedEmail, password);
        if (result?.success) {
          toast.success('Password Verified', 'Check your email for the OTP.');
          setResendTimer(OTP_RESEND_COOLDOWN);
          setStep('otp');
        } else {
          toast.error('Login Failed', result?.error || 'Invalid credentials.');
        }
      } catch (err) {
        console.error('[Login] password step failed:', err);
        toast.error('Login Failed', 'Something went wrong. Try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, login, toast]
  );

  /* ---------------- Step 2: OTP verify ---------------- */
  const handleOTPSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!otp || otp.length !== OTP_LENGTH) {
        setOtpError(`Enter the ${OTP_LENGTH}-digit code.`);
        return;
      }
      setOtpError(null);

      setIsLoading(true);
      try {
        const result = await verifyLogin(email.trim(), otp);
        if (result?.success) {
          toast.success('Welcome Back!', 'Logged in successfully.');
          const role = result?.data?.user?.role;
          navigate(destinationFor(role), { replace: true });
        } else {
          toast.error('Verification Failed', result?.error || 'Invalid or expired OTP.');
          setOtp('');
        }
      } catch (err) {
        console.error('[Login] OTP verify failed:', err);
        toast.error('Verification Failed', 'Something went wrong. Try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [otp, email, verifyLogin, toast, navigate, destinationFor]
  );

  /* ---------------- Resend OTP ---------------- */
  const handleResendOTP = useCallback(async () => {
    if (resendTimer > 0 || isLoading) return;

    setIsLoading(true);
    try {
      await resendLoginOTP(email.trim());
      toast.success('OTP Resent', 'Check your email for a new code.');
      setResendTimer(OTP_RESEND_COOLDOWN);
      setOtp('');
      setOtpError(null);
    } catch (err) {
      console.error('[Login] resend failed:', err);
      toast.error(
        'Resend Failed',
        err?.response?.data?.message || 'Try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [resendTimer, isLoading, resendLoginOTP, email, toast]);

  /* ---------------- Back to credentials ---------------- */
  const handleBack = useCallback(() => {
    setStep('credentials');
    setOtp('');
    setOtpError(null);
    // Keep email + password so the user can tweak and retry
  }, []);

  /* ---------------- Render ---------------- */
  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 p-8 rounded-3xl shadow-soft-lg">
        {/* Brand */}
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

        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {step === 'credentials' ? 'Sign in to SkillHire' : 'Verify OTP'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-pretty">
            {step === 'credentials'
              ? 'Enter your credentials to continue.'
              : (
                  <>
                    Enter the {OTP_LENGTH}-digit code sent to{' '}
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {email}
                    </span>
                  </>
                )}
          </p>
        </header>

        {/* ============ Step 1: Credentials ============ */}
        {step === 'credentials' && (
          <>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                icon={Lock}
                error={passwordError}
                required
                aria-label="Password"
              />

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 text-primary-600 focus:ring-primary-500 h-3.5 w-3.5"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded px-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-3 h-3" aria-hidden="true" />
                  ) : (
                    <Eye className="w-3 h-3" aria-hidden="true" />
                  )}
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <div className="flex justify-end text-xs">
                <Link
                  to="/forgot-password"
                  className="text-primary-600 dark:text-primary-400 font-semibold hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded px-1"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full font-bold"
                isLoading={isLoading}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
              </Button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <span className="relative px-3 bg-white dark:bg-slate-900 text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                Or continue with
              </span>
            </div>

            {/* Google button */}
            <button
              ref={googleBtnRef}
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3
                         border border-slate-200 dark:border-slate-700 rounded-xl
                         text-sm font-semibold text-slate-700 dark:text-slate-200
                         hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            >
              {isGoogleLoading ? (
                <div
                  className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"
                  role="status"
                  aria-label="Redirecting to Google"
                />
              ) : (
                <GoogleIcon />
              )}
              Continue with Google
            </button>
          </>
        )}

        {/* ============ Step 2: OTP ============ */}
        {step === 'otp' && (
          <form onSubmit={handleOTPSubmit} className="space-y-4" noValidate>
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
              label={`${OTP_LENGTH}-Digit Code`}
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
              isLoading={isLoading}
              disabled={otp.length !== OTP_LENGTH}
            >
              Verify & Login
            </Button>

            {/* Resend / Back */}
            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400
                           hover:text-slate-900 dark:hover:text-white transition-colors
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded px-1"
              >
                <ArrowLeft className="w-3 h-3" aria-hidden="true" />
                Back to login
              </button>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendTimer > 0 || isLoading}
                className="font-semibold text-primary-600 dark:text-primary-400 hover:underline
                           disabled:opacity-50 disabled:no-underline
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded px-1"
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
              </button>
            </div>

            {/* Security note */}
            <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
              <ShieldCheck
                className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <span className="text-pretty">
                We use two-factor authentication to protect your account.
                Never share this code with anyone.
              </span>
            </div>
          </form>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="text-primary-600 dark:text-primary-400 font-bold hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded px-1"
          >
            Sign up for free
          </Link>
        </p>
      </div>

      {/* Account not found modal */}
      {showAccountNotFound && (
        <AccountNotFoundModal
          onClose={() => setShowAccountNotFound(false)}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Account not found modal                                            */
/* ------------------------------------------------------------------ */
function AccountNotFoundModal({ onClose }) {
  const dialogRef = useRef(null);
  const firstBtnRef = useRef(null);

  /* Focus management */
  useEffect(() => {
    firstBtnRef.current?.focus?.();

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll(
          'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-not-found-title"
      aria-describedby="account-not-found-desc"
    >
      <div
        ref={dialogRef}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-soft-lg space-y-5 relative"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400
                     hover:text-slate-900 dark:hover:text-white transition-colors
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center mx-auto">
            <UserPlus
              className="w-7 h-7 text-amber-600 dark:text-amber-400"
              aria-hidden="true"
            />
          </div>
          <h3
            id="account-not-found-title"
            className="text-lg font-bold text-slate-900 dark:text-white"
          >
            No Account Found
          </h3>
          <p
            id="account-not-found-desc"
            className="text-sm text-slate-500 dark:text-slate-400 text-pretty"
          >
            This Google account isn&apos;t registered with SkillHire yet. Create one in seconds to get started.
          </p>
        </div>

        <div className="flex gap-3 pt-1">
          <Button
            ref={firstBtnRef}
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Link to="/register" className="flex-1">
            <Button variant="primary" className="w-full">
              Register Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;