import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
  try {
    // Check authentication using NextAuth
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please login to continue with payment',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount, currency, planId, planName } = body;

    if (!amount || !planId || !planName) {
      return NextResponse.json(
        {
          success: false,
          message: 'Amount, plan ID, and plan name are required',
        },
        { status: 400 }
      );
    }

    // Create Razorpay order directly
    const options = {
      amount: amount * 100, // Amount in paise
      currency: currency || 'INR',
      receipt: `order_${Date.now()}`,
      notes: {
        planId,
        planName,
        userId: session.user.id,
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json(
      {
        success: true,
        message: 'Order created successfully',
        data: {
          order: {
            id: order.id,
            amount: order.amount,
            currency: order.currency,
          },
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create order. Please try again.',
      },
      { status: 500 }
    );
  }
}
