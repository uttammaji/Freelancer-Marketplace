// client/src/pages/auth/RegisterPage.jsx
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  Briefcase,
  UserCheck,
  Mail,
  Lock,
  User,
  AtSign,
  Check,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const OTP_LENGTH = 6;
const OTP_RESEND_COOLDOWN = 60;
const MIN_PASSWORD_LENGTH = 8;
const MIN_USERNAME_LENGTH = 3;
const MAX_USERNAME_LENGTH = 20;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-z0-9_]+$/;

const ROLE_CARDS = [
  {
    id: 'client',
    title: 'I want to hire freelancers',
    description: 'Post projects & hire top talent',
    icon: Briefcase,
    accent: {
      border: 'border-primary-600',
      bg: 'bg-primary-50/50 dark:bg-primary-950/40',
      text: 'text-primary-600 dark:text-primary-400',
    },
  },
  {
    id: 'freelancer',
    title: 'I want to work as freelancer',
    description: 'Find jobs & earn with escrow',
    icon: UserCheck,
    accent: {
      border: 'border-emerald-600',
      bg: 'bg-emerald-50/50 dark:bg-emerald-950/40',
      text: 'text-emerald-600 dark:text-emerald-400',
    },
  },
];

const ROLE_DASHBOARDS = {
  client: '/dashboard/client',
  freelancer: '/dashboard/freelancer',
  admin: '/admin',
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
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
  if (score <= 2) return { score: 2, label: 'Weak', color: 'bg-rose-500' };
  if (score === 3) return { score: 3, label: 'Fair', color: 'bg-amber-500' };
  if (score === 4) return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
  return { score: 5, label: 'Very strong', color: 'bg-emerald-600' };
}

