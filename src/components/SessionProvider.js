'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAuthStore } from '@/store/authStore';
import PropTypes from 'prop-types';

export function SessionProvider({ children }) {
  const { data: session, status } = useSession();
  const { authUser, checkAuth } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Only check auth if NextAuth session is not already loading
        if (status !== 'loading') {
          await checkAuth();
        }
      } catch (error) {
        console.error('Initial auth check failed:', error);
      }
    };

    // Delay initial auth check to allow NextAuth to initialize
    const timer = setTimeout(initAuth, 100);
    return () => clearTimeout(timer);
  }, [checkAuth, status]);

  // Add visibility change listener for additional session checking
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('🔍 Session: Tab hidden - maintaining session');
        // Don't perform any session checks that might interrupt interviews
      } else {
        console.log('🔍 Session: Tab visible - checking session');
        // Only check auth when tab is visible and no interview is active
        const isInterviewActive =
          window.location.pathname.includes('/start-interview');
        if (!isInterviewActive && authUser && checkAuth) {
          checkAuth();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [authUser, checkAuth]);

  // Sync NextAuth session with Zustand store
  useEffect(() => {
    if (status === 'authenticated' && session?.user && !authUser) {
      // Update Zustand store with NextAuth session
      useAuthStore.getState().updateUserData(session.user);
    } else if (status === 'unauthenticated' && authUser) {
      // Clear Zustand store if NextAuth session is gone
      useAuthStore.getState().clearUserData();
    }
  }, [session, status, authUser]);

  return <>{children}</>;
}

SessionProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
