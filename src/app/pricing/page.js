'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { useAuthStore } from '@/store/authStore';
import {
  Check,
  Crown,
  Star,
  Zap,
  Users,
  BookOpen,
  Bot,
  HeadphonesIcon,
  BarChart3,
  Infinity as InfinityIcon,
  Shield,
  CreditCard,
  Loader2,
  Truck,
  Package,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Link from 'next/link';

const PricingPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { getUserSubscription, createOrder, verifyPayment } =
    useSubscriptionStore();
  const { isAuthenticated, authUser, checkAuth } = useAuthStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState(null);

  useEffect(() => {
    // Check auth status on component mount
    const initAuth = async () => {
      await checkAuth();
    };
    initAuth();
  }, [checkAuth]);

  // Sync NextAuth session with Zustand store
  useEffect(() => {
    if (status === 'authenticated' && session?.user && !authUser) {
      // Update Zustand store with NextAuth session
      useAuthStore.getState().updateUserData(session.user);
    }
  }, [session, status, authUser]);

  useEffect(() => {
    const isUserAuthenticated = isAuthenticated() || !!session?.user;
    if (isUserAuthenticated) {
      getUserSubscription().then(sub => {
        setCurrentSubscription(sub);
      });
    }
  }, [isAuthenticated, getUserSubscription, authUser, session]);

  const pricingPlans = [
    {
      id: 'freemium',
      name: 'Freemium',
      description: 'Perfect for beginners starting their coding journey',
      price: '0',
      currency: '₹',
      period: 'Forever Free',
      badge: 'Free',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      buttonText: 'Get Started Free',
      buttonVariant: 'outline',
      isPopular: false,
      gradient: 'from-emerald-500/20 via-green-500/10 to-emerald-600/20',
      borderGradient: 'border-emerald-500/30',
      icon: <Users className="w-6 h-6 text-emerald-400" />,
      features: [
        {
          text: 'Access to 50+ basic problems',
          icon: <BookOpen className="w-4 h-4 text-emerald-400" />,
        },
        {
          text: '5 submissions per day',
          icon: <BarChart3 className="w-4 h-4 text-emerald-400" />,
        },
        {
          text: 'Basic code editor',
          icon: <Bot className="w-4 h-4 text-emerald-400" />,
        },
        {
          text: 'Community support',
          icon: <Users className="w-4 h-4 text-emerald-400" />,
        },
        {
          text: 'View solutions after solving',
          icon: <Check className="w-4 h-4 text-emerald-400" />,
        },
      ],
      limitations: [
        {
          text: 'Limited problem access',
          icon: <Users className="w-4 h-4 text-red-400" />,
        },
        {
          text: 'Daily submission limits',
          icon: <BarChart3 className="w-4 h-4 text-red-400" />,
        },
        {
          text: 'No premium features',
          icon: <Bot className="w-4 h-4 text-red-400" />,
        },
        {
          text: 'No priority support',
          icon: <HeadphonesIcon className="w-4 h-4 text-red-400" />,
        },
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'For serious coders and job seekers aiming to excel',
      price: '1,999',
      currency: '₹',
      period: '/month',
      badge: 'Most Popular',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      buttonText:
        currentSubscription?.planId === 'pro'
          ? 'Current Plan'
          : 'Subscribe to Pro',
      buttonVariant: 'default',
      isPopular: true,
      gradient: 'from-amber-500/20 via-yellow-500/10 to-amber-600/20',
      borderGradient: 'border-amber-500/50',
      icon: <Zap className="w-6 h-6 text-amber-400" />,
      features: [
        {
          text: 'Access to 500+ problems',
          icon: <BookOpen className="w-4 h-4 text-amber-400" />,
        },
        {
          text: '50 submissions per day',
          icon: <BarChart3 className="w-4 h-4 text-amber-400" />,
        },
        {
          text: 'Advanced code editor',
          icon: <Bot className="w-4 h-4 text-amber-400" />,
        },
        {
          text: 'Interview preparation kit',
          icon: <Star className="w-4 h-4 text-amber-400" />,
        },
        {
          text: 'Solution explanations',
          icon: <BookOpen className="w-4 h-4 text-amber-400" />,
        },
        {
          text: 'Progress tracking',
          icon: <BarChart3 className="w-4 h-4 text-amber-400" />,
        },
        {
          text: 'Priority support',
          icon: <HeadphonesIcon className="w-4 h-4 text-amber-400" />,
        },
        {
          text: 'Mock interviews (5/month)',
          icon: <Users className="w-4 h-4 text-amber-400" />,
        },
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'For the elite coders and tech enthusiasts',
      price: '4,999',
      currency: '₹',
      period: '/month',
      badge: 'Best Value',
      badgeColor: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      buttonText:
        currentSubscription?.planId === 'premium'
          ? 'Current Plan'
          : 'Subscribe to Premium',
      buttonVariant: 'default',
      isPopular: false,
      gradient: 'from-yellow-500/20 via-amber-500/10 to-yellow-600/20',
      borderGradient: 'border-yellow-500/50',
      icon: <Crown className="w-6 h-6 text-yellow-400" />,
      features: [
        {
          text: 'Access to ALL 1500+ problems',
          icon: <InfinityIcon className="w-4 h-4 text-yellow-400" />,
        },
        {
          text: 'Unlimited submissions',
          icon: <BarChart3 className="w-4 h-4 text-yellow-400" />,
        },
        {
          text: 'Premium code editor with AI hints',
          icon: <Bot className="w-4 h-4 text-yellow-400" />,
        },
        {
          text: 'Complete interview preparation',
          icon: <Star className="w-4 h-4 text-yellow-400" />,
        },
        {
          text: 'Detailed solution explanations',
          icon: <BookOpen className="w-4 h-4 text-yellow-400" />,
        },
        {
          text: 'Advanced analytics & insights',
          icon: <BarChart3 className="w-4 h-4 text-yellow-400" />,
        },
        {
          text: '1-on-1 mentorship sessions',
          icon: <Users className="w-4 h-4 text-yellow-400" />,
        },
        {
          text: 'Unlimited mock interviews',
          icon: <Users className="w-4 h-4 text-yellow-400" />,
        },
        {
          text: 'Custom study plans',
          icon: <Star className="w-4 h-4 text-yellow-400" />,
        },
        {
          text: 'Priority support 24/7',
          icon: <HeadphonesIcon className="w-4 h-4 text-yellow-400" />,
        },
      ],
    },
  ];

  const handleRazorpayPayment = (orderData, plan) => {
    return new Promise((resolve, reject) => {
      const options = {
        key: orderData.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'DSATrek',
        description: `${plan.name} Subscription`,
        order_id: orderData.order.id,
        handler: async response => {
          try {
            // Verify payment on server
            const verificationResult = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: plan.id,
            });

            resolve({
              paymentResponse: response,
              verificationResult,
            });
          } catch (error) {
            console.error('Payment verification failed:', error);
            reject(
              error instanceof Error
                ? error
                : new Error('Payment verification failed')
            );
          }
        },
        prefill: {
          name: authUser?.name || session?.user?.name || '',
          email: authUser?.email || session?.user?.email || '',
        },
        notes: {
          planId: plan.id,
          planName: plan.name,
        },
        theme: {
          color: '#f59e0b',
        },
        modal: {
          ondismiss: () => {
            reject(new Error('Payment cancelled by user'));
          },
          escape: false,
          confirm_close: true,
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    });
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error('Failed to load Razorpay'));
      document.body.appendChild(script);
    });
  };

  const handlePayment = async plan => {
    // Check both Zustand store and NextAuth session for authentication
    const isUserAuthenticated = isAuthenticated() || !!session?.user;

    if (!isUserAuthenticated) {
      toast.error('Please login to continue with payment');
      const callbackUrl = encodeURIComponent(window.location.href);
      router.push(`/auth/login?callbackUrl=${callbackUrl}`);
      return;
    }

    // Prevent premium users from downgrading to pro
    if (currentSubscription?.planId === 'premium' && plan.id === 'pro') {
      toast.info(
        'You are already on the Premium plan. Downgrading to Pro is not allowed.'
      );
      return;
    }

    // Allow freemium users to "upgrade" by showing pricing options
    if (plan.id === 'freemium') {
      // Only show this message if user is actually on freemium plan
      if (!currentSubscription || currentSubscription.planId === 'freemium') {
        toast.info(
          "You're currently on the free plan. Choose a paid plan to upgrade!"
        );
      } else {
        toast.info(
          `You're already subscribed to the ${currentSubscription.planId} plan!`
        );
      }
      return;
    }

    if (currentSubscription?.planId === plan.id) {
      toast.info(`You're already on the ${plan.name} plan!`);
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Create order first
      toast.loading('Creating payment order...', { id: 'payment-process' });
      const orderData = await createOrder(plan.id);

      if (!orderData?.order) {
        throw new Error('Failed to create payment order');
      }

      // Step 2: Load Razorpay script
      toast.loading('Loading payment gateway...', { id: 'payment-process' });
      await loadRazorpayScript();

      // Step 3: Open Razorpay and handle payment
      toast.loading('Opening payment gateway...', { id: 'payment-process' });
      await handleRazorpayPayment(orderData, plan);

      // Step 4: If we reach here, payment was successful and verified
      toast.success(`Successfully subscribed to ${plan.name} plan!`, {
        id: 'payment-process',
      });

      // Step 5: Refresh subscription data
      const updatedSubscription = await getUserSubscription();
      setCurrentSubscription(updatedSubscription);
    } catch (error) {
      console.error('Subscription error:', error);

      if (error.message === 'Payment cancelled by user') {
        toast.info('Payment cancelled', { id: 'payment-process' });
      } else if (error.message === 'Failed to load Razorpay SDK') {
        toast.error(
          'Failed to load payment gateway. Please check your internet connection.',
          { id: 'payment-process' }
        );
      } else if (error.message === 'Payment verification failed') {
        toast.error(
          'Payment verification failed. Please contact support if amount was deducted.',
          { id: 'payment-process' }
        );
      } else {
        toast.error('Failed to process subscription. Please try again.', {
          id: 'payment-process',
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/20 py-16">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/20 backdrop-blur-sm mb-6"
          >
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-sm font-medium">
              Premium Plans
            </span>
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
            Unlock Your Coding Potential
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Choose a plan that fits your goals. Get lifetime access to DSATrek
            resources with secure payments powered by{' '}
            <span className="text-amber-400 font-semibold">Razorpay</span>.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative ${plan.isPopular ? 'md:scale-105' : ''}`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <Badge
                    className={`${plan.badgeColor} px-3 py-1 border backdrop-blur-sm shadow-lg`}
                  >
                    <Star className="w-3 h-3 mr-1" />
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <Card
                className={`h-full transition-all duration-500 hover:shadow-2xl relative overflow-hidden backdrop-blur-sm shiny-border-glow ${
                  plan.isPopular
                    ? `shadow-lg bg-gradient-to-b ${plan.gradient} ${plan.borderGradient} shadow-amber-500/20`
                    : `bg-slate-900/50 border-slate-700/50 hover:${plan.borderGradient} hover:shadow-slate-500/10`
                } rounded-xl border-2`}
              >
                <CardHeader className="text-center pb-8 relative z-10">
                  <div className="flex items-center justify-center mb-4">
                    <div
                      className={`p-3 rounded-full ${plan.badgeColor} backdrop-blur-sm border`}
                    >
                      {plan.icon}
                    </div>
                  </div>

                  <CardTitle className="text-2xl font-bold mb-2 text-white">
                    {plan.name}
                  </CardTitle>
                  <p className="text-slate-400 text-sm mb-6">
                    {plan.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-3xl font-bold text-amber-400">
                        {plan.currency}
                      </span>
                      <span className="text-5xl font-bold text-white">
                        {plan.price}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">{plan.period}</p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 relative z-10">
                  <Button
                    onClick={() => handlePayment(plan)}
                    disabled={
                      currentSubscription?.planId === plan.id || isProcessing
                    }
                    className={`w-full py-3 text-base font-semibold transition-all duration-300 ${(() => {
                      if (currentSubscription?.planId === plan.id) {
                        return 'bg-slate-700 text-slate-400 cursor-not-allowed';
                      }
                      if (plan.isPopular) {
                        return 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white shadow-lg hover:shadow-amber-500/25';
                      }
                      if (plan.id === 'premium') {
                        return 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white shadow-lg hover:shadow-yellow-500/25';
                      }
                      return 'bg-slate-700 hover:bg-slate-600 text-white';
                    })()}`}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {currentSubscription?.planId !== plan.id &&
                          plan.id !== 'freemium' && (
                            <CreditCard className="w-4 h-4 mr-2" />
                          )}
                        {plan.buttonText}
                      </>
                    )}
                  </Button>

                  {plan.id !== 'freemium' && (
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                      <Shield className="w-4 h-4 text-amber-400" />
                      <span>Secure payment by Razorpay</span>
                    </div>
                  )}

                  {plan.id !== 'freemium' && (
                    <div className="text-center text-sm text-slate-400">
                      Monthly subscription
                    </div>
                  )}

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">
                      Features:
                    </h4>
                    {plan.features.map(feature => (
                      <motion.div
                        key={`${plan.id}-${feature.text}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: index * 0.1 + feature.text.length * 0.01,
                        }}
                        className="flex items-start gap-3"
                      >
                        {feature.icon}
                        <span className="text-sm leading-relaxed text-slate-300">
                          {feature.text}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {plan.limitations && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white">
                        Limitations:
                      </h4>
                      {plan.limitations.map(limitation => (
                        <motion.div
                          key={`${plan.id}-limitation-${limitation.text}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: index * 0.1 + limitation.text.length * 0.01,
                          }}
                          className="flex items-start gap-3"
                        >
                          {limitation.icon}
                          <span className="text-sm leading-relaxed text-slate-300">
                            {limitation.text}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Trust and Security Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-16 max-w-4xl mx-auto"
        >
          <Card className="bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-600/10 border border-amber-500/20 backdrop-blur-sm">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4 text-white">
                Why Choose DSATrek?
              </h3>
              <div className="grid md:grid-cols-3 gap-6 text-left mb-8">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 text-white">
                      Instant Digital Delivery
                    </h4>
                    <p className="text-sm text-slate-400">
                      All services activated immediately upon payment.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-amber-500/10 border border-amber-500/20">
                    <Bot className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 text-white">
                      AI-Powered Learning
                    </h4>
                    <p className="text-sm text-slate-400">
                      Personalized paths and AI discussion support.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                    <Shield className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 text-white">
                      Secure Payments
                    </h4>
                    <p className="text-sm text-slate-400">
                      Bank-grade security with Razorpay integration.
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipping & Delivery Information */}
              <div className="border-t border-amber-500/20 pt-6">
                <h4 className="text-lg font-semibold mb-4 text-white flex items-center justify-center gap-2">
                  <Package className="w-5 h-5 text-amber-400" />
                  Delivery & Shipping Information
                </h4>
                <p className="text-sm text-slate-400 mb-4">
                  Learn more about our service delivery and shipping policies
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                  >
                    <Link href="/shipping/digital">
                      <Package className="w-4 h-4 mr-2" />
                      Digital Services Policy
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                  >
                    <Link href="/shipping/physical">
                      <Truck className="w-4 h-4 mr-2" />
                      Physical Products Policy
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                  >
                    <Link href="/shipping">
                      <Shield className="w-4 h-4 mr-2" />
                      All Shipping Policies
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default PricingPage;
