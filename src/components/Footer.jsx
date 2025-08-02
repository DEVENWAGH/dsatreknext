'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import {
  Code2,
  Mail,
  ArrowUp,
  Sparkles,
  FileText,
  Globe,
  Phone,
  MapPin,
  Send,
} from 'lucide-react';
import Link from 'next/link';
import { useLogo } from '@/hooks/useLogo';
import { SocialDock } from '@/components/SocialDock';
import { FeedbackForm } from '@/components/ui/feedback-form';
import Image from 'next/image';
import ThemeToggleButton from '@/components/ui/theme-toggle-button';

const Footer = () => {
  const logoSrc = useLogo();

  const quickLinks = [
    {
      name: 'Problems',
      href: '/problems',
      icon: <Code2 className="w-4 h-4" />,
    },
    {
      name: 'Report an Issue',
      href: 'https://forms.gle/Jvta7unWR5Q4ZhQS6',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      name: 'Community',
      href: '/community',
      icon: <Globe className="w-4 h-4" />,
    },
  ];

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleMapClick = () => {
    const address = 'New Panvel East, Maharashtra, India 410206';
    const encodedAddress = encodeURIComponent(address);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(googleMapsUrl, '_blank');
  };

  return (
    <footer className="relative overflow-hidden border-t bg-gradient-to-br from-background/80 via-background to-accent/10 border-border/40 text-foreground">
      {/* Background Effects - Theme Aware */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      {/* Floating Elements - Theme Aware */}
      <div className="absolute rounded-full top-20 left-10 w-72 h-72 bg-primary/5 blur-3xl" />
      <div className="absolute rounded-full bottom-20 right-10 w-72 h-72 bg-accent/5 blur-3xl" />

      <div className="relative">
        {/* Main Footer Content */}
        <div className="px-4 py-16 mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5">
            {/* Brand Section - About DSATrek */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="space-y-6 lg:col-span-2"
            >
              <div className="flex items-center mb-6">
                <Image
                  src={logoSrc}
                  alt="D"
                  className="w-8 h-8"
                  width={32}
                  height={32}
                />
                <div>
                  <h3 className="text-2xl logo-text">SATrek</h3>
                </div>
              </div>
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                Master coding interviews with our comprehensive platform.
                Practice problems, take AI-powered mock interviews, and track
                your progress to success.
              </p>
            </motion.div>

            {/* Contact & Product Hunt */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="flex items-center gap-2 mb-6 text-lg font-semibold text-foreground">
                <Sparkles className="w-5 h-5 text-primary" />
                Contact
              </h4>

              {/* Product Hunt Badge */}
              <div className="mb-6">
                <a
                  href="https://www.producthunt.com/products/dsatrek?launch=dsatrek"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    alt="DSATrek - Master Data Structures & Algorithms | Product Hunt"
                    width="250"
                    height="54"
                    className="h-[40px] w-auto"
                    src="https://api.producthunt.com/widgets/embed-image/v1/product_review.svg?product_id=1069263&theme=light"
                  />
                </a>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4 text-primary" />
                  <a
                    href="mailto:wagh1.2.3.002@gmail.com"
                    className="hover:text-foreground transition-colors duration-200 hover:underline"
                  >
                    wagh1.2.3.002@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4 text-primary" />
                  <a
                    href="tel:+919326126931"
                    className="hover:text-foreground transition-colors duration-200 hover:underline"
                  >
                    +91 9326126931
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary" />
                  <button
                    onClick={handleMapClick}
                    className="hover:text-foreground transition-colors duration-200 hover:underline cursor-pointer text-left"
                  >
                    New Panvel East, Maharashtra, India 410206
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Feedback */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h4 className="flex items-center gap-2 mb-4 text-lg font-semibold text-foreground">
                <Mail className="w-5 h-5 text-primary" />
                Feedback
              </h4>
              <div className="mb-4">
                <FeedbackForm />
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Help us improve by sharing your thoughts and suggestions.
              </p>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h4 className="flex items-center gap-2 mb-6 text-lg font-semibold text-foreground">
                <Sparkles className="w-5 h-5 text-primary" />
                Quick Links
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <motion.li
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Link
                      href={link.href}
                      className="flex items-center gap-3 transition-colors duration-200 text-muted-foreground hover:text-foreground group"
                    >
                      <span className="transition-colors text-primary group-hover:text-primary/80">
                        {link.icon}
                      </span>
                      <span className="transition-transform duration-200 group-hover:translate-x-1">
                        {link.name}
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/40 bg-black text-white">
          <div className="px-4 mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row items-center justify-between py-2">
              <div className="flex items-center gap-2 text-sm">
                <span>© 2025 DSATrek. All rights reserved.</span>
              </div>

              <div className="flex items-center justify-center my-4 md:my-0 order-first md:order-none">
                <SocialDock />
              </div>

              <div className="flex items-center gap-4">
                <Link
                  href="/privacy"
                  className="text-sm transition-colors hover:text-gray-300"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="text-sm transition-colors hover:text-gray-300"
                >
                  Terms of Service
                </Link>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={scrollToTop}
                  className="text-white hover:text-gray-300 hover:bg-transparent"
                >
                  <ArrowUp className="w-4 h-4 mr-2" />
                  Back to top
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
