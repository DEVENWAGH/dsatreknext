'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Package, Clock, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const DigitalShippingPolicy = () => {
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
              Digital Services Delivery Policy
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Understanding how your digital subscriptions and services are
              delivered instantly on DSATrek
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Last updated: August 2, 2025</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-8"
        >
          {/* Digital Shipping Policy Section */}
          <section className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-xl p-8">
            <div className="flex items-center mb-6">
              <div className="p-2 rounded-full bg-blue-500/10 border border-blue-500/20 mr-4">
                <Package className="w-6 h-6 text-blue-500" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">
                📦 Digital Services Delivery
              </h2>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Since DSATrek is a digital service platform offering DSA
                practice, AI tools, premium subscriptions, and educational
                content, no physical shipping is involved. All services are
                delivered digitally and instantly.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Instant Service Activation:
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-muted-foreground">
                    Access to digital products (subscriptions, premium content,
                    AI tools) will be activated
                    <strong className="text-foreground">
                      {' '}
                      immediately upon successful payment confirmation
                    </strong>
                    .
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-muted-foreground">
                    Users will receive{' '}
                    <strong className="text-foreground">
                      instant confirmation via email
                    </strong>{' '}
                    and on-screen notification after payment.
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-muted-foreground">
                    Your premium features and subscription benefits are
                    accessible within
                    <strong className="text-foreground">
                      {' '}
                      seconds of payment processing
                    </strong>
                    .
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-muted-foreground">
                    In case of any delays or technical issues, users can contact
                    our support team at{' '}
                    <a
                      href="mailto:wagh@dsatrek.com"
                      className="text-primary hover:underline font-medium"
                    >
                      wagh@dsatrek.com
                    </a>{' '}
                    <strong className="text-foreground">within 24 hours</strong>
                    , and our team will investigate and assist you.
                  </span>
                </li>
              </ul>
            </div>

            {/* Service Types */}
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  Instant Access Services
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Premium problem sets and solutions</li>
                  <li>• AI-powered code review and hints</li>
                  <li>• Advanced analytics and progress tracking</li>
                  <li>• Mock interview simulations</li>
                  <li>• Priority customer support</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-500" />
                  Email Notifications
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Payment confirmation receipt</li>
                  <li>• Account upgrade notification</li>
                  <li>• Service activation confirmation</li>
                  <li>• Access credentials and instructions</li>
                  <li>• Welcome guide and getting started tips</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Cancellation and Refunds Section */}
          <section className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-xl p-8">
            <div className="flex items-center mb-6">
              <div className="p-2 rounded-full bg-red-500/10 border border-red-500/20 mr-4">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">
                ❌ Cancellations and Refunds Policy
              </h2>
            </div>

            <div className="space-y-6">
              {/* Cancellations */}
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  Cancellation Policy:
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-muted-foreground">
                      Once a subscription is purchased and payment is processed,
                      <strong className="text-foreground">
                        {' '}
                        cancellation is not allowed
                      </strong>{' '}
                      as access is instantly granted and digital services are
                      immediately available.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-muted-foreground">
                      Please ensure you{' '}
                      <strong className="text-foreground">
                        carefully review your selected plan
                      </strong>{' '}
                      and pricing before completing the payment process.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-muted-foreground">
                      We recommend exploring our free tier features before
                      upgrading to understand the platform better.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Refunds */}
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  Refund Policy:
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-muted-foreground">
                      DSATrek follows a{' '}
                      <strong className="text-foreground">
                        strict no-refund policy
                      </strong>{' '}
                      for all subscriptions and digital services due to the
                      instant nature of digital delivery.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-muted-foreground">
                      <strong className="text-foreground">Exception:</strong> If
                      you were wrongly charged, experienced technical issues
                      during payment, or encountered unauthorized transactions,
                      please reach out to{' '}
                      <a
                        href="mailto:wagh@dsatrek.com"
                        className="text-primary hover:underline font-medium"
                      >
                        wagh@dsatrek.com
                      </a>{' '}
                      <strong className="text-foreground">
                        within 24 hours
                      </strong>
                      , and our team will investigate and assist you.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-muted-foreground">
                      For technical support or account issues unrelated to
                      billing, our support team is available to help resolve any
                      problems you may encounter.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="bg-gradient-to-r from-primary/5 to-accent/5 border border-border/40 rounded-xl p-8">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Need Help?
            </h3>
            <p className="text-muted-foreground mb-4">
              If you have any questions about our digital services delivery
              policy or need assistance with your subscription, please
              don&apos;t hesitate to contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild>
                <a href="mailto:wagh@dsatrek.com">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Support
                </a>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/pricing">View Pricing Plans</Link>
              </Button>
            </div>
          </section>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/">Back to Home</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/shipping/physical">Physical Shipping Policy</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/pricing">Pricing Plans</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            All digital services are delivered instantly upon successful
            payment.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default DigitalShippingPolicy;
