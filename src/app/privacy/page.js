'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Shield, Clock, Eye, Lock, Database, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const PrivacyPolicy = () => {
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
                <Shield className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your privacy is important to us. This policy explains how we
              collect, use, and protect your information.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Last updated: July 7, 2025</span>
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
          className="prose prose-lg max-w-none"
        >
          <div className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-xl p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                <Eye className="w-6 h-6 text-primary" />
                1. Information We Collect
              </h2>

              <h3 className="text-xl font-medium text-foreground mb-3">
                Personal Information
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                When you create an account or use our services, we may collect:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-6">
                <li>Name and email address</li>
                <li>Profile information you choose to provide</li>
                <li>Authentication information (Google OAuth)</li>
                <li>Communication preferences</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">
                Usage Information
              </h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Problems you solve and your solutions</li>
                <li>Interview performance and analytics</li>
                <li>Progress tracking data</li>
                <li>Time spent on the platform</li>
                <li>Feature usage patterns</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                <Database className="w-6 h-6 text-primary" />
                2. How We Use Your Information
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Provide and maintain our services</li>
                <li>Personalize your learning experience</li>
                <li>Track your progress and provide analytics</li>
                <li>Send you important updates and notifications</li>
                <li>Improve our platform and develop new features</li>
                <li>Ensure security and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                <Users className="w-6 h-6 text-primary" />
                3. Information Sharing
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information to
                third parties. We may share your information only in the
                following circumstances:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>
                  <strong>With your consent:</strong> When you explicitly agree
                  to share information
                </li>
                <li>
                  <strong>Service providers:</strong> With trusted partners who
                  help us operate our platform
                </li>
                <li>
                  <strong>Legal requirements:</strong> When required by law or
                  to protect our rights
                </li>
                <li>
                  <strong>Business transfers:</strong> In case of merger,
                  acquisition, or sale of assets
                </li>
                <li>
                  <strong>Public information:</strong> Information you choose to
                  make public (profile, discussions)
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                <Lock className="w-6 h-6 text-primary" />
                4. Data Security
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We implement appropriate security measures to protect your
                personal information:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication via Google OAuth</li>
                <li>Regular security audits and monitoring</li>
                <li>Access controls and staff training</li>
                <li>Secure hosting infrastructure</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                5. Cookies and Tracking
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Keep you logged in to your account</li>
                <li>Remember your preferences and settings</li>
                <li>Analyze how you use our platform</li>
                <li>Provide personalized content</li>
                <li>Improve our services</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                You can control cookies through your browser settings, but this
                may affect the functionality of our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                6. Your Rights and Choices
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You have the following rights regarding your personal
                information:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>
                  <strong>Access:</strong> Request a copy of your personal data
                </li>
                <li>
                  <strong>Correction:</strong> Update or correct your
                  information
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your account
                  and data
                </li>
                <li>
                  <strong>Portability:</strong> Export your data in a standard
                  format
                </li>
                <li>
                  <strong>Objection:</strong> Object to certain processing
                  activities
                </li>
                <li>
                  <strong>Withdrawal:</strong> Withdraw consent where applicable
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                7. Data Retention
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your personal information for as long as necessary to
                provide our services and comply with legal obligations. When you
                delete your account, we will remove your personal information
                within 30 days, except where we are required to retain it for
                legal or regulatory purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                8. Children&apos;s Privacy
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Our service is not intended for children under 13 years of age.
                We do not knowingly collect personal information from children
                under 13. If you are a parent or guardian and believe your child
                has provided us with personal information, please contact us to
                have it removed.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                9. International Data Transfers
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Your information may be transferred to and processed in
                countries other than your own. We ensure that such transfers are
                conducted in accordance with applicable data protection laws and
                with appropriate safeguards in place.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                10. Changes to This Policy
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will
                notify you of any material changes by posting the new Privacy
                Policy on this page and updating the &quot;Last updated&quot;
                date. We encourage you to review this Privacy Policy
                periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                11. Contact Us
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our data
                practices, please contact us:
              </p>
              <div className="mt-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
                <p className="text-foreground font-medium">
                  DSATrek Privacy Team
                </p>
                <p className="text-muted-foreground">Email: wagh@dsatrek.com</p>
                <p className="text-muted-foreground">Phone: +91 9326126931</p>
                <p className="text-muted-foreground">
                  Address: 123 Dsa Street, Tech City
                </p>
              </div>
            </section>
          </div>
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
              <Link href="/terms">Terms of Service</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Your privacy matters to us. We&apos;re committed to protecting your
            data.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
