import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSubscriptionStore } from '@/store/subscriptionStore';

export const usePremiumAccess = () => {
  const { data: session } = useSession();
  const { subscription, getUserSubscription } = useSubscriptionStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      if (session?.user) {
        await getUserSubscription();
      }
      setIsLoading(false);
    };

    checkSubscription();
  }, [session?.user, getUserSubscription]);

  const isPremium = subscription?.planId === 'premium';
  const isPro = subscription?.planId === 'pro';
  const hasAnySubscription = isPremium || isPro;

  return {
    isPremium,
    isPro,
    hasAnySubscription,
    subscription,
    isLoading,
    isAuthenticated: !!session?.user,
  };
};
