import { create } from 'zustand';
import { toast } from 'sonner';
import { paymentAPI } from '@/api/api';

export const useSubscriptionStore = create((set, get) => ({
  subscription: null,
  isLoading: false,
  error: null,
  plans: [
    {
      id: 'pro',
      name: 'Pro',
      price: 1694, // Base price without GST (₹16.94)
      displayPrice: 1999, // GST inclusive display price (₹19.99)
      features: [
        'Access to most problems',
        'Enhanced submission limits',
        'Priority support',
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 4237, // Base price without GST (₹42.37)
      displayPrice: 4999, // GST inclusive display price (₹49.99)
      features: [
        'Access to all problems',
        'Unlimited submissions',
        'Premium support',
      ],
    },
  ],

  // Helper function to calculate GST inclusive amount in paise
  calculateGSTInclusiveAmount: baseAmount => {
    const gstRate = 0.18; // 18% GST
    const totalAmount = baseAmount * (1 + gstRate);
    return Math.round(totalAmount * 100); // Convert to paise
  },

  // Get user's subscription status
  getUserSubscription: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await paymentAPI.getUserSubscription();
      const subscription = response.success
        ? response.data
        : response.subscription || null;
      set({
        subscription: subscription,
        isLoading: false,
      });
      return subscription;
    } catch (error) {
      set({
        error: error.message || 'Failed to fetch subscription',
        isLoading: false,
      });
      console.error('Error fetching user subscription:', error);
      return null;
    }
  },

  // Create payment order
  createOrder: async planId => {
    set({ isLoading: true, error: null });
    try {
      const plan = get().plans.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Invalid plan selected');
      }

      const orderData = {
        amount: plan.displayPrice, // Send amount in rupees
        currency: 'INR',
        planId: plan.id,
        planName: plan.name,
      };

      const response = await paymentAPI.createOrder(orderData);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.details ||
        error.response?.data?.message ||
        'Failed to create payment order';
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
      console.error('Create order error:', error);
      throw error;
    }
  },

  // Verify payment after completion (no toast here - let the calling component handle it)
  verifyPayment: async paymentData => {
    set({ isLoading: true, error: null });
    try {
      const response = await paymentAPI.verifyPayment(paymentData);
      const subscription = response.success
        ? response.data.subscription
        : response.subscription;
      set({
        subscription: subscription,
        isLoading: false,
      });
      // Don't show toast here - let the calling component handle success/error messages
      return response;
    } catch (error) {
      set({
        error: error.message || 'Payment verification failed',
        isLoading: false,
      });
      console.error('Verify payment error:', error);
      throw error;
    }
  },

  // Cancel subscription
  cancelSubscription: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await paymentAPI.cancelSubscription();
      const subscription = response.success
        ? response.data.subscription
        : response.subscription;
      set({
        subscription: subscription,
        isLoading: false,
      });
      toast.success('Subscription cancelled successfully.');
      return response;
    } catch (error) {
      set({
        error: error.message || 'Failed to cancel subscription',
        isLoading: false,
      });
      toast.error('Failed to cancel subscription. Please try again.');
      console.error('Cancel subscription error:', error);
      throw error;
    }
  },
}));
