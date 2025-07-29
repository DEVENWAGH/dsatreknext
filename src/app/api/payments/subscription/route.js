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
  try {
    const url = new URL(request.url);
    const userId =
      url.searchParams.get('userId') || request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const body = await request.json();
    const { planId, planName } = body;

    if (!planId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Plan ID is required',
        },
        { status: 400 }
      );
    }

    // Calculate subscription expiry based on plan
    let subscriptionExpiresAt = null;
    let finalPlanName = planName || 'Freemium';

    if (planId === 'premium_monthly') {
      finalPlanName = 'Premium Monthly';
      subscriptionExpiresAt = new Date();
      subscriptionExpiresAt.setMonth(subscriptionExpiresAt.getMonth() + 1);
    } else if (planId === 'premium_yearly') {
      finalPlanName = 'Premium Yearly';
      subscriptionExpiresAt = new Date();
      subscriptionExpiresAt.setFullYear(
        subscriptionExpiresAt.getFullYear() + 1
      );
    }

    // Update user subscription in database
    await db
      .update(User)
      .set({
        isSubscribed: planId !== 'freemium',
        subscriptionPlan: planId,
        subscriptionExpiresAt: subscriptionExpiresAt,
        updatedAt: new Date(),
      })
      .where(eq(User.id, userId));

    const subscription = {
      planId: planId,
      planName: finalPlanName,
      status: planId !== 'freemium' ? 'active' : 'inactive',
      expiresAt: subscriptionExpiresAt?.toISOString() || null,
      isSubscribed: planId !== 'freemium',
    };

    return NextResponse.json({
      success: true,
      data: subscription,
      message: 'Subscription updated successfully',
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
