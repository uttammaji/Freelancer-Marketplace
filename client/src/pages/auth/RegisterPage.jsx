// client/src/pages/auth/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Briefcase, UserCheck, Mail, Lock, User, Check, ShieldCheck } from 'lucide-react';

export function RegisterPage() {
  const { register, verifyRegistration, resendRegistrationOTP } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Step 1: Registration Form
  const [roleSelection, setRoleSelection] = useState('client');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Step 2: OTP Verification
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Timer for resend OTP
  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Step 1: Handle registration
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!name || !email || !password) {
      toast.warning('Fields Required', 'Please complete all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Password Mismatch', 'Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      toast.warning('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    if (!agreedToTerms) {
      toast.warning('Terms Required', 'Please agree to the Terms of Service.');
      return;
    }

    setIsLoading(true);
    const result = await register({
      name,
      username,
      email,
      password,
      role: roleSelection
    });
    setIsLoading(false);

    if (result.success) {
      toast.success('OTP Sent', 'Check your email for verification code.');
      setShowOTP(true);
      setResendTimer(60);
    } else {
      toast.error('Registration Failed', result.error);
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
    const result = await verifyRegistration(email, otp);
    setIsVerifying(false);

    if (result.success) {
      toast.success('Account Created! 🎉', 'Your email has been verified.');
      
      // Navigate based on role
      if (roleSelection === 'client') {
        navigate('/dashboard/client');
      } else {
        navigate('/dashboard/freelancer');
      }
    } else {
      toast.error('Verification Failed', result.error);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    try {
      const result = await resendRegistrationOTP(email);
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
      <div className="max-w-lg w-full space-y-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 p-8 rounded-3xl shadow-soft-lg">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold shadow-soft">
              <Briefcase className="w-5 h-5 stroke-[2.2]" />
            </div>
          </Link>

          {!showOTP ? (
            <>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Join SkillHire
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose your account objective to get started
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Verify Your Email
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter the 6-digit code sent to {email}
              </p>
            </>
          )}
        </div>

        {/* Step 1: Registration Form */}
        {!showOTP ? (
          <>
            {/* Role Selection Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setRoleSelection('client')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  roleSelection === 'client'
                    ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-950/40 text-primary-900 dark:text-white shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Briefcase className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  {roleSelection === 'client' && <Check className="w-4 h-4 text-primary-600" />}
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  I want to hire freelancers
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Post projects & hire top talent
                </p>
              </div>

              <div
                onClick={() => setRoleSelection('freelancer')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  roleSelection === 'freelancer'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-white shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  {roleSelection === 'freelancer' && <Check className="w-4 h-4 text-emerald-600" />}
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  I want to work as freelancer
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Find jobs & earn with escrow
                </p>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                placeholder="Sarah Connor"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={User}
                required
              />

              <Input
                label="Username"
                type="text"
                placeholder="sarah_connor"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, '_'))}
                icon={User}
                required
              />

              <Input
                label="Work Email"
                type="email"
                placeholder="sarah@nexusinnovations.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={Lock}
                  required
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  icon={Lock}
                  required
                />
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 dark:text-slate-400 pt-1">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 mt-0.5"
                />
                <span>
                  I agree to the SkillHire{' '}
                  <a href="#" className="text-primary-600 dark:text-primary-400 underline">Terms of Service</a>{' '}
                  and{' '}
                  <a href="#" className="text-primary-600 dark:text-primary-400 underline">Privacy Policy</a>.
                </span>
              </label>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full font-bold shadow-md"
                isLoading={isLoading}
              >
                Create My {roleSelection === 'client' ? 'Client' : 'Freelancer'} Account
              </Button>
            </form>
          </>
        ) : (
          /* Step 2: OTP Verification Form */
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
              Verify & Create Account
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
              ← Back to registration
            </button>
          </form>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 dark:text-primary-400 font-bold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}