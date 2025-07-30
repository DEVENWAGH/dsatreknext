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

const formSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: 'First name must be at least 2 characters.' }),
  lastName: z
    .string()
    .min(2, { message: 'Last name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
});

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '' });
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [csrfToken, setCsrfToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Get CSRF token on component mount
    getCsrfToken().then(setCsrfToken);
  }, []);

  const checkPasswordStrength = (password) => {
    const criteria = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[^\w\s]/.test(password)
    };
    
    const score = Object.values(criteria).filter(Boolean).length;

    const strength = {
      0: { text: 'Very Weak', color: 'bg-red-500' },
      1: { text: 'Weak', color: 'bg-red-400' },
      2: { text: 'Fair', color: 'bg-yellow-500' },
      3: { text: 'Good', color: 'bg-blue-500' },
      4: { text: 'Strong', color: 'bg-green-500' },
      5: { text: 'Very Strong', color: 'bg-green-600' }
    };

    return { score, criteria, ...strength[score] };
  };

  const onSubmit = async values => {
    setIsSigningUp(true);
    try {
      // First register with NextAuth credentials provider
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        username: values.username || values.email.split('@')[0],
        isSignup: 'true',
        redirect: false,
        csrfToken,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      toast.success('Account created successfully!');
      // Redirect to callbackUrl if present, else home
      const params = new URLSearchParams(window.location.search);
      const callbackUrl = params.get('callbackUrl');
      if (callbackUrl) {
        window.location.href = callbackUrl;
      } else {
        router.push('/');
        router.refresh(); // Refresh to update auth state
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsSigningUp(false);
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="First name"
                      {...register('firstName')}
                      className={errors.firstName ? 'border-destructive' : ''}
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
                      className={errors.lastName ? 'border-destructive' : ''}
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
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      {...register('password', {
                        onChange: (e) => setPasswordStrength(checkPasswordStrength(e.target.value))
                      })}
                      className={
                        errors.password ? 'border-destructive pr-10' : 'pr-10'
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
                            i < passwordStrength.score ? passwordStrength.color : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    {passwordStrength.text && (
                      <p className={`text-xs transition-all duration-300 ${
                        passwordStrength.score >= 3 ? 'text-green-600' : 
                        passwordStrength.score >= 2 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        Password strength: {passwordStrength.text}
                      </p>
                    )}
                    
                    {/* Password Criteria */}
                    {passwordStrength.criteria && (
                      <div className="space-y-1 text-xs">
                        <div className={`flex items-center gap-2 transition-colors duration-300 ${
                          passwordStrength.criteria.length ? 'text-green-600' : 'text-red-500'
                        }`}>
                          {passwordStrength.criteria.length ? 
                            <Check className="h-3 w-3" /> : 
                            <X className="h-3 w-3" />
                          }
                          <span>At least 8 characters</span>
                        </div>
                        <div className={`flex items-center gap-2 transition-colors duration-300 ${
                          passwordStrength.criteria.lowercase ? 'text-green-600' : 'text-red-500'
                        }`}>
                          {passwordStrength.criteria.lowercase ? 
                            <Check className="h-3 w-3" /> : 
                            <X className="h-3 w-3" />
                          }
                          <span>One lowercase letter</span>
                        </div>
                        <div className={`flex items-center gap-2 transition-colors duration-300 ${
                          passwordStrength.criteria.uppercase ? 'text-green-600' : 'text-red-500'
                        }`}>
                          {passwordStrength.criteria.uppercase ? 
                            <Check className="h-3 w-3" /> : 
                            <X className="h-3 w-3" />
                          }
                          <span>One uppercase letter</span>
                        </div>
                        <div className={`flex items-center gap-2 transition-colors duration-300 ${
                          passwordStrength.criteria.number ? 'text-green-600' : 'text-red-500'
                        }`}>
                          {passwordStrength.criteria.number ? 
                            <Check className="h-3 w-3" /> : 
                            <X className="h-3 w-3" />
                          }
                          <span>One number</span>
                        </div>
                        <div className={`flex items-center gap-2 transition-colors duration-300 ${
                          passwordStrength.criteria.special ? 'text-green-600' : 'text-red-500'
                        }`}>
                          {passwordStrength.criteria.special ? 
                            <Check className="h-3 w-3" /> : 
                            <X className="h-3 w-3" />
                          }
                          <span>One special character</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>



                <Button type="submit" className="w-full" disabled={isSigningUp}>
                  {isSigningUp ? 'Creating account...' : 'Create Account'}
                </Button>
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
