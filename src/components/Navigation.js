'use client';

import { Button } from '@/components/ui/button';
import SubscribeButton from '@/components/ui/subscribe-button';
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { useSession, signOut } from 'next-auth/react';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { useAuthStore } from '@/store/authStore';
import { userAPI } from '@/api/api';
import {
  Trophy,
  Flame,
  Settings,
  User,
  LogOut,
  Crown,
  Award,
  Edit,
  Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollProgress } from '@/components/magicui/scroll-progress';
import Image from 'next/image';
import { useLogo } from '@/hooks/useLogo';
import MobileTabs from '@/components/ui/mobile-tabs';
import DesktopTabs from '@/components/ui/desktop-tabs';
import AvatarFallback from '@/components/ui/avatar-fallback';
import { DeleteAccountDialog } from '@/components/ui/delete-account-dialog';
import styled from 'styled-components';

const Navigation = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userStreak, setUserStreak] = useState(0);
  const [userStats, setUserStats] = useState({
    solved: 0,
    totalProblems: 1500,
    rank: 0,
    level: 'Beginner',
  });
  const [planLabel, setPlanLabel] = useState('SUBSCRIBE');
  const [userAvatar, setUserAvatar] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const { subscription, getUserSubscription } = useSubscriptionStore();
  const { logout: authStoreLogout } = useAuthStore();
  const logoSrc = useLogo();

  // Get user data from session
  const authUser = session?.user || null;

  const fetchUserData = useCallback(async () => {
    try {
      if (!authUser?.id) return;

      // Fetch user profile picture
      const userResponse = await fetch(`/api/users/${authUser.id}`);
      if (userResponse.ok) {
        const userData = await userResponse.json();
        if (userData.success && userData.data.profilePicture) {
          setUserAvatar(userData.data.profilePicture);
        }
      }

      // Fetch real user statistics using Next.js API format
      const statsResponse = await userAPI.getStatistics(authUser.id);
      if (statsResponse.success) {
        const stats = statsResponse.data;
        setUserStats({
          solved: stats.totalSolved || 0,
          totalProblems: stats.totalProblems || 1500,
          rank: stats.rank || 0,
          level: stats.level || 'Beginner',
        });
      }

      // Fetch real activity streak
      const streakResponse = await fetch(`/api/users/${authUser.id}/streak`);
      if (streakResponse.ok) {
        const streakData = await streakResponse.json();
        if (streakData.success) {
          setUserStreak(streakData.data?.currentStreak || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, [authUser?.id]);

  useEffect(() => {
    const wasLoggedIn = isLoggedIn;
    const nowLoggedIn = !!authUser;

    setIsLoggedIn(nowLoggedIn);

    // If user just logged in, fetch their data
    if (!wasLoggedIn && nowLoggedIn && authUser) {
      fetchUserData();
      getUserSubscription();
    }

    // If user logged out, reset data
    if (wasLoggedIn && !nowLoggedIn) {
      setUserStats({
        solved: 0,
        totalProblems: 1500,
        rank: 0,
        level: 'Beginner',
      });
      setUserStreak(0);
      setPlanLabel('SUBSCRIBE');
      setUserAvatar(null);
    }
  }, [authUser, fetchUserData, getUserSubscription, isLoggedIn]);

  // Force re-render when session changes
  useEffect(() => {
    if (session) {
      setIsLoggedIn(true);
      if (session.user) {
        fetchUserData();
        getUserSubscription();
      }
    } else {
      setIsLoggedIn(false);
    }
  }, [session, fetchUserData, getUserSubscription]);

  useEffect(() => {
    // Set plan label based on subscription
    if (subscription?.planId === 'premium') setPlanLabel('PREMIUM');
    else if (subscription?.planId === 'pro') setPlanLabel('PRO');
    else setPlanLabel('SUBSCRIBE'); // Show SUBSCRIBE for freemium or no subscription
  }, [subscription]);

  // Listen for stats updates and auth changes
  useEffect(() => {
    const handleStatsUpdate = () => {
      if (authUser?.id) {
        fetchUserData();
      }
    };

    const handleAuthChange = () => {
      // Force re-check of session state
      if (session?.user) {
        setIsLoggedIn(true);
        fetchUserData();
        getUserSubscription();
      }
    };

    window.addEventListener('statsUpdate', handleStatsUpdate);
    window.addEventListener('auth-change', handleAuthChange);
    return () => {
      window.removeEventListener('statsUpdate', handleStatsUpdate);
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, [authUser?.id, fetchUserData, session, getUserSubscription]);

  const user = {
    id: authUser?.id,
    name: authUser?.name,
    email: authUser?.email,
    avatar: userAvatar || authUser?.image,
    role: authUser?.role,
  };

  const handleLogout = async () => {
    try {
      await authStoreLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLogin = () => {
    const callbackUrl = encodeURIComponent(window.location.href);
    router.push(`/auth/login?callbackUrl=${callbackUrl}`);
  };

  const handleSignup = () => {
    const callbackUrl = encodeURIComponent(window.location.href);
    router.push(`/auth/register?callbackUrl=${callbackUrl}`);
  };

  const handleSubscribe = () => {
    if (isLoggedIn) {
      router.push('/pricing');
    } else {
      router.push('/auth/login');
    }
  };

  const getLevelColor = level => {
    switch (level) {
      case 'Expert':
        return 'text-purple-600';
      case 'Advanced':
        return 'text-red-600';
      case 'Intermediate':
        return 'text-orange-600';
      default:
        return 'text-green-600';
    }
  };

  // State for client-side logo
  // Handled by useLogo hook now

  return (
    <nav className="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Tabs */}
          <div className="flex items-center gap-8">
            <Link href="/" className="logo-container group">
              <Image
                src={logoSrc}
                alt="D"
                width={32}
                height={32}
                className="logo-d"
              />
              <span className="logo-text">SATrek</span>
            </Link>
            {/* Desktop Navigation with Glowing Tabs */}
            <div className="hidden lg:flex">
              <DesktopTabs />
            </div>
          </div>

          {/* Right side - User actions */}
          <div className="flex items-center gap-3">
            {/* Subscribe Button - Show for all users */}
            <div className="hidden lg:block">
              <SubscribeButton
                onClick={handleSubscribe}
                className="subscribe-btn"
                planLabel={planLabel}
              />
            </div>

            {/* Simple Streak Display for logged in users */}
            {isLoggedIn && (
              <div className="hidden sm:flex lg:hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 cursor-pointer hover:scale-105 transition-transform duration-200">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold text-orange-500">
                  {userStreak}
                </span>
              </div>
            )}
            <ModeToggle />

            {/* Auth Section */}
            {!isLoggedIn ? (
              <div className="items-center hidden gap-1 xl:gap-3 lg:flex">
                <button
                  onClick={handleLogin}
                  className="relative px-2 py-1 xl:px-4 xl:py-2 text-center text-xs xl:text-sm transition-all duration-200 border rounded-full backdrop-blur-sm bg-emerald-300/10 border-emerald-500/20 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-300/20"
                >
                  <span>Login</span>
                  <div className="absolute inset-x-0 w-3/4 h-px mx-auto -bottom-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
                </button>
                <button
                  onClick={handleSignup}
                  className="relative px-2 py-1 xl:px-4 xl:py-2 text-center text-xs xl:text-sm text-blue-400 transition-all duration-200 border rounded-full backdrop-blur-sm bg-blue-300/10 border-blue-500/20 hover:text-blue-300 hover:bg-blue-300/20"
                >
                  <span className="lg:block xl:hidden">Join</span>
                  <span className="hidden xl:block">Sign Up</span>
                  <div className="absolute inset-x-0 w-3/4 h-px mx-auto -bottom-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
                </button>
              </div>
            ) : (
              <HoverCard openDelay={0} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <div className="items-center hidden gap-3 p-2 transition-colors rounded-lg cursor-pointer select-none lg:flex hover:bg-accent/50">
                    <div
                      className="relative"
                      onClick={e => {
                        e.stopPropagation();
                        router.push(`/profile/${user.id}`);
                      }}
                    >
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.name}
                          width={32}
                          height={32}
                          className={`object-cover w-8 h-8 border-2 rounded-full shadow-sm cursor-pointer ${
                            subscription?.planId === 'premium' ||
                            subscription?.planId === 'pro'
                              ? 'border-yellow-500'
                              : 'border-border'
                          }`}
                          quality={100}
                          unoptimized
                        />
                      ) : (
                        <AvatarFallback
                          name={user.name}
                          size={32}
                          className={`border-2 shadow-sm cursor-pointer ${
                            subscription?.planId === 'premium' ||
                            subscription?.planId === 'pro'
                              ? 'border-yellow-500'
                              : 'border-border'
                          }`}
                        />
                      )}
                      {user.role === 'admin' && (
                        <Crown className="absolute w-4 h-4 text-yellow-500 -top-1 -right-1" />
                      )}
                    </div>
                    <div className="hidden xl:block flex-col">
                      <span className="text-xs text-muted-foreground"></span>
                    </div>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent align="end" className="p-0 w-80">
                  <Card>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {user.avatar ? (
                            <Image
                              src={user.avatar}
                              alt={user.name}
                              width={48}
                              height={48}
                              className={`object-cover w-12 h-12 border-2 rounded-full ${
                                subscription?.planId === 'premium' ||
                                subscription?.planId === 'pro'
                                  ? 'border-yellow-500'
                                  : 'border-border'
                              }`}
                              quality={100}
                              unoptimized
                            />
                          ) : (
                            <AvatarFallback
                              name={user.name}
                              size={48}
                              className={`border-2 ${
                                subscription?.planId === 'premium' ||
                                subscription?.planId === 'pro'
                                  ? 'border-yellow-500'
                                  : 'border-border'
                              }`}
                            />
                          )}
                          {user.role === 'admin' && (
                            <Crown className="absolute w-5 h-5 text-yellow-500 -top-1 -right-1" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              className={getLevelColor(userStats.level)}
                              variant="secondary"
                            >
                              {userStats.level}
                            </Badge>
                            {user.role === 'admin' && (
                              <Badge variant="secondary" className="text-xs">
                                Admin
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-4 py-3 border-y border-border">
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">
                            {userStats.solved}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Solved
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-600">
                            {userStreak}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Streak
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            #{userStats.rank}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Rank
                          </div>
                        </div>
                      </div>

                      {/* Navigation Links */}
                      <div className="space-y-1">
                        {user.role === 'admin' && (
                          <Button
                            variant="ghost"
                            className="justify-start w-full gap-2"
                            onClick={() => router.push('/admin/dashboard')}
                          >
                            <Crown className="w-4 h-4" />
                            Admin Dashboard
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          className="justify-start w-full gap-2"
                          onClick={() => router.push(`/profile/${user.id}`)}
                        >
                          <User className="w-4 h-4" />
                          My Profile
                        </Button>
                        <Button
                          variant="ghost"
                          className="justify-start w-full gap-2"
                          onClick={() => {
                            // Open edit profile dialog
                            const event = new CustomEvent('openEditProfile');
                            window.dispatchEvent(event);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                          Edit Profile
                        </Button>
                        <div className="my-2 border-t border-border"></div>
                        <Button
                          variant="ghost"
                          className="justify-start w-full gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          onClick={() => setDeleteDialogOpen(true)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Account
                        </Button>
                        <Button
                          variant="ghost"
                          className="justify-start w-full gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          onClick={handleLogout}
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </HoverCardContent>
              </HoverCard>
            )}

            {/* Mobile Menu Toggle */}
            <div className="lg:hidden">
              <HamburgerToggle
                isOpen={menuOpen}
                onClick={() => setMenuOpen(!menuOpen)}
              />
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden absolute left-0 right-0 top-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-lg">
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Navigation Tabs */}
              <div>
                <MobileTabs />
              </div>

              {/* Mobile Subscribe Button for all users */}
              <SubscribeButton
                onClick={() => {
                  setMenuOpen(false);
                  handleSubscribe();
                }}
                planLabel={planLabel}
              />

              {/* Mobile User Section */}
              {!isLoggedIn ? (
                <div className="pt-2 space-y-3 border-t border-border">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogin();
                    }}
                    className="relative w-full px-4 py-2 text-center transition-all duration-200 border rounded-full backdrop-blur-sm bg-emerald-300/10 border-emerald-500/20 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-300/20"
                  >
                    <span>Login</span>
                    <div className="absolute inset-x-0 w-3/4 h-px mx-auto -bottom-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleSignup();
                    }}
                    className="relative w-full px-4 py-2 text-center text-blue-400 transition-all duration-200 border rounded-full backdrop-blur-sm bg-blue-300/10 border-blue-500/20 hover:text-blue-300 hover:bg-blue-300/20"
                  >
                    <span>Sign Up →</span>
                    <div className="absolute inset-x-0 w-3/4 h-px mx-auto -bottom-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
                  </button>
                </div>
              ) : (
                <div className="pt-2 space-y-3 border-t border-border">
                  {/* Mobile Enhanced Streak */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="flex items-center justify-center gap-1 mb-1 text-green-600">
                            <Trophy className="w-4 h-4" />
                            <span className="text-lg font-bold">
                              {userStats.solved}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Solved
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-center gap-1 mb-1 text-orange-600">
                            <Flame className="w-4 h-4" />
                            <span className="text-lg font-bold">
                              {userStreak}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Streak
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-center gap-1 mb-1 text-blue-600">
                            <Award className="w-4 h-4" />
                            <span className="text-lg font-bold">
                              #{userStats.rank}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Rank
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Mobile User Info */}
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-accent/20">
                    <div className="relative">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.name}
                          width={40}
                          height={40}
                          className={`object-cover w-10 h-10 border-2 rounded-full ${
                            subscription?.planId === 'premium' ||
                            subscription?.planId === 'pro'
                              ? 'border-yellow-500'
                              : 'border-border'
                          }`}
                          quality={100}
                          unoptimized
                        />
                      ) : (
                        <AvatarFallback
                          name={user.name}
                          size={40}
                          className={`border-2 ${
                            subscription?.planId === 'premium' ||
                            subscription?.planId === 'pro'
                              ? 'border-yellow-500'
                              : 'border-border'
                          }`}
                        />
                      )}
                      {user.role === 'admin' && (
                        <Crown className="absolute w-4 h-4 text-yellow-500 -top-1 -right-1" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{user.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {user.email}
                      </div>
                      <Badge
                        className={getLevelColor(userStats.level)}
                        variant="secondary"
                        size="sm"
                      >
                        {userStats.level}
                      </Badge>
                    </div>
                  </div>

                  {/* Mobile User Actions */}
                  <div className="space-y-1">
                    {user.role === 'admin' && (
                      <Button
                        variant="ghost"
                        className="justify-start w-full gap-2"
                        onClick={() => {
                          setMenuOpen(false);
                          router.push('/admin/dashboard');
                        }}
                      >
                        <Crown className="w-4 h-4" />
                        Admin Dashboard
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      className="justify-start w-full gap-2"
                      onClick={() => {
                        setMenuOpen(false);
                        router.push(`/profile/${user.id}`);
                      }}
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start w-full gap-2"
                      onClick={() => {
                        setMenuOpen(false);
                        const event = new CustomEvent('openEditProfile');
                        window.dispatchEvent(event);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start w-full gap-2 text-red-600"
                      onClick={() => {
                        setMenuOpen(false);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Account
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start w-full gap-2 text-red-600"
                      onClick={() => {
                        setMenuOpen(false);
                        handleLogout();
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Move ScrollProgress to bottom of nav */}
      <div className="relative">
        <ScrollProgress className="absolute bottom-0 left-0 right-0" />
      </div>

      {/* Delete Account Dialog */}
      <DeleteAccountDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </nav>
  );
};

// Animated Hamburger Toggle Button Component
const HamburgerToggle = ({ isOpen, onClick }) => {
  return (
    <StyledWrapper>
      <div className={`hamburger ${isOpen ? 'open' : ''}`} onClick={onClick}>
        <svg viewBox="0 0 32 32">
          <path
            className="line line-top-bottom"
            d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
          />
          <path className="line" d="M7 16 27 16" />
        </svg>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .hamburger {
    cursor: pointer;
    padding: 8px;
  }

  .hamburger svg {
    height: 1.25rem;
    width: 1.25rem;
    transition: transform 600ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .line {
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 3;
    transition:
      stroke-dasharray 600ms cubic-bezier(0.4, 0, 0.2, 1),
      stroke-dashoffset 600ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .line-top-bottom {
    stroke-dasharray: 12 63;
  }

  .hamburger.open svg {
    transform: rotate(-45deg);
  }

  .hamburger.open svg .line-top-bottom {
    stroke-dasharray: 20 300;
    stroke-dashoffset: -32.42;
  }
`;

export default Navigation;
