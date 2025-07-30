import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
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
      return NextResponse.json(
        {
          success: false,
          message: 'Payment verification failed - Invalid signature',
        },
        { status: 400 }
      );
    }

    // Calculate subscription expiry based on plan
    let subscriptionExpiresAt = null;
    let planName = 'Freemium';

    if (planId === 'premium_monthly') {
      planName = 'Premium Monthly';
      subscriptionExpiresAt = new Date();
      subscriptionExpiresAt.setMonth(subscriptionExpiresAt.getMonth() + 1);
    } else if (planId === 'premium_yearly') {
      planName = 'Premium Yearly';
      subscriptionExpiresAt = new Date();
      subscriptionExpiresAt.setFullYear(
        subscriptionExpiresAt.getFullYear() + 1
      );
    }

    // Update user subscription in database
    const [updatedUser] = await db
      .update(User)
      .set({
        isSubscribed: true,
        subscriptionPlan: planId,
        subscriptionExpiresAt: subscriptionExpiresAt,
        updatedAt: new Date(),
      })
      .where(eq(User.id, session.user.id))
      .returning();

    const subscription = {
      planId: planId,
      planName: planName,
      status: 'active',
      expiresAt: subscriptionExpiresAt?.toISOString() || null,
      createdAt: new Date().toISOString(),
    };

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
        message: 'Payment verification failed',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
