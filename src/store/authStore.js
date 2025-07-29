import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      authUser: null,
      isSigningUp: false,
      isLoggingIn: false,
      isCheckingAuth: false,
      subscription: null,
      error: null,

      checkAuth: async () => {
        set({ isCheckingAuth: true, error: null });
        try {
          // Use NextAuth session endpoint
          const response = await fetch('/api/auth/session', {
            credentials: 'include',
          });

          if (response.ok) {
            const session = await response.json();
            if (session?.user) {
              set({ authUser: session.user });
              // Fetch subscription data when checking auth
              get().checkUserSubscription();
              return session.user;
            }
          }

          // If no valid session, clear auth state
          set({ authUser: null, subscription: null });
          return null;
        } catch (error) {
          console.error('Auth check error:', error);
          set({ authUser: null, subscription: null });
          return null;
        } finally {
          set({ isCheckingAuth: false });
        }
      },

      // Get user's subscription status
      checkUserSubscription: async () => {
        try {
          const response = await fetch('/api/payments/subscription', {
            credentials: 'include',
          });

          if (response.ok) {
            const data = await response.json();
            const subscription = data.success ? data.data : data;
            set({ subscription });
            return subscription;
          } else {
            // Fallback to freemium if API call fails
            const defaultSub = { planId: 'freemium', planName: 'Freemium' };
            set({ subscription: defaultSub });
            return defaultSub;
          }
        } catch (error) {
          console.error('Subscription check error:', error);
          const defaultSub = { planId: 'freemium', planName: 'Freemium' };
          set({ subscription: defaultSub });
          return defaultSub;
        }
      },

      signup: async userData => {
        set({ isSigningUp: true, error: null });
        try {
          // Use NextAuth signIn with signup flag
          const { signIn } = await import('next-auth/react');

          const result = await signIn('credentials', {
            email: userData.email,
            password: userData.password,
            firstName: userData.firstName,
            lastName: userData.lastName,
            username: userData.username,
            isSignup: 'true',
            redirect: false,
          });

          if (result?.error) {
            throw new Error(result.error);
          }

          if (result?.ok) {
            // Fetch the updated session
            const sessionResponse = await fetch('/api/auth/session', {
              credentials: 'include',
            });

            if (sessionResponse.ok) {
              const session = await sessionResponse.json();
              if (session?.user) {
                set({ authUser: session.user });
                // Fetch subscription data after signup
                get().checkUserSubscription();
              }
            }

            toast.success('Account created successfully!');
            // Redirect after successful signup
            window.location.href = '/';
            return { success: true };
          } else {
            throw new Error('Signup failed');
          }
        } catch (error) {
          const errorMessage = error.message || 'Signup failed';
          set({ error: errorMessage });
          console.error('Signup error:', error);
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isSigningUp: false });
        }
      },

      login: async userData => {
        set({ isLoggingIn: true, error: null });
        try {
          // Use NextAuth signIn
          const { signIn } = await import('next-auth/react');

          const result = await signIn('credentials', {
            email: userData.email,
            password: userData.password,
            redirect: false,
          });

          if (result?.error) {
            throw new Error(result.error);
          }

          if (result?.ok) {
            // Fetch the updated session
            const sessionResponse = await fetch('/api/auth/session', {
              credentials: 'include',
            });

            if (sessionResponse.ok) {
              const session = await sessionResponse.json();
              if (session?.user) {
                set({ authUser: session.user });
                // Fetch subscription data after login
                get().checkUserSubscription();
              }
            }

            toast.success('Login successful!');
            // Redirect after successful login
            window.location.href = '/';
            return { success: true };
          } else {
            throw new Error('Login failed');
          }
        } catch (error) {
          const errorMessage = error.message || 'Login failed';
          set({ error: errorMessage });
          console.error('Login error:', error);
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isLoggingIn: false });
        }
      },

      logout: async () => {
        try {
          // Use NextAuth signOut
          const { signOut } = await import('next-auth/react');

          await signOut({
            callbackUrl: '/',
            redirect: false,
          });

          set({
            authUser: null,
            subscription: null,
            error: null,
          });

          toast.success('Logout successful');
          // Redirect to home page
          window.location.href = '/';
        } catch (error) {
          console.error('Logout error:', error);
          toast.error('Logout failed');
          throw error;
        }
      },

      // Update user data in store
      updateUserData: userData => {
        set(state => ({
          authUser: { ...state.authUser, ...userData },
        }));
      },

      // Update subscription
      updateSubscription: subscription => {
        set({ subscription });
      },

      // Clear user data
      clearUserData: () => {
        set({
          authUser: null,
          subscription: null,
          error: null,
        });
      },

      // Get current user
      getCurrentUser: () => get().authUser,

      // Check if user is authenticated
      isAuthenticated: () => !!get().authUser,

      // Check if user is admin
      isAdmin: () => get().authUser?.role === 'admin',

      // Check if user has premium subscription
      isPremium: () => {
        const subscription = get().subscription;
        if (!subscription) return false;

        const premiumPlans = [
          'premium',
          'pro',
          'premium_monthly',
          'premium_yearly',
        ];
        const hasPremiumPlan = premiumPlans.includes(subscription.planId);
        const isActive =
          subscription.status === 'active' &&
          subscription.isSubscribed !== false;

        return hasPremiumPlan && isActive;
      },
    }),
    {
      name: 'auth-storage',
      partialize: state => ({
        authUser: state.authUser,
        subscription: state.subscription,
      }),
    }
  )
);
