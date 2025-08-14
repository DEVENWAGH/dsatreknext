'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MagicCard } from '@/components/magicui/magic-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signIn, getCsrfToken, getSession, useSession } from 'next-auth/react';
import { toast } from 'sonner';
import Link from 'next/link';
import SplineModel from '@/components/SplineModel';
import LoginVerification from '@/components/LoginVerification';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z
    .string()
    .min(4, { message: 'Password must be at least 4 characters.' }),
});

export default function Login() {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [csrfToken, setCsrfToken] = useState(null);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    getCsrfToken().then(setCsrfToken);
  }, []);

  useEffect(() => {
    if (session?.user?.needsVerification) {
      setVerificationEmail(session.user.email);
      setShowVerification(true);
    }
  }, [session]);

  const onSubmit = async values => {
    setIsLoggingIn(true);
    try {
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        isSignup: 'false',
        redirect: false,
        csrfToken,
      });

      console.log('Login result:', result);

      if (result?.error) {
        console.log('Login failed:', result.error);
        toast.error('Invalid email or password');
        return;
      }

      if (result?.ok) {
        const session = await getSession();
        console.log('Session after login:', session?.user);

        if (session?.user?.needsVerification) {
          console.log('User needs verification, showing OTP screen');
          setVerificationEmail(values.email);
          setShowVerification(true);
        } else {
          console.log('User is verified, proceeding with redirect');
          toast.success('Login successful!');
          const params = new URLSearchParams(window.location.search);
          const callbackUrl = params.get('callbackUrl');
          if (callbackUrl) {
            window.location.href = callbackUrl;
          } else {
            router.push('/');
            router.refresh();
          }
        }
      }
    } catch (error) {
      toast.error('Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSocialLogin = async provider => {
    try {
      await signIn(provider, {
        callbackUrl: '/',
        csrfToken,
      });
    } catch (error) {
      console.error(`${provider} login error:`, error);
      toast.error(`${provider} login failed`);
    }
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password page when implemented
    router.push('/auth/forgot-password');
  };

  const handleVerificationComplete = async () => {
    setShowVerification(false);
    toast.success('Email verified successfully!');
    // Redirect to home page
    const params = new URLSearchParams(window.location.search);
    const callbackUrl = params.get('callbackUrl');
    if (callbackUrl) {
      window.location.href = callbackUrl;
    } else {
      router.push('/');
      router.refresh();
    }
  };

  const handleBackToLogin = () => {
    setShowVerification(false);
    setVerificationEmail('');
  };

  if (showVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-6xl w-full flex items-center justify-between gap-8">
          <LoginVerification
            email={verificationEmail}
            onVerified={handleVerificationComplete}
            onBack={handleBackToLogin}
          />
          <div className="hidden lg:flex flex-1 justify-center items-center">
            <SplineModel />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-6xl w-full flex items-center justify-between gap-8">
        <MagicCard
          className="w-full max-w-sm p-6 md:p-8 shadow-2xl border border-border rounded-2xl flex flex-col justify-center"
          gradientSize={300}
          gradientColor="#f5ac01"
          gradientOpacity={0.1}
          gradientFrom="#f5ac01"
          gradientTo="#f5b210"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
              Log In to DSATrek
            </h1>
            <p className="text-muted-foreground text-sm">
              Sign in to continue your coding journey.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                className="h-10 text-sm"
              />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  className="h-10 text-sm pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary focus:outline-none"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm text-primary hover:underline"
                onClick={handleForgotPassword}
              >
                Forgot Password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-10 text-sm"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? 'Logging in...' : 'Log In'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted-foreground/20"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or Login with
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-10 text-sm"
                onClick={() => handleSocialLogin('google')}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 text-sm"
                onClick={() => handleSocialLogin('github')}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center text-muted-foreground text-sm">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/register"
              className="text-primary hover:underline font-medium"
            >
              Sign Up
            </Link>
          </div>
        </MagicCard>

        <div className="hidden lg:flex flex-1 justify-center items-center">
          <SplineModel />
        </div>
      </div>
    </div>
  );
}