function slugifyUsername(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

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
export function RegisterPage() {
  const { register, verifyRegistration, resendRegistrationOTP } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  /* ---------------- Step state ---------------- */
  const [step, setStep] = useState('form'); // 'form' | 'otp'

  /* ---------------- Form state ---------------- */
  const [roleSelection, setRoleSelection] = useState('client');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /* ---------------- Field errors ---------------- */
  const [errors, setErrors] = useState({});

  /* ---------------- OTP state ---------------- */
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);

  /* ---------------- Async state ---------------- */
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  /* ---------------- Refs ---------------- */
  const otpInputRef = useRef(null);

  /* ---------------- Derived ---------------- */
  const passwordStrength = useMemo(
    () => getPasswordStrength(password),
    [password]
  );

  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  /* ---------------- Resend cooldown ---------------- */
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  /* ---------------- Focus OTP input on step change ---------------- */
  useEffect(() => {
    if (step === 'otp') {
      const t = setTimeout(() => otpInputRef.current?.focus?.(), 100);
      return () => clearTimeout(t);
    }
  }, [step]);

  /* ---------------- Google signup ---------------- */
  const handleGoogleSignup = useCallback(() => {
    setIsGoogleLoading(true);
    const API_URL =
      import.meta.env?.VITE_API_URL || 'http://localhost:3000/api';
    window.location.href = `${API_URL}/auth/google?intent=register&role=${roleSelection}`;
  }, [roleSelection]);

  /* ---------------- Validation ---------------- */
  const validateForm = useCallback(() => {
    const next = {};

    const trimmedName = name.trim();
    if (!trimmedName) next.name = 'Full name is required.';
    else if (trimmedName.length < 2) next.name = 'Name is too short.';

    const trimmedUsername = username.trim();
    if (!trimmedUsername) next.username = 'Username is required.';
    else if (trimmedUsername.length < MIN_USERNAME_LENGTH)
      next.username = `At least ${MIN_USERNAME_LENGTH} characters.`;
    else if (trimmedUsername.length > MAX_USERNAME_LENGTH)
      next.username = `At most ${MAX_USERNAME_LENGTH} characters.`;
    else if (!USERNAME_REGEX.test(trimmedUsername))
      next.username = 'Only lowercase letters, numbers, and underscores.';

    const trimmedEmail = email.trim();
    if (!trimmedEmail) next.email = 'Email is required.';
    else if (!EMAIL_REGEX.test(trimmedEmail)) next.email = 'Enter a valid email.';

    if (!password) next.password = 'Password is required.';
    else if (password.length < MIN_PASSWORD_LENGTH)
      next.password = `At least ${MIN_PASSWORD_LENGTH} characters.`;
    else if (passwordStrength.score < 3)
      next.password = 'Password is too weak. Add uppercase, numbers, or symbols.';

    if (!confirmPassword) next.confirmPassword = 'Please confirm your password.';
    else if (password !== confirmPassword)
      next.confirmPassword = 'Passwords do not match.';

    if (!agreedToTerms) next.terms = 'You must accept the terms.';

    setErrors(next);
    return Object.keys(next).length === 0;
  }, [
    name,
    username,
    email,
    password,
    confirmPassword,
    agreedToTerms,
    passwordStrength,
  ]);

  /* ---------------- Step 1: Submit registration ---------------- */
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validateForm()) {
        toast.error('Invalid Form', 'Please fix the highlighted fields.');
        return;
      }

      setIsLoading(true);
      try {
        const result = await register({
          name: name.trim(),
          username: username.trim(),
          email: email.trim(),
          password,
          role: roleSelection,
        });

        if (result?.success) {
          toast.success('OTP Sent', `Check ${email.trim()} for the verification code.`);
          setResendTimer(OTP_RESEND_COOLDOWN);
          setStep('otp');
        } else {
          // Surface field-specific errors from backend if provided
          if (result?.field) {
            setErrors((prev) => ({ ...prev, [result.field]: result.error }));
          }
          toast.error('Registration Failed', result?.error || 'Could not create account.');
        }
      } catch (err) {
        console.error('[Register] failed:', err);
        toast.error('Registration Failed', 'Something went wrong. Try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [validateForm, register, name, username, email, password, roleSelection, toast]
  );

  /* ---------------- Step 2: Verify OTP ---------------- */
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
        const result = await verifyRegistration(email.trim(), otp);
        if (result?.success) {
          toast.success('Account Created! 🎉', 'Your email has been verified.');

          // Prefer server-returned role; fall back to selection
          const role = result?.data?.user?.role || roleSelection;
          navigate(ROLE_DASHBOARDS[role] || '/', { replace: true });
        } else {
          toast.error('Verification Failed', result?.error || 'Invalid or expired OTP.');
          setOtp('');
        }
      } catch (err) {
        console.error('[Register] OTP verify failed:', err);
        toast.error('Verification Failed', 'Something went wrong. Try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [otp, email, verifyRegistration, toast, navigate, roleSelection]
  );

  /* ---------------- Resend OTP ---------------- */
  const handleResendOTP = useCallback(async () => {
    if (resendTimer > 0 || isLoading) return;

    setIsLoading(true);
    try {
      const result = await resendRegistrationOTP(email.trim());
      if (result?.success) {
        toast.success('OTP Resent', 'Check your email for a new code.');
        setResendTimer(OTP_RESEND_COOLDOWN);
        setOtp('');
        setOtpError(null);
      } else {
        toast.error('Resend Failed', result?.error || 'Try again later.');
      }
    } catch (err) {
      console.error('[Register] resend failed:', err);
      toast.error(
        'Resend Failed',
        err?.response?.data?.message || 'Try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [resendTimer, isLoading, resendRegistrationOTP, email, toast]);

  /* ---------------- Back to form ---------------- */
  const handleBack = useCallback(() => {
    setStep('form');
    setOtp('');
    setOtpError(null);
  }, []);

  /* ---------------- Render ---------------- */
  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 p-8 rounded-3xl shadow-soft-lg">
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {step === 'form' ? 'Join SkillHire' : 'Verify Your Email'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-pretty">
            {step === 'form'
              ? 'Choose your account objective to get started.'
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

        {/* ============ Step 1: Registration form ============ */}
        {step === 'form' && (
          <>
            {/* Role selection */}
            <fieldset>
              <legend className="sr-only">Select account type</legend>
              <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Account type">
                {ROLE_CARDS.map((role) => {
                  const Icon = role.icon;
                  const isSelected = roleSelection === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setRoleSelection(role.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
                        isSelected
                          ? `${role.accent.border} ${role.accent.bg}`
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      } focus-visible:ring-${role.id === 'client' ? 'primary' : 'emerald'}-500`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon
                          className={`w-5 h-5 ${
                            isSelected ? role.accent.text : 'text-slate-400'
                          }`}
                          aria-hidden="true"
                        />
                        {isSelected && (
                          <span className={`w-4 h-4 rounded-full ${role.accent.bg} flex items-center justify-center`}>
                            <Check className={`w-3 h-3 ${role.accent.text}`} aria-hidden="true" />
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        {role.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 text-pretty">
                        {role.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input
                label="Full Name"
                type="text"
                autoComplete="name"
                placeholder="Sarah Connor"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((p) => ({ ...p, name: null }));
                }}
                onBlur={() => {
                  if (name && name.trim().length < 2) {
                    setErrors((p) => ({ ...p, name: 'Name is too short.' }));
                  }
                }}
                icon={User}
                error={errors.name}
                required
                aria-label="Full name"
              />

              <Input
                label="Username"
                type="text"
                autoComplete="username"
                placeholder="sarah_connor"
                value={username}
                onChange={(e) => {
                  setUsername(slugifyUsername(e.target.value));
                  if (errors.username) setErrors((p) => ({ ...p, username: null }));
                }}
                icon={AtSign}
                error={errors.username}
                helperText={`Lowercase letters, numbers, underscores · ${username.length}/${MAX_USERNAME_LENGTH}`}
                maxLength={MAX_USERNAME_LENGTH}
                required
                aria-label="Username"
              />

              <Input
                label="Work Email"
                type="email"
                autoComplete="email"
                placeholder="sarah@nexusinnovations.io"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((p) => ({ ...p, email: null }));
                }}
                onBlur={() => {
                  const trimmed = email.trim();
                  if (trimmed && !EMAIL_REGEX.test(trimmed)) {
                    setErrors((p) => ({ ...p, email: 'Enter a valid email.' }));
                  }
                }}
                icon={Mail}
                error={errors.email}
                required
                aria-label="Email address"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((p) => ({ ...p, password: null }));
                  }}
                  icon={Lock}
                  error={errors.password}
                  required
                  aria-label="Password"
                />

                <Input
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword)
                      setErrors((p) => ({ ...p, confirmPassword: null }));
                  }}
                  icon={Lock}
                  error={errors.confirmPassword}
                  required
                  aria-label="Confirm password"
                />
              </div>

              {/* Password strength + match indicator */}
              {(password || confirmPassword) && (
                <div className="space-y-2">
                  {password && (
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
                  )}

                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded px-1"
                        aria-label={showPassword ? 'Hide passwords' : 'Show passwords'}
                      >
                        {showPassword ? <EyeOff className="w-3 h-3" aria-hidden="true" /> : <Eye className="w-3 h-3" aria-hidden="true" />}
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>

                    {passwordsMatch && (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                        Passwords match
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Terms */}
              <div>
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => {
                      setAgreedToTerms(e.target.checked);
                      if (errors.terms) setErrors((p) => ({ ...p, terms: null }));
                    }}
                    className="rounded border-slate-300 dark:border-slate-700 text-primary-600 focus:ring-primary-500 mt-0.5"
                    aria-invalid={Boolean(errors.terms)}
                    aria-describedby={errors.terms ? 'terms-error' : undefined}
                  />
                  <span className="text-pretty">
                    I agree to the SkillHire{' '}
                    <Link to="/terms" className="text-primary-600 dark:text-primary-400 underline hover:no-underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-primary-600 dark:text-primary-400 underline hover:no-underline">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
                {errors.terms && (
                  <p id="terms-error" className="mt-1.5 text-[11px] text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" aria-hidden="true" />
                    {errors.terms}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full font-bold shadow-md"
                isLoading={isLoading}
              >
                Create My {roleSelection === 'client' ? 'Client' : 'Freelancer'} Account
                <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
              </Button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <span className="relative px-3 bg-white dark:bg-slate-900 text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                Or sign up with
              </span>
            </div>

            {/* Google signup */}
            <button
              type="button"
              onClick={handleGoogleSignup}
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
              Sign up with Google
            </button>
          </>
        )}

        {/* ============ Step 2: OTP ============ */}
        {step === 'otp' && (
          <form onSubmit={handleOTPSubmit} className="space-y-4" noValidate>
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-primary-600 dark:text-primary-400" aria-hidden="true" />
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
              aria-label="Verification code"
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
              Verify & Create Account
            </Button>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400
                           hover:text-slate-900 dark:hover:text-white transition-colors
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded px-1"
              >
                <ArrowLeft className="w-3 h-3" aria-hidden="true" />
                Back to registration
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

            <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
              <span className="text-pretty">
                Didn&apos;t get the email? Check your spam folder, or resend after{' '}
                {OTP_RESEND_COOLDOWN} seconds.
              </span>
            </div>
          </form>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-primary-600 dark:text-primary-400 font-bold hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded px-1"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;