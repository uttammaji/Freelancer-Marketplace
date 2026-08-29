// client/src/components/settings/PhoneVerificationModal.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';
import { Phone, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

export function PhoneVerificationModal({ isOpen, onClose, isChanging = false }) {
  const { 
    currentUser,
    sendPhoneOTP, 
    verifyPhoneOTP,
    changePhone,
    verifyOldPhoneOTP,
    verifyNewPhoneOTP,
  } = useAuth();
  const toast = useToast();

  // Step state
  const [step, setStep] = useState(1); // 1=Enter Phone, 2=Enter OTP, 3=Verify Old OTP, 4=Verify New OTP
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [oldPhoneOTP, setOldPhoneOTP] = useState('');
  const [newPhoneOTP, setNewPhoneOTP] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      toast.warning('Invalid Phone', 'Please enter a valid phone number.');
      return;
    }

    setIsLoading(true);
    const result = await sendPhoneOTP(phone);
    setIsLoading(false);

    if (result.success) {
      toast.success('OTP Sent', 'Verification code sent to your phone.');
      setStep(2);
      setResendTimer(60);
    } else {
      toast.error('Send Failed', result.error);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.warning('Invalid OTP', 'Please enter the 6-digit code.');
      return;
    }

    setIsLoading(true);
    const result = await verifyPhoneOTP(phone, otp);
    setIsLoading(false);

    if (result.success) {
      toast.success('Phone Verified', 'Your phone number has been verified.');
      resetAndClose();
    } else {
      toast.error('Verification Failed', result.error);
    }
  };

  // Phone Change Flow
  const handleChangePhoneRequest = async () => {
    if (!phone || phone.length < 10) {
      toast.warning('Invalid Phone', 'Please enter a valid new phone number.');
      return;
    }

    setIsLoading(true);
    const result = await changePhone(phone);
    setIsLoading(false);

    if (result.success) {
      toast.success('OTP Sent', `OTP sent to your old phone ending in ${currentUser?.phone?.slice(-4)}`);
      setStep(3);
      setResendTimer(60);
    } else {
      toast.error('Request Failed', result.error);
    }
  };

  const handleVerifyOldOTP = async () => {
    if (!oldPhoneOTP || oldPhoneOTP.length !== 6) {
      toast.warning('Invalid OTP', 'Please enter the 6-digit code.');
      return;
    }

    setIsLoading(true);
    const result = await verifyOldPhoneOTP(phone, oldPhoneOTP);
    setIsLoading(false);

    if (result.success) {
      toast.success('Old Phone Verified', `OTP sent to new phone ${phone}`);
      setStep(4);
      setResendTimer(60);
    } else {
      toast.error('Verification Failed', result.error);
    }
  };

  const handleVerifyNewOTP = async () => {
    if (!newPhoneOTP || newPhoneOTP.length !== 6) {
      toast.warning('Invalid OTP', 'Please enter the 6-digit code.');
      return;
    }

    setIsLoading(true);
    const result = await verifyNewPhoneOTP(phone, newPhoneOTP);
    setIsLoading(false);

    if (result.success) {
      toast.success('Phone Changed', 'Your phone number has been updated.');
      resetAndClose();
    } else {
      toast.error('Verification Failed', result.error);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setPhone('');
    setOtp('');
    setOldPhoneOTP('');
    setNewPhoneOTP('');
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={resetAndClose} 
      title={isChanging ? 'Change Phone Number' : 'Verify Phone Number'} 
      size="sm"
    >
      <div className="space-y-4">
        {/* Step 1: Enter Phone */}
        {step === 1 && (
          <>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center mx-auto">
                <Phone className="w-6 h-6 text-primary-600" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {isChanging 
                  ? 'Enter your new phone number' 
                  : 'Enter your phone number for verification'}
              </p>
            </div>

            <Input
              label="Phone Number"
              type="tel"
              placeholder="+91 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              icon={Phone}
              required
            />

            <Button
              type="button"
              variant="primary"
              className="w-full"
              onClick={isChanging ? handleChangePhoneRequest : handleSendOTP}
              isLoading={isLoading}
            >
              {isChanging ? 'Send OTP to Old Phone' : 'Send OTP'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </>
        )}

        {/* Step 2: Enter OTP (First time verification) */}
        {step === 2 && (
          <>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Enter OTP sent to {phone}
              </p>
            </div>

            <Input
              label="OTP Code"
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              maxLength={6}
              required
            />

            <Button
              type="button"
              variant="primary"
              className="w-full"
              onClick={handleVerifyOTP}
              isLoading={isLoading}
            >
              Verify Phone
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={resendTimer > 0}
                className="text-xs text-slate-400 hover:text-primary-600 disabled:opacity-50"
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
              </button>
            </div>
          </>
        )}

        {/* Step 3: Verify Old Phone OTP (Phone change) */}
        {step === 3 && (
          <>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6 text-amber-600" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Enter OTP sent to old phone (••••{currentUser?.phone?.slice(-4)})
              </p>
            </div>

            <Input
              label="Old Phone OTP"
              type="text"
              placeholder="123456"
              value={oldPhoneOTP}
              onChange={(e) => setOldPhoneOTP(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              maxLength={6}
              required
            />

            <Button
              type="button"
              variant="primary"
              className="w-full"
              onClick={handleVerifyOldOTP}
              isLoading={isLoading}
            >
              Verify & Send New OTP
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </>
        )}

        {/* Step 4: Verify New Phone OTP */}
        {step === 4 && (
          <>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Enter OTP sent to new phone {phone}
              </p>
            </div>

            <Input
              label="New Phone OTP"
              type="text"
              placeholder="123456"
              value={newPhoneOTP}
              onChange={(e) => setNewPhoneOTP(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              maxLength={6}
              required
            />

            <Button
              type="button"
              variant="primary"
              className="w-full"
              onClick={handleVerifyNewOTP}
              isLoading={isLoading}
            >
              Verify & Change Phone
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
}