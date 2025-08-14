import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { User } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    let userId = url.searchParams.get('userId');

    // If no userId in query params, try to get from session
    if (!userId) {
      const session = await auth();
      userId = session?.user?.id;
    }

    if (!userId) {
      // Return default freemium subscription for unauthenticated users
      return NextResponse.json({
        success: true,
        data: {
          planId: 'freemium',
          planName: 'Freemium',
          status: 'active',
          expiresAt: null,
          isSubscribed: false,
        },
      });
    }

    // Fetch user subscription data from database
    const [user] = await db
      .select({
        isSubscribed: User.isSubscribed,
        subscriptionPlan: User.subscriptionPlan,
        subscriptionExpiresAt: User.subscriptionExpiresAt,
      })
      .from(User)
      .where(eq(User.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Convert string booleans to actual booleans
    const isSubscribed = user.isSubscribed === 'true';
    const planId = user.subscriptionPlan || 'freemium';

    // Determine plan name based on planId
    let planName = 'Freemium';
    if (planId === 'pro') {
      planName = 'Pro';
    } else if (planId === 'premium') {
      planName = 'Premium';
    } else if (planId === 'premium_monthly') {
      planName = 'Premium Monthly';
    } else if (planId === 'premium_yearly') {
      planName = 'Premium Yearly';
    }

    // Check if subscription is expired
    let status = 'active';
    if (isSubscribed && user.subscriptionExpiresAt) {
      const now = new Date();
      const expiresAt = new Date(user.subscriptionExpiresAt);
      if (now > expiresAt) {
        status = 'expired';
      }
    } else if (!isSubscribed) {
      status = planId === 'freemium' ? 'active' : 'inactive';
    }

    const subscription = {
      planId: planId,
      planName: planName,
      status: status,
      expiresAt: user.subscriptionExpiresAt?.toISOString() || null,
      isSubscribed: isSubscribed && status !== 'expired',
    };

    return NextResponse.json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  // SECURITY: This endpoint is disabled to prevent unauthorized subscription updates
  // Subscriptions can only be activated through verified payments via /payments/verify
  return NextResponse.json(
    {
      success: false,
      error:
        'Direct subscription updates are not allowed. Please use the payment verification endpoint.',
    },
    { status: 403 }
  );
}
