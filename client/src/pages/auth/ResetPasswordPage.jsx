// client/src/pages/auth/ResetPasswordPage.jsx
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import {
  Briefcase,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  KeyRound,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const MIN_PASSWORD_LENGTH = 8;

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

  if (password.length < MIN_PASSWORD_LENGTH)
    return { score: 1, label: 'Too short', color: 'bg-rose-500' };
  if (score <= 2) return { score: 2, label: 'Weak', color: 'bg-rose-500' };
  if (score === 3) return { score: 3, label: 'Fair', color: 'bg-amber-500' };
  if (score === 4) return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
  return { score: 5, label: 'Very strong', color: 'bg-emerald-600' };
}

/* ------------------------------------------------------------------ */
/*  Live requirement checklist                                         */
/* ------------------------------------------------------------------ */
const REQUIREMENTS = [
  { id: 'length',  label: `At least ${MIN_PASSWORD_LENGTH} characters`, test: (p) => p.length >= MIN_PASSWORD_LENGTH },
  { id: 'upper',   label: 'One uppercase letter',                       test: (p) => /[A-Z]/.test(p) },
  { id: 'lower',   label: 'One lowercase letter',                       test: (p) => /[a-z]/.test(p) },
  { id: 'number',  label: 'One number',                                 test: (p) => /[0-9]/.test(p) },
  { id: 'symbol',  label: 'One symbol (!@#$…)',                         test: (p) => /[^A-Za-z0-9]/.test(p) },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  /* ---------------- Query params ---------------- */
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [linkInvalid, setLinkInvalid] = useState(false);

  /* ---------------- Form state ---------------- */
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  /* ---------------- Async state ---------------- */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  /* ---------------- Refs ---------------- */
  const passwordInputRef = useRef(null);

  /* ---------------- Derived ---------------- */
  const passwordStrength = useMemo(
    () => getPasswordStrength(newPassword),
    [newPassword]
  );

  const passedRequirements = useMemo(
    () => REQUIREMENTS.filter((r) => r.test(newPassword)),
    [newPassword]
  );

  const allRequirementsMet = passedRequirements.length === REQUIREMENTS.length;
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  /* ---------------- Read URL params ---------------- */
  useEffect(() => {
    const emailParam = searchParams.get('email');
    const otpParam = searchParams.get('otp') || searchParams.get('token');

    if (!emailParam || !otpParam) {
      setLinkInvalid(true);
      return;
    }

    setEmail(decodeURIComponent(emailParam));
    setOtp(decodeURIComponent(otpParam));
  }, [searchParams]);

  /* ---------------- Focus password on mount ---------------- */
  useEffect(() => {
    if (linkInvalid || !email || !otp) return;
    const t = setTimeout(() => passwordInputRef.current?.focus?.(), 100);
    return () => clearTimeout(t);
  }, [linkInvalid, email, otp]);

  /* ---------------- Submit ---------------- */
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // Validate
      const nextErrors = {};

      if (!newPassword) {
        nextErrors.newPassword = 'Password is required.';
      } else if (newPassword.length < MIN_PASSWORD_LENGTH) {
        nextErrors.newPassword = `At least ${MIN_PASSWORD_LENGTH} characters.`;
      } else if (!allRequirementsMet) {
        nextErrors.newPassword = 'Please meet all password requirements.';
      }

      if (!confirmPassword) {
        nextErrors.confirmPassword = 'Please confirm your password.';
      } else if (newPassword !== confirmPassword) {
        nextErrors.confirmPassword = 'Passwords do not match.';
      }

      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) {
        toast.error('Invalid Form', 'Please fix the highlighted fields.');
        return;
      }

      setIsSubmitting(true);
      try {
        const result = await resetPassword(email, otp, newPassword);

        if (result?.success) {
          setIsSuccess(true);
          toast.success('Password Reset', 'Redirecting you to login…');
          setTimeout(() => navigate('/login', { replace: true }), 2000);
        } else {
          const errorMsg = result?.error || 'Could not reset password.';
          // If backend says OTP is invalid/expired, mark the link as invalid
          if (/invalid|expired/i.test(errorMsg)) {
            setLinkInvalid(true);
          } else {
            toast.error('Reset Failed', errorMsg);
          }
        }
      } catch (err) {
        console.error('[ResetPassword] failed:', err);
        toast.error('Reset Failed', 'Something went wrong. Try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      newPassword,
      confirmPassword,
      allRequirementsMet,
      email,
      otp,
      resetPassword,
      toast,
      navigate,
    ]
  );

  /* ============ Invalid link state ============ */
  if (linkInvalid) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 p-8 rounded-3xl shadow-soft-lg text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center mx-auto">
            <AlertCircle
              className="w-8 h-8 text-rose-600 dark:text-rose-400"
              aria-hidden="true"
            />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Link Expired or Invalid
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-pretty">
              This password reset link has expired or is invalid. Request a new one to continue.
            </p>
          </div>

          <Link to="/forgot-password" className="block">
            <Button variant="primary" size="lg" className="w-full font-bold">
              Request New Link
              <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
            </Button>
          </Link>

          <Link
            to="/login"
            className="block text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  /* ============ Success state ============ */
  if (isSuccess) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 p-8 rounded-3xl shadow-soft-lg text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center mx-auto">
            <CheckCircle2
              className="w-9 h-9 text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Password Reset!
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-pretty">
              Your password has been updated. Redirecting you to login…
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full font-bold"
            onClick={() => navigate('/login', { replace: true })}
          >
            Go to Login
            <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
          </Button>
        </div>
      </div>
    );
  }

  /* ============ Main form ============ */
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
            Set New Password
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-pretty">
            Create a strong password to secure your account.
          </p>
        </header>

        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center">
            <KeyRound
              className="w-8 h-8 text-primary-600 dark:text-primary-400"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* New password */}
          <div>
            <Input
              ref={passwordInputRef}
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errors.newPassword)
                  setErrors((p) => ({ ...p, newPassword: null }));
              }}
              icon={Lock}
              error={errors.newPassword}
              required
              aria-label="New password"
            />

            {/* Strength meter */}
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
              </div>
            )}
          </div>

          {/* Requirements checklist */}
          {newPassword && !allRequirementsMet && (
            <ul className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              {REQUIREMENTS.map((req) => {
                const passed = req.test(newPassword);
                return (
                  <li
                    key={req.id}
                    className={`flex items-center gap-2 text-[11px] transition-colors ${
                      passed
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {passed ? (
                      <CheckCircle2 className="w-3 h-3 shrink-0" aria-hidden="true" />
                    ) : (
                      <XCircle className="w-3 h-3 shrink-0 opacity-50" aria-hidden="true" />
                    )}
                    <span>{req.label}</span>
                  </li>
                );
              })}
            </ul>
          )}

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
                if (errors.confirmPassword)
                  setErrors((p) => ({ ...p, confirmPassword: null }));
              }}
              icon={Lock}
              error={errors.confirmPassword}
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

              {passwordsMatch && (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                  Matches
                </span>
              )}
            </div>
          </div>

          {/* Security note */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck
              className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <span className="text-pretty">
              All active sessions on other devices will be signed out for your security.
            </span>
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
              !allRequirementsMet
            }
          >
            Reset Password
          </Button>

          <Link
            to="/login"
            className="block text-center text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded py-1"
          >
            Back to login
          </Link>
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordPage;