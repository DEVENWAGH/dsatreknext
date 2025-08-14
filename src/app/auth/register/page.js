'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MagicCard } from '@/components/magicui/magic-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, ArrowLeft, X, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signIn, getCsrfToken } from 'next-auth/react';
import { toast } from 'sonner';
import Link from 'next/link';
import SplineModel from '@/components/SplineModel';
import { authAPI } from '@/api/api';

const formSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: 'First name must be at least 2 characters.' }),
  lastName: z
    .string()
    .min(2, { message: 'Last name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters.' })
    .max(20, { message: 'Username must be at most 20 characters.' })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: 'Username can only contain letters, numbers, and underscores.',
    }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
});

const otpSchema = z.object({
  otp: z.string().length(6, { message: 'OTP must be 6 digits.' }),
});

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      password: '',
    },
  });

  const {
    register: registerOTP,
    handleSubmit: handleSubmitOTP,
    formState: { errors: otpErrors },
  } = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    text: '',
    color: '',
  });
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [csrfToken, setCsrfToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Get CSRF token on component mount
    getCsrfToken().then(setCsrfToken);
  }, []);

  const checkPasswordStrength = password => {
    const criteria = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[^\w\s]/.test(password),
    };

    const score = Object.values(criteria).filter(Boolean).length;

    const strength = {
      0: { text: 'Very Weak', color: 'bg-red-500' },
      1: { text: 'Weak', color: 'bg-red-400' },
      2: { text: 'Fair', color: 'bg-yellow-500' },
      3: { text: 'Good', color: 'bg-blue-500' },
      4: { text: 'Strong', color: 'bg-green-500' },
      5: { text: 'Very Strong', color: 'bg-green-600' },
    };

    return { score, criteria, ...strength[score] };
  };

  const onSubmit = async values => {
    setIsSigningUp(true);
    try {
      const response = await authAPI.sendSignupOTP(values);
      if (response.success) {
        setUserEmail(values.email);
        setShowOTPForm(true);
        toast.success('Verification OTP sent to your email');
      } else {
        toast.error(response.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setIsSigningUp(false);
    }
  };

  const onVerifyOTP = async values => {
    setIsVerifying(true);
    try {
      const response = await authAPI.verifySignupOTP({
        email: userEmail,
        otp: values.otp,
      });

      if (response.success) {
        toast.success('Account created successfully!');
        // Auto-login after successful registration
        const loginResult = await signIn('credentials', {
          email: userEmail,
          password: getValues('password'),
          redirect: false,
        });

        if (loginResult?.ok) {
          const params = new URLSearchParams(window.location.search);
          const callbackUrl = params.get('callbackUrl');
          if (callbackUrl) {
            window.location.href = callbackUrl;
          } else {
            router.push('/');
            router.refresh();
          }
        } else {
          router.push('/auth/login');
        }
      } else {
        toast.error(response.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error(error.message || 'OTP verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-6xl w-full flex items-center justify-between gap-8">
        <div className="w-full max-w-md">
          <MagicCard className="p-8 bg-background/95 backdrop-blur-sm border border-border/50">
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Create Account</h1>
                <p className="text-muted-foreground">
                  Start your coding journey with DSATrek
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {!showOTPForm ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="First name"
                          {...register('firstName')}
                          className={
                            errors.firstName ? 'border-destructive' : ''
                          }
                        />
                        {errors.firstName && (
                          <p className="text-sm text-destructive">
                            {errors.firstName.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Last name"
                          {...register('lastName')}
                          className={
                            errors.lastName ? 'border-destructive' : ''
                          }
                        />
                        {errors.lastName && (
                          <p className="text-sm text-destructive">
                            {errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        {...register('email')}
                        className={errors.email ? 'border-destructive' : ''}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Choose a username"
                        {...register('username')}
                        onChange={e => {
                          const value = e.target.value.replace(
                            /[^a-zA-Z0-9_]/g,
                            ''
                          );
                          e.target.value = value.slice(0, 20);
                          register('username').onChange(e);
                        }}
                        className={errors.username ? 'border-destructive' : ''}
                      />
                      <p className="text-xs text-muted-foreground">
                        Only letters, numbers, and underscores (3-20 characters)
                      </p>
                      {errors.username && (
                        <p className="text-sm text-destructive">
                          {errors.username.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          {...register('password', {
                            onChange: e =>
                              setPasswordStrength(
                                checkPasswordStrength(e.target.value)
                              ),
                          })}
                          className={
                            errors.password
                              ? 'border-destructive pr-10'
                              : 'pr-10'
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      {/* Password Strength Indicator */}
                      <div className="space-y-2">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded transition-all duration-300 ${
                                i < passwordStrength.score
                                  ? passwordStrength.color
                                  : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        {passwordStrength.text && (
                          <p
                            className={`text-xs transition-all duration-300 ${
                              passwordStrength.score >= 3
                                ? 'text-green-600'
                                : passwordStrength.score >= 2
                                  ? 'text-yellow-600'
                                  : 'text-red-600'
                            }`}
                          >
                            Password strength: {passwordStrength.text}
                          </p>
                        )}
                      </div>

                      {errors.password && (
                        <p className="text-sm text-destructive">
                          {errors.password.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSigningUp}
                    >
                      {isSigningUp
                        ? 'Sending OTP...'
                        : 'Send Verification Code'}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="text-center space-y-2">
                      <h2 className="text-xl font-semibold">
                        Verify Your Email
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        We sent a 6-digit code to <strong>{userEmail}</strong>
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="otp">Verification Code</Label>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        {...registerOTP('otp')}
                        className={
                          otpErrors.otp
                            ? 'border-destructive text-center text-lg tracking-widest'
                            : 'text-center text-lg tracking-widest'
                        }
                      />
                      {otpErrors.otp && (
                        <p className="text-sm text-destructive">
                          {otpErrors.otp.message}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowOTPForm(false)}
                      >
                        Back
                      </Button>
                      <Button
                        type="button"
                        className="flex-1"
                        disabled={isVerifying}
                        onClick={handleSubmitOTP(onVerifyOTP)}
                      >
                        {isVerifying
                          ? 'Verifying...'
                          : 'Verify & Create Account'}
                      </Button>
                    </div>
                  </>
                )}
              </form>

              {/* Footer */}
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link
                    href="/auth/login"
                    className="text-primary hover:underline"
                  >
                    Sign in
                  </Link>
                </p>

                <Link
                  href="/"
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </div>
            </div>
          </MagicCard>
        </div>

        <div className="hidden lg:flex flex-1 justify-center items-center">
          <SplineModel />
        </div>
      </div>
    </div>
  );
}
