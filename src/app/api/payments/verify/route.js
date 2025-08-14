import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { User } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(request) {
  try {
    // Check authentication using NextAuth
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing payment verification parameters',
        },
        { status: 400 }
      );
    }

    // Verify Razorpay signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      console.error('Payment signature verification failed:', {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        userId: session.user.id,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        {
          success: false,
          message: 'Payment verification failed - Invalid signature',
        },
        { status: 400 }
      );
    }

    // Additional security: Verify planId is valid for paid plans
    const validPaidPlans = [
      'pro',
      'premium',
      'premium_monthly',
      'premium_yearly',
    ];
    if (!validPaidPlans.includes(planId)) {
      console.error('Invalid plan ID for payment verification:', {
        planId,
        userId: session.user.id,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid subscription plan',
        },
        { status: 400 }
      );
    }

    // Calculate subscription expiry based on plan
    const now = new Date();
    let subscriptionExpiresAt = null;
    let planName = 'Freemium';

    if (planId === 'premium_monthly') {
      planName = 'Premium Monthly';
      subscriptionExpiresAt = new Date(now);
      subscriptionExpiresAt.setMonth(subscriptionExpiresAt.getMonth() + 1);
    } else if (planId === 'premium_yearly') {
      planName = 'Premium Yearly';
      subscriptionExpiresAt = new Date(now);
      subscriptionExpiresAt.setFullYear(
        subscriptionExpiresAt.getFullYear() + 1
      );
    } else if (planId === 'pro') {
      planName = 'Pro';
      subscriptionExpiresAt = new Date(now);
      subscriptionExpiresAt.setMonth(subscriptionExpiresAt.getMonth() + 1);
    }

    // Update user subscription in database
    const [updatedUser] = await db
      .update(User)
      .set({
        isSubscribed: true,
        subscriptionPlan: planId,
        subscriptionExpiresAt: subscriptionExpiresAt,
        updatedAt: now,
      })
      .where(eq(User.id, session.user.id))
      .returning();

    const subscription = {
      planId: planId,
      planName: planName,
      status: 'active',
      expiresAt: subscriptionExpiresAt?.toISOString() || null,
      createdAt: now.toISOString(),
    };

    // Log successful subscription activation for audit trail
    console.log('Subscription activated successfully:', {
      userId: session.user.id,
      planId,
      planName,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      expiresAt: subscriptionExpiresAt?.toISOString(),
      timestamp: now.toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified and subscription activated successfully',
      data: {
        subscription: subscription,
        user: updatedUser,
      },
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      {
        success: false,
        message:
          'Payment verification failed. Please contact support if amount was deducted.',
      },
      { status: 500 }
    );
  }
}
