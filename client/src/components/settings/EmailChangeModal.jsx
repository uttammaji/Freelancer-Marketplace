// client/src/components/settings/EmailChangeModal.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';
import { Mail, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

export function EmailChangeModal({ isOpen, onClose }) {
  const { currentUser, changeEmail, verifyEmailChange } = useAuth();
  const toast = useToast();

  // Step state: 1=Enter New Email, 2=Enter Both OTPs
  const [step, setStep] = useState(1);
  const [newEmail, setNewEmail] = useState('');
  const [oldEmailOTP, setOldEmailOTP] = useState('');
  const [newEmailOTP, setNewEmailOTP] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleRequestChange = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.warning('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (newEmail.toLowerCase() === currentUser?.email?.toLowerCase()) {
      toast.warning('Same Email', 'New email must be different from current email.');
      return;
    }

    setIsLoading(true);
    const result = await changeEmail(newEmail);
    setIsLoading(false);

    if (result.success) {
      toast.success('OTP Sent', 'Verification codes sent to both email addresses.');
      setStep(2);
      setResendTimer(60);
    } else {
      toast.error('Request Failed', result.error);
    }
  };

  const handleVerifyChange = async () => {
    if (!oldEmailOTP || oldEmailOTP.length !== 6) {
      toast.warning('Invalid OTP', 'Please enter the 6-digit code sent to your old email.');
      return;
    }

    if (!newEmailOTP || newEmailOTP.length !== 6) {
      toast.warning('Invalid OTP', 'Please enter the 6-digit code sent to your new email.');
      return;
    }

    setIsLoading(true);
    const result = await verifyEmailChange(newEmail, oldEmailOTP, newEmailOTP);
    setIsLoading(false);

    if (result.success) {
      toast.success('Email Changed', 'Your email address has been updated successfully.');
      resetAndClose();
    } else {
      toast.error('Verification Failed', result.error);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setNewEmail('');
    setOldEmailOTP('');
    setNewEmailOTP('');
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={resetAndClose} 
      title="Change Email Address" 
      size="md"
    >
      <div className="space-y-4">
        {/* Step 1: Enter New Email */}
        {step === 1 && (
          <>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6 text-primary-600" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Current email: <span className="font-semibold">{currentUser?.email}</span>
              </p>
            </div>

            <Input
              label="New Email Address"
              type="email"
              placeholder="newemail@gmail.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              icon={Mail}
              required
            />

            <Button
              type="button"
              variant="primary"
              className="w-full"
              onClick={handleRequestChange}
              isLoading={isLoading}
            >
              Send Verification Codes
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </>
        )}

        {/* Step 2: Enter Both OTPs */}
        {step === 2 && (
          <>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Enter OTPs sent to both email addresses
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-xl">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2">
                  Old Email: {currentUser?.email}
                </p>
                <Input
                  label="OTP from Old Email"
                  type="text"
                  placeholder="123456"
                  value={oldEmailOTP}
                  onChange={(e) => setOldEmailOTP(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                />
              </div>

              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
                  New Email: {newEmail}
                </p>
                <Input
                  label="OTP from New Email"
                  type="text"
                  placeholder="123456"
                  value={newEmailOTP}
                  onChange={(e) => setNewEmailOTP(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                />
              </div>
            </div>

            <Button
              type="button"
              variant="primary"
              className="w-full"
              onClick={handleVerifyChange}
              isLoading={isLoading}
            >
              Verify & Change Email
            </Button>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
              <button
                type="button"
                onClick={handleRequestChange}
                disabled={resendTimer > 0}
                className="text-xs text-slate-400 hover:text-primary-600 disabled:opacity-50"
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTPs'}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}