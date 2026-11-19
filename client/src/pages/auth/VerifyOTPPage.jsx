// client/src/pages/auth/VerifyOTPPage.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import {
  Briefcase,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function VerifyOTPPage() {
  const { verifyRegistration, resendRegistrationOTP } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  /* ---------------- State ---------------- */
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(null);

  const otpInputRef = useRef(null);

  /* ---------------- Read email from URL ---------------- */
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    } else {
      // No email → send back to register
      toast.error('Invalid Link', 'Please register again to get a new code.');
      navigate('/register', { replace: true });
    }
  }, [searchParams, toast, navigate]);

  /* ---------------- Focus OTP input on mount ---------------- */
  useEffect(() => {
    if (!email) return;
    const t = setTimeout(() => otpInputRef.current?.focus?.(), 100);
    return () => clearTimeout(t);
  }, [email]);

  /* ---------------- Resend cooldown ---------------- */
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  /* ---------------- Verify OTP ---------------- */
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!otp || otp.length !== OTP_LENGTH) {
        setOtpError(`Enter the ${OTP_LENGTH}-digit code.`);
        return;
      }
      setOtpError(null);
      setIsSubmitting(true);

      try {
        const result = await verifyRegistration(email, otp);

        if (result?.success) {
          toast.success('Email Verified! 🎉', 'Your account is ready.');
          const role = result?.data?.user?.role || 'client';
          const destination =
            role === 'freelancer'
              ? '/dashboard/freelancer'
              : role === 'admin'
              ? '/admin'
              : '/dashboard/client';
          navigate(destination, { replace: true });
        } else {
          // Surface attempts-left if backend provides it
          if (result?.attemptsLeft !== undefined) {
            setAttemptsLeft(result.attemptsLeft);
          }
          setOtpError(result?.error || 'Invalid or expired code.');
          setOtp('');
          toast.error('Verification Failed', result?.error || 'Invalid code.');
        }
      } catch (err) {
        console.error('[VerifyOTP] failed:', err);
        toast.error('Verification Failed', 'Something went wrong. Try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [otp, email, verifyRegistration, toast, navigate]
  );

  /* ---------------- Resend OTP ---------------- */
  const handleResend = useCallback(async () => {
    if (resendTimer > 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await resendRegistrationOTP(email);
      if (result?.success) {
        toast.success('Code Resent', `Check ${email} for a new code.`);
        setResendTimer(RESEND_COOLDOWN);
        setOtp('');
        setOtpError(null);
        setAttemptsLeft(null);
      } else {
        toast.error('Resend Failed', result?.error || 'Try again later.');
      }
    } catch (err) {
      console.error('[VerifyOTP] resend failed:', err);
      toast.error(
        'Resend Failed',
        err?.response?.data?.message || 'Try again later.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [resendTimer, isSubmitting, resendRegistrationOTP, email, toast]);

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
            Verify Your Email
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-pretty">
            We sent a {OTP_LENGTH}-digit code to{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300 break-all">
              {email}
            </span>
          </p>
        </header>

        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center">
            <ShieldCheck
              className="w-8 h-8 text-primary-600 dark:text-primary-400"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
            helperText={
              attemptsLeft !== null
                ? `${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining`
                : `${otp.length}/${OTP_LENGTH} digits`
            }
            required
            aria-label="Verification code"
            className="text-center tracking-[0.5em] font-mono text-lg"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full font-bold"
            isLoading={isSubmitting}
            disabled={otp.length !== OTP_LENGTH}
          >
            Verify Email
          </Button>

          {/* Back + Resend */}
          <div className="flex items-center justify-between text-xs pt-1">
            <Link
              to="/register"
              className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400
                         hover:text-slate-900 dark:hover:text-white transition-colors
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded px-1"
            >
              <ArrowLeft className="w-3 h-3" aria-hidden="true" />
              Change email
            </Link>

            <button
              type="button"
              onClick={handleResend}
              disabled={resendTimer > 0 || isSubmitting}
              className="font-semibold text-primary-600 dark:text-primary-400 hover:underline
                         disabled:opacity-50 disabled:no-underline
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded px-1"
            >
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
            </button>
          </div>

          {/* Info panel */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            <AlertCircle
              className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <span className="text-pretty">
              Code expires in 10 minutes. Didn&apos;t get the email? Check spam or resend.
            </span>
          </div>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Already verified?{' '}
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

export default VerifyOTPPage;