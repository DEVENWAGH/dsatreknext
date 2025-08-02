'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Package, Truck, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

const ShippingPolicyHub = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border/40">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative max-w-4xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
                <Package className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Shipping & Delivery Policies
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the policy that applies to your DSATrek services and
              products
            </p>
          </motion.div>
        </div>
      </div>

      {/* Policy Cards */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Digital Services Policy */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300">
              <CardHeader className="text-center pb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-full bg-blue-500/10 border border-blue-500/20">
                    <Package className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">
                  📦 Digital Services Policy
                </CardTitle>
                <p className="text-muted-foreground">
                  For subscriptions, premium features, and digital content
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-semibold text-blue-800 dark:text-blue-200">
                      Currently Active
                    </span>
                  </div>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    All DSATrek services are delivered digitally and instantly
                    upon payment.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">
                    What&apos;s Covered:
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Premium subscriptions (Pro & Premium plans)</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>AI-powered coding tools and features</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Access to premium problem sets</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Mock interviews and assessments</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center text-green-700 dark:text-green-300 text-sm">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span>
                      <strong>Instant Delivery:</strong> Services activated
                      immediately
                    </span>
                  </div>
                </div>

                <Button asChild className="w-full" size="lg">
                  <Link href="/shipping/digital">
                    View Digital Policy
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Physical Products Policy */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="h-full bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800 hover:shadow-lg transition-all duration-300">
              <CardHeader className="text-center pb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-full bg-amber-500/10 border border-amber-500/20">
                    <Truck className="w-8 h-8 text-amber-500" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">
                  🚚 Physical Products Policy
                </CardTitle>
                <p className="text-muted-foreground">
                  For future merchandise, swag, and physical items
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Package className="w-5 h-5 text-amber-600 mr-2" />
                    <span className="font-semibold text-amber-800 dark:text-amber-200">
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-amber-700 dark:text-amber-300 text-sm">
                    Physical merchandise is not currently available but may be
                    offered in the future.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">
                    Future Products:
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>DSATrek branded apparel & accessories</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Coding reference books & guides</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Algorithm posters & study materials</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Developer stickers & tech gadgets</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center text-blue-700 dark:text-blue-300 text-sm">
                    <Truck className="w-4 h-4 mr-2" />
                    <span>
                      <strong>Future Shipping:</strong> Domestic & international
                      delivery
                    </span>
                  </div>
                </div>

                <Button asChild className="w-full" variant="outline" size="lg">
                  <Link href="/shipping/physical">
                    View Physical Policy
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Current Focus Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border border-border/40">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                🎯 Our Current Focus
              </h3>
              <p className="text-lg text-muted-foreground mb-6 max-w-3xl mx-auto">
                DSATrek is currently a{' '}
                <strong className="text-foreground">
                  100% digital platform
                </strong>
                . All our services including premium subscriptions, AI tools,
                and educational content are delivered instantly through our web
                platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/pricing">
                    <Package className="w-4 h-4 mr-2" />
                    View Digital Plans
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/shipping/digital">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Digital Policy Details
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 text-center space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline">
              <Link href="/">Back to Home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/terms">Terms of Service</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/privacy">Privacy Policy</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Questions? Contact us at{' '}
            <a
              href="mailto:wagh1.2.3.002@gmail.com"
              className="text-primary hover:underline font-medium"
            >
              wagh1.2.3.002@gmail.com
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ShippingPolicyHub;
