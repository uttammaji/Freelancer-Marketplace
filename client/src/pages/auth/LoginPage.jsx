// client/src/pages/auth/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Briefcase, Lock, Mail, ArrowRight, ShieldCheck, UserPlus, X } from 'lucide-react';

// Google Icon Component
function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"/>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
      <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"/>
      <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/>
    </svg>
  );
}

export function LoginPage() {
  const { login, verifyLogin, resendLoginOTP } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Step 1: Email + Password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Step 2: OTP
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Account not found modal
  const [showAccountNotFound, setShowAccountNotFound] = useState(false);

  // Check for Google error on mount
  useEffect(() => {
    const error = searchParams.get('error');
    
    if (error === 'account_not_found') {
      setShowAccountNotFound(true);
    } else if (error === 'account_blocked') {
      toast.error('Account Blocked', 'Your account has been blocked.');
    } else if (error === 'google_auth_failed') {
      toast.error('Login Failed', 'Google authentication failed.');
    }
    
    // Clear error from URL
    if (error) {
      navigate('/login', { replace: true });
    }
  }, [searchParams]);

  // Timer for resend OTP
  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Handle Google Login
  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    window.location.href = `${API_URL}/auth/google?intent=login`;
  };

  // Step 1: Handle password login
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.warning('Input Required', 'Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      toast.success('Password Verified', 'OTP sent to your email.');
      setShowOTP(true);
      setResendTimer(60);
    } else {
      toast.error('Login Failed', result.error);
    }
  };

  // Step 2: Handle OTP verification
  const handleOTPSubmit = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.warning('Invalid OTP', 'Please enter the 6-digit OTP.');
      return;
    }

    setIsVerifying(true);
    const result = await verifyLogin(email, otp);
    setIsVerifying(false);

    if (result.success) {
      toast.success('Welcome Back!', 'Logged in successfully.');
      
      const role = result.data.user.role;
      if (role === 'client') {
        navigate('/dashboard/client');
      } else if (role === 'freelancer') {
        navigate('/dashboard/freelancer');
      } else if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      toast.error('Verification Failed', result.error);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    try {
      await resendLoginOTP(email);
      toast.success('OTP Resent', 'Check your email for new OTP.');
      setResendTimer(60);
    } catch (error) {
      toast.error('Resend Failed', error.response?.data?.message || 'Try again later.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 p-8 rounded-3xl shadow-soft-lg">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold shadow-soft">
              <Briefcase className="w-5 h-5 stroke-[2.2]" />
            </div>
          </Link>
          
          {!showOTP ? (
            <>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Sign in to SkillHire
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter your credentials to continue
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Verify OTP
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter the 6-digit code sent to {email}
              </p>
            </>
          )}
        </div>

        {/* Step 1: Password Form */}
        {!showOTP ? (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={Lock}
                required
              />

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 h-3.5 w-3.5"
                  />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full font-bold" isLoading={isLoading}>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <span className="relative px-3 bg-white dark:bg-slate-900 text-xs text-slate-400 uppercase font-semibold">
                Or continue with
              </span>
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {isGoogleLoading ? (
                <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              Continue with Google
            </button>
          </>
        ) : (
          /* Step 2: OTP Form */
          <form onSubmit={handleOTPSubmit} className="space-y-4">
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
              Verify & Login
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
              ← Back to login
            </button>
          </form>
        )}

        {/* Footer link */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 dark:text-primary-400 font-bold hover:underline">
            Sign up for free
          </Link>
        </p>
      </div>

      {/* Account Not Found Modal */}
      {showAccountNotFound && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-soft-lg space-y-5">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center mx-auto">
                <UserPlus className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                No Account Found
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                This Google account is not registered. Please create an account first.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowAccountNotFound(false)}
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
      )}
    </div>
  );
}