'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'motion/react';
import { SmoothCursor } from '@/components/ui/smooth-cursor';
import Image from 'next/image';
import { Sparkles, Mic, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { GridBackground } from '@/components/ui/grid-background';
import ShinyText from '@/components/ui/shiny-text';
import GradientText from './GradientText';
import { useTheme } from '@/components/ui/theme-provider';
import CircularText from '@/components/CircularText';
import { MorphingText } from '@/components/magicui/morphing-text';
import { SparklesText } from '@/components/magicui/sparkles-text';
import { InteractiveHoverButton } from '@/components/magicui/interactive-hover-button';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';
import { VelocityScroll } from '@/components/magicui/scroll-based-velocity';
import { IconCloud } from '@/components/magicui/icon-cloud';
import SplineModel from '@/components/SplineModel';
import VerticalBinaryRain from './VerticalBinaryRain';
import ScrollStack, { ScrollStackItem } from './ui/ScrollStack';
import AnimatedStarButton from '@/components/ui/animated-star-button';
import { Bruno_Ace } from 'next/font/google';
import localFont from 'next/font/local';
const gilroyBold = localFont({
  src: '../fonts/Gilroy-Bold.ttf',
  variable: '--font-gilroy-bold',
  display: 'swap',
  weight: '700',
});
const brunoFont = Bruno_Ace({
  subsets: ['latin'],
  weight: '400',
});

const slugs = [
  'typescript',
  'javascript',
  'java',
  'python',
  'cplusplus',
  'go',
  'rust',
  'csharp',
  'c',
  'ruby',
  'typescript',
  'javascript',
  'java',
  'python',
  'cplusplus',
  'go',
  'rust',
  'csharp',
  'c',
  'ruby',
];

const images = slugs.map(
  slug =>
    `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${slug}/${slug}-original.svg`
);
const morphWords = ['Dominate', 'DSA', 'with', 'DSATrek'];

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const LandingPage = () => {
  const [showCursor, setShowCursor] = useState(false);
  const router = useRouter();
  const { authUser } = useAuthStore();
  const { theme } = useTheme();

  // Setup GSAP for header and cards sequence
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Force a small delay to ensure DOM is fully ready
    setTimeout(() => {
      // Find the header card (first ScrollStackItem)
      const headerCard = document.querySelector('.scroll-stack-card');
      if (headerCard) {
        // Add a class to identify it
        headerCard.classList.add('header-card');

        // Add custom styles to make it look less like a card
        gsap.set(headerCard, {
          height: 'auto',
          marginBottom: '60px',
          marginTop: '20px',
        });
      }
    }, 100);

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const companyLogos = [
    {
      name: 'Google',
      src: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
      width: 120,
      height: 40,
    },
    {
      name: 'Meta',
      src: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png',
      width: 100,
      height: 36,
    },
    {
      name: 'Microsoft',
      src: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
      width: 140,
      height: 32,
    },
    {
      name: 'Amazon',
      src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1024px-Amazon_logo.svg.png',
      width: 110,
      height: 36,
    },
    {
      name: 'Apple',
      src: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
      width: 40,
      height: 48,
    },
    {
      name: 'Netflix',
      src: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
      width: 130,
      height: 32,
    },
    {
      name: 'Accenture',
      src: 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg',
      width: 140,
      height: 38,
    },
    {
      name: 'Cisco',
      src: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Cisco_logo_blue_2016.svg',
      width: 120,
      height: 42,
    },
    {
      name: 'Spotify',
      src: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg',
      width: 48,
      height: 48,
    },
    {
      name: 'PayPal',
      src: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg',
      width: 120,
      height: 32,
    },
    {
      name: 'Oracle',
      src: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg',
      width: 110,
      height: 28,
    },
  ];

  return (
    <div className="relative w-full overflow-x-clip">
      {/* Vertical Binary Rain Animation */}
      <div className="hidden md:block">
        <VerticalBinaryRain />
      </div>
      {/* Smooth Cursor - only show in hero section on large screens */}
      {showCursor && (
        <div className="hidden lg:block">
          <SmoothCursor />
        </div>
      )}

      {/* Hero Section with Animated Grid */}
      <section
        className="relative w-full hero-section"
        onMouseEnter={() => setShowCursor(true)}
        onMouseLeave={() => setShowCursor(false)}
      >
        {/* CircularText in top-right */}
        <div className="absolute z-20 hidden top-8 right-8 lg:block">
          <CircularText
            text="Code → Learn → Excel → Conquer → "
            onHover="speedUp"
            spinDuration={20}
            className="custom-class"
          />
        </div>

        {/* Replace AnimatedGridBackground with GridBackground */}
        <GridBackground>
          {/* Hero Content */}
          <div className="relative z-10 flex items-center w-full px-4 mx-auto max-w-7xl">
            <div className="grid items-center lg:grid-cols-2">
              <div className="mt-6">
                {/* New Feature Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 px-4 py-2 border rounded-full border-blue-500/20 backdrop-blur-sm"
                >
                  <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
                  {theme === 'light' ? (
                    <GradientText
                      colors={[
                        '#40ffaa',
                        '#4079ff',
                        '#40ffaa',
                        '#4079ff',
                        '#40ffaa',
                      ]}
                      animationSpeed={3}
                      showBorder={false}
                      className="text-sm font-medium"
                    >
                      New: AI Interview Assistant
                    </GradientText>
                  ) : (
                    <ShinyText
                      text="New: AI Interview Assistant"
                      disabled={false}
                      speed={3}
                      className="text-sm font-medium"
                    />
                  )}
                  <Badge className="text-xs text-green-700 bg-green-500/20">
                    Live
                  </Badge>
                </motion.div>

                {/* New SparklesText with FlipText */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                  className="my-6"
                >
                  <SparklesText
                    colors={{ first: '#4079ff', second: '#40ffaa' }}
                    className={`text-5xl font-bold md:text-8xl ${gilroyBold.className}`}
                  >
                    TREK FROM BASICS TO BRILLIANCE
                  </SparklesText>
                </motion.div>

                {/* Main Headline */}
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {theme === 'light' ? (
                    <>
                      {/* Only text, no outer div, on <lg screens */}
                      <span className="block max-w-2xl text-xl leading-relaxed lg:hidden md:text-2xl">
                        Breathe in the wild air of DSA. Let every step take you
                        deeper into the rhythm of problem solving. Your next
                        adventure starts here with AI-powered interviews,
                        curated DSA challenges, and progress tracking to guide
                        your journey to success.
                      </span>
                      <span className="hidden lg:block">
                        <GradientText
                          colors={[
                            '#40ffaa',
                            '#4079ff',
                            '#40ffaa',
                            '#4079ff',
                            '#40ffaa',
                          ]}
                          animationSpeed={3}
                          showBorder={false}
                          className="max-w-2xl text-xl leading-relaxed md:text-2xl"
                        >
                          Breathe in the wild air of DSA. Let every step take
                          you deeper into the rhythm of problem solving. Your
                          next adventure starts here with AI-powered interviews,
                          curated DSA challenges, and progress tracking to guide
                          your journey to success.
                        </GradientText>
                      </span>
                    </>
                  ) : (
                    <ShinyText
                      text="Breathe in the wild air of DSA. Let every step
                          take you deeper into the rhythm of problem solving.
                          Your next adventure starts here with AI-powered interviews,
                          curated DSA challenges, and progress tracking to guide
                          your journey to success."
                      disabled={false}
                      speed={3}
                      className="max-w-2xl text-xl leading-relaxed md:text-2xl text-muted-foreground"
                    />
                  )}
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  className="flex flex-col gap-4 sm:flex-row  lg:gap-4 lg:max-w-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  {!authUser ? (
                    <>
                      {/* Show ShinyButton on md and below, InteractiveHoverButton on lg+ */}
                      <span className="lg:hidden">
                        <button
                          className="relative inline-block p-px text-xs font-semibold leading-6 text-white no-underline rounded-full shadow-2xl cursor-pointer bg-slate-800 group shadow-zinc-900"
                          onClick={() => router.push('/auth/register')}
                        >
                          <span className="absolute inset-0 overflow-hidden rounded-full">
                            <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                          </span>
                          <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10 ">
                            Start Your Journey
                            <svg
                              fill="none"
                              height="16"
                              viewBox="0 0 24 24"
                              width="16"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M10.75 8.75L14.25 12L10.75 15.25"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                              />
                            </svg>
                          </div>
                          <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
                        </button>
                      </span>
                      <div className="hidden lg:block lg:h-12">
                        <InteractiveHoverButton
                          onClick={() => router.push('/auth/register')}
                          className="h-full"
                        >
                          <span className="flex items-center justify-center gap-2 h-full">
                            Start Your Journey
                          </span>
                        </InteractiveHoverButton>
                      </div>
                      <div className="lg:h-12">
                        <HoverBorderGradient
                          containerClassName="rounded-full h-full"
                          className="flex items-center justify-center text-lg bg-background text-primary h-full"
                          onClick={() => router.push('/problems')}
                        >
                          <Play className="w-5 h-5 mr-2" />
                          Explore Problems
                        </HoverBorderGradient>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Show ShinyButton on md and below, InteractiveHoverButton on lg+ */}
                      <span className="block lg:hidden">
                        <button
                          className="relative inline-block p-px text-xs font-semibold leading-6 text-white no-underline rounded-full shadow-2xl cursor-pointer bg-slate-800 group shadow-zinc-900"
                          onClick={() => router.push('/problems')}
                        >
                          <span className="absolute inset-0 overflow-hidden rounded-full">
                            <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                          </span>
                          <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10 ">
                            Continue Learning
                            <svg
                              fill="none"
                              height="16"
                              viewBox="0 0 24 24"
                              width="16"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M10.75 8.75L14.25 12L10.75 15.25"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                              />
                            </svg>
                          </div>
                          <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
                        </button>
                      </span>
                      <div className="hidden lg:block lg:h-12">
                        <InteractiveHoverButton
                          onClick={() => router.push('/problems')}
                          className="h-full"
                        >
                          <span className="flex items-center justify-center gap-2 h-full">
                            Continue Learning
                          </span>
                        </InteractiveHoverButton>
                      </div>
                      <div className="lg:h-12">
                        <HoverBorderGradient
                          containerClassName="rounded-full h-full"
                          className="flex items-center justify-center text-lg bg-background text-primary h-full"
                          onClick={() => router.push('/interview')}
                        >
                          <Mic className="w-5 h-5 mr-2" />
                          AI Interview Prep
                        </HoverBorderGradient>
                      </div>
                    </>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </GridBackground>
      </section>

      {/* Advanced Features Section with ScrollStack */}
      <section className="w-full px-4 py-6 bg-gradient-to-br from-background via-background to-accent/5">
        {/* ScrollStack Features Section */}
        <section className="w-full px-4 -mt-2">
          <div className="mx-auto max-w-7xl">
            <ScrollStack itemDistance={300} className="min-h-[40vh]">
              <ScrollStackItem itemClassName="bg-transparent shadow-none border-none">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative w-full max-w-[200px] h-px bg-gradient-to-r from-transparent via-[#f5ac01]/30 to-[#f5ac01]">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#f5ac01] rotate-45 rounded-sm"></div>
                    </div>
                    <div className="inline-flex items-center px-2 py-1 mx-2 rounded-full bg-[#f5b210]/10 text-[#f5ac01] text-sm font-bold satoshi">
                      Features
                    </div>
                    <div className="relative w-full max-w-[200px] h-px bg-gradient-to-l from-transparent via-[#f5ac01]/30 to-[#f5ac01]">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#f5ac01] rotate-45 rounded-sm"></div>
                    </div>
                  </div>
                  <h2
                    className="mb-6 text-4xl font-bold md:text-6xl"
                    style={{ fontFamily: 'Akashi' }}
                  >
                    Engineered for Excellence
                  </h2>
                  <p
                    className={`${brunoFont.className} text-xl max-w-3xl mx-auto leading-relaxed text-[#f5ac01]`}
                  >
                    Our comprehensive platform provides all the tools,
                    resources, and support you need to master coding interviews
                    and advance your career
                  </p>
                </div>
              </ScrollStackItem>
              <ScrollStackItem itemClassName="bg-gradient-to-br from-indigo-900 via-purple-800 to-indigo-700">
                <div className="max-w-lg">
                  <h2
                    className={`${brunoFont.className} text-left text-balance text-xl md:text-2xl lg:text-3xl font-semibold tracking-[-0.015em] text-white`}
                  >
                    Ultimate AI Coding Workspace
                  </h2>
                  <p className="mt-4 text-left text-base/6 text-neutral-200">
                    All-in-one AI-powered workspace by DSATrek for solving
                    coding problems with syntax highlighting, intelligent
                    auto-completion, and real-time testing. Practice, code,
                    test, and submit all in one seamless environment designed to
                    accelerate your coding journey!
                  </p>
                  <div className="mt-6">
                    <AnimatedStarButton
                      onClick={() => router.push('/problems')}
                      bgColor="bg-indigo-300"
                      textColor="text-indigo-900"
                      borderColor="border-indigo-300"
                      hoverTextColor="hover:text-indigo-300"
                      hoverShadow="hover:shadow-[0_0_25px_rgba(99,102,241,0.5)]"
                      borderRadius="rounded-full"
                    >
                      Try Workspace
                    </AnimatedStarButton>
                  </div>
                </div>
                {/* Coding Workspace Icon */}
                <div className="absolute right-[2vw] top-1/2 -translate-y-1/2 w-[30vw] h-[30vw] hover:w-[35vw] hover:h-[35vw] xl:w-[25vw] xl:h-[25vw] xl:hover:w-[30vw] xl:hover:h-[30vw] transition-all duration-300 hidden lg:flex items-center justify-center z-50">
                  <Image
                    src="/workspace.svg"
                    alt="Coding Workspace"
                    width={400}
                    height={400}
                    className="w-full h-full"
                    priority
                    unoptimized
                  />
                </div>
              </ScrollStackItem>

              <ScrollStackItem itemClassName="bg-gradient-to-br from-emerald-900 via-emerald-700 to-teal-800">
                <div className="max-w-lg">
                  <h2
                    className={`${brunoFont.className} text-left text-balance text-xl md:text-2xl lg:text-3xl font-semibold tracking-[-0.015em] text-white`}
                  >
                    Track Your Coding Journey with Advanced Analytics
                  </h2>
                  <p className="mt-4 text-left text-base/6 text-neutral-200">
                    Comprehensive dashboard with detailed insights, performance
                    metrics, streak tracking, and personalized recommendations
                    to accelerate your growth.
                  </p>
                  <div className="mt-6">
                    <AnimatedStarButton
                      onClick={() =>
                        router.push(
                          authUser ? `/profile/${authUser.id}` : '/auth/login'
                        )
                      }
                      bgColor="bg-emerald-300"
                      textColor="text-emerald-900"
                      borderColor="border-emerald-300"
                      hoverTextColor="hover:text-emerald-300"
                      hoverShadow="hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]"
                      borderRadius="rounded-md"
                    >
                      View Dashboard
                    </AnimatedStarButton>
                  </div>
                </div>
              </ScrollStackItem>

              <ScrollStackItem itemClassName="bg-gradient-to-br from-[#1a1a1a] via-[#6e40c9] via-[#ff8c00] to-[#ff206e]">
                <div className="flex items-center justify-center h-full w-full">
                  <IconCloud images={images} />
                </div>
                <div className="absolute bottom-10 left-10">
                  <h2
                    className={`${brunoFont.className} text-left text-balance text-2xl font-semibold tracking-[-0.015em] text-white`}
                  >
                    Multi-Language Support
                  </h2>
                  <p className="mt-2 text-left text-sm text-neutral-200">
                    Practice in your preferred programming language
                  </p>
                </div>
              </ScrollStackItem>

              <ScrollStackItem itemClassName="bg-gradient-to-br from-orange-600 to-red-700">
                <div className="max-w-lg">
                  <h2
                    className={`${brunoFont.className} text-left text-balance text-2xl md:text-3xl lg:text-4xl font-semibold tracking-[-0.015em] text-white`}
                  >
                    Learn, Share, and Grow Together
                  </h2>
                  <p className="mt-4 text-left text-base/6 text-neutral-200">
                    Join a vibrant global community of coders inside DSATrek.
                    Engage in real-time discussions, exchange ideas, ask
                    questions. Learn from others, share your insights, and grow
                    as a developer together.
                  </p>
                  <div className="mt-6">
                    <AnimatedStarButton
                      onClick={() => router.push('/community')}
                      bgColor="bg-orange-300"
                      textColor="text-orange-900"
                      borderColor="border-orange-300"
                      hoverTextColor="hover:text-orange-300"
                      hoverShadow="hover:shadow-[0_0_25px_rgba(249,115,22,0.5)]"
                      borderRadius="rounded-xl"
                    >
                      Browse Sheets
                    </AnimatedStarButton>
                  </div>
                </div>
              </ScrollStackItem>

              <ScrollStackItem itemClassName="bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600">
                <div className="max-w-lg">
                  <h2
                    className={`${brunoFont.className} text-left text-balance text-2xl md:text-3xl lg:text-4xl font-semibold tracking-[-0.015em] text-white`}
                  >
                    Real-time Collaborative Workspace
                  </h2>
                  <p className="mt-4 text-left text-base/6 text-neutral-200">
                    Code together in real-time with our Liveblocks-powered
                    collaborative workspace. Share your screen, edit code
                    simultaneously, and learn from peers in an interactive
                    environment designed for modern developers.
                  </p>
                  <div className="mt-6">
                    <AnimatedStarButton
                      onClick={() => router.push('/problems')}
                      bgColor="bg-purple-300"
                      textColor="text-purple-900"
                      borderColor="border-purple-300"
                      hoverTextColor="hover:text-purple-300"
                      hoverShadow="hover:shadow-[0_0_25px_rgba(168,85,247,0.5)]"
                      borderRadius="rounded-2xl"
                      className="group"
                    >
                      Try Collaborative Workspace
                    </AnimatedStarButton>
                  </div>
                </div>
              </ScrollStackItem>

              <ScrollStackItem itemClassName="bg-gradient-to-br from-black via-black to-black">
                <div className="max-w-lg">
                  <h2
                    className={`${brunoFont.className} text-left text-balance text-2xl md:text-3xl lg:text-4xl font-semibold tracking-[-0.015em] text-white`}
                  >
                    AI Interview Assistant
                  </h2>
                  <p className="mt-4 text-left text-base/6 text-neutral-200">
                    Experience realistic coding interviews with AI-powered
                    feedback and comprehensive performance analysis.
                  </p>
                  <div className="mt-6">
                    <AnimatedStarButton
                      onClick={() => router.push('/interview')}
                      bgColor="bg-gray-300"
                      textColor="text-gray-900"
                      borderColor="border-gray-300"
                      hoverTextColor="hover:text-gray-300"
                      hoverShadow="hover:shadow-[0_0_25px_rgba(107,114,128,0.5)]"
                      borderRadius="rounded-sm"
                    >
                      Start Interview
                    </AnimatedStarButton>
                  </div>
                </div>
                {/* Spline 3D Model */}
                <div className="absolute right-10 bottom-10 w-32 h-32 flex items-center justify-center z-50">
                  <SplineModel />
                </div>
              </ScrollStackItem>
            </ScrollStack>
          </div>
        </section>
      </section>

      {/* Why Choose DSATrek Section - Improve overflow handling for VelocityScroll */}
      <section className="w-full px-4 py-32 mt-40 overflow-hidden bg-gradient-to-br from-background via-background to-accent/5">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="mb-8 text-lg text-muted-foreground">
              Trusted by developers at top companies worldwide
            </p>

            {/* Enhanced VelocityScroll with Company Logos */}
            <div className="relative w-full overflow-hidden">
              <VelocityScroll
                defaultVelocity={2}
                numRows={2}
                className="py-8"
                rowClassName="py-6"
                delay={0.5}
              >
                {[
                  ...companyLogos,
                  ...companyLogos,
                  ...companyLogos,
                  ...companyLogos,
                ].map((company, index) => (
                  <div
                    key={`logo-${company.name}-${index}`}
                    className="inline-flex items-center justify-center mr-20"
                  >
                    <Image
                      src={company.src}
                      alt={company.name}
                      width={company.width}
                      height={company.height}
                      className="transition-opacity duration-300 opacity-80 hover:opacity-100"
                      style={{
                        width: `${company.width}px`,
                        height: `${company.height}px`,
                        objectFit: 'contain',
                      }}
                      loading="lazy"
                    />
                  </div>
                ))}
              </VelocityScroll>

              {/* Enhanced gradient overlays for smoother edges */}
              <div className="absolute inset-y-0 left-0 z-10 w-32 pointer-events-none md:w-40 bg-gradient-to-r from-background via-background/80 to-transparent"></div>
              <div className="absolute inset-y-0 right-0 z-10 w-32 pointer-events-none md:w-40 bg-gradient-to-l from-background via-background/80 to-transparent"></div>
            </div>
            {/* MorphingText in bottom-left - Fix positioning */}
            <motion.div
              className="absolute z-20 hidden w-full px-4 left-1/2 bottom-0 transform -translate-x-1/2 lg:block max-w-7xl"
              initial={{ opacity: 0, scale: 0.3, z: -100 }}
              whileInView={{ opacity: 1, scale: 1, z: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              viewport={{ once: true, margin: '-100px' }}
            >
              <MorphingText
                texts={morphWords}
                className="text-[100pt] xl:text-[124pt] h-12"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
