'use client';

import React from 'react';
import { motion } from 'motion/react';
import {
  Truck,
  Package,
  Clock,
  Mail,
  MapPin,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const PhysicalShippingPolicy = () => {
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
                <Truck className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Physical Shipping Policy
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Information about physical merchandise, swag, and any tangible
              products from DSATrek
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
          {/* Current Status Notice */}
          <section className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-8">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-full bg-amber-500/10 border border-amber-500/20 mr-4">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">
                📦 Physical Products Status
              </h2>
            </div>

            <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-lg p-6">
              <p className="text-amber-800 dark:text-amber-200 text-lg font-medium mb-3">
                Currently, DSATrek does not offer physical products or
                merchandise.
              </p>
              <p className="text-amber-700 dark:text-amber-300 leading-relaxed">
                We are a digital-first platform focused on providing online
                coding education, practice problems, AI-powered tools, and
                subscription services. All our offerings are delivered digitally
                through our platform.
              </p>
            </div>
          </section>

          {/* Future Physical Products Section */}
          <section className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-xl p-8">
            <div className="flex items-center mb-6">
              <div className="p-2 rounded-full bg-blue-500/10 border border-blue-500/20 mr-4">
                <Package className="w-6 h-6 text-blue-500" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">
                🚀 Future Physical Merchandise
              </h2>
            </div>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              While we currently focus on digital services, we may introduce
              physical merchandise in the future. If and when we do offer
              physical products, the following shipping policies will apply:
            </p>

            {/* Shipping Zones */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-500" />
                  Domestic Shipping (India)
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>
                      <strong>Delivery Time:</strong> 3-7 business days
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>
                      <strong>Shipping Cost:</strong> ₹50-150 based on location
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>
                      <strong>Free Shipping:</strong> On orders above ₹1000
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>
                      <strong>Tracking:</strong> Provided via SMS & Email
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-500" />
                  International Shipping
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>
                      <strong>Delivery Time:</strong> 7-21 business days
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>
                      <strong>Shipping Cost:</strong> $15-50 based on
                      destination
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>
                      <strong>Customs:</strong> Customer responsibility
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>
                      <strong>Tracking:</strong> International tracking
                      available
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Potential Products */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                🎁 Potential Future Products
              </h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <ul className="space-y-2">
                  <li>• DSATrek branded hoodies & t-shirts</li>
                  <li>• Coding reference books & guides</li>
                  <li>• Algorithm cheat sheet posters</li>
                  <li>• Developer sticker packs</li>
                </ul>
                <ul className="space-y-2">
                  <li>• Branded mugs & water bottles</li>
                  <li>• Laptop stickers & decals</li>
                  <li>• Notebook & coding journals</li>
                  <li>• Tech accessories & gadgets</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Return & Exchange Policy */}
          <section className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-xl p-8">
            <div className="flex items-center mb-6">
              <div className="p-2 rounded-full bg-orange-500/10 border border-orange-500/20 mr-4">
                <Package className="w-6 h-6 text-orange-500" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">
                🔄 Return & Exchange Policy
              </h2>
            </div>

            <p className="text-muted-foreground mb-6">
              When we introduce physical products, we will maintain
              customer-friendly return and exchange policies:
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  Returns
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 30-day return window from delivery</li>
                  <li>• Items must be unused and in original packaging</li>
                  <li>• Return shipping costs covered by DSATrek</li>
                  <li>• Full refund within 5-7 business days</li>
                  <li>• Easy return process through our portal</li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-500" />
                  Exchanges
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Size/color exchanges within 30 days</li>
                  <li>• Free exchange for defective items</li>
                  <li>• One-time free exchange per order</li>
                  <li>• Quick processing within 3-5 days</li>
                  <li>• Email notifications for all updates</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Damaged/Lost Packages */}
          <section className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8">
            <div className="flex items-center mb-6">
              <div className="p-2 rounded-full bg-red-500/10 border border-red-500/20 mr-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">
                📦 Damaged or Lost Packages
              </h2>
            </div>

            <div className="space-y-4">
              <p className="text-muted-foreground">
                We will take full responsibility for damaged or lost packages
                during shipping:
              </p>

              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">Damaged Items:</strong>{' '}
                    Report within 48 hours of delivery with photos for immediate
                    replacement or full refund.
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">Lost Packages:</strong>{' '}
                    We will investigate with shipping partners and provide
                    replacement or refund within 7 business days.
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">Insurance:</strong> All
                    packages will be insured for their full value during
                    transit.
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* Contact Section */}
          <section className="bg-gradient-to-r from-primary/5 to-accent/5 border border-border/40 rounded-xl p-8">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Questions About Physical Shipping?
            </h3>
            <p className="text-muted-foreground mb-4">
              While we don&apos;t currently offer physical products, if you have
              questions about our future shipping plans or want to be notified
              when merchandise becomes available, please contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild>
                <a href="mailto:wagh@dsatrek.com">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Support
                </a>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/shipping/digital">Digital Services Policy</Link>
              </Button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Stay Updated:</strong> Follow us on social media or
                subscribe to our newsletter to be the first to know when we
                launch physical merchandise!
              </p>
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
              <Link href="/shipping/digital">Digital Services Policy</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/pricing">Current Digital Plans</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Currently focused on digital services - physical products coming
            soon!
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default PhysicalShippingPolicy;
