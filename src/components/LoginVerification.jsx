'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { MagicCard } from '@/components/magicui/magic-card';

export default function LoginVerification({ email, onVerified, onBack }) {
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendOTP = async () => {
    setIsSending(true);
    try {
      const response = await fetch('/api/auth/send-login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setCountdown(60);
      } else {
        console.log('Send OTP failed:', data.message);
      }
    } catch (error) {
      console.log('Failed to send OTP:', error);
    } finally {
      setIsSending(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch('/api/auth/verify-login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (data.success) {
        onVerified();
      } else {
        toast.error(data.message || 'Invalid OTP');
      }
    } catch (error) {
      console.log('Verification failed:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  // Auto-send OTP when component mounts
  useEffect(() => {
    sendOTP();
  }, []);

  return (
    <MagicCard
      className="w-full max-w-sm p-6 md:p-8 shadow-2xl border border-border rounded-2xl"
      gradientSize={300}
      gradientColor="#f5ac01"
      gradientOpacity={0.1}
      gradientFrom="#f5ac01"
      gradientTo="#f5b210"
    >
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">
          Verify Your Email
        </h1>
        <p className="text-muted-foreground text-sm">
          We've sent a verification code to
        </p>
        <p className="text-primary font-medium text-sm">{email}</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="otp" className="text-sm font-medium">
            Enter 6-digit OTP
          </Label>
          <Input
            id="otp"
            type="text"
            placeholder="000000"
            value={otp}
            onChange={e =>
              setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
            }
            className="h-10 text-center text-lg tracking-widest"
            maxLength={6}
          />
        </div>

        <Button
          onClick={verifyOTP}
          className="w-full h-10"
          disabled={isVerifying || otp.length !== 6}
        >
          {isVerifying ? 'Verifying...' : 'Verify & Login'}
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Didn't receive the code?
          </p>
          <Button
            variant="ghost"
            onClick={sendOTP}
            disabled={isSending || countdown > 0}
            className="text-sm"
          >
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
          </Button>
        </div>

        <Button variant="outline" onClick={onBack} className="w-full h-10">
          Back to Login
        </Button>
      </div>
    </MagicCard>
  );
}
