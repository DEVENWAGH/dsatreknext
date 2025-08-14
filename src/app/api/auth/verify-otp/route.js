import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { User, OTP } from '@/lib/schema';
import { eq, and, gt } from 'drizzle-orm';

export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Check OTP from otps table
    const resetRecord = await db
      .select()
      .from(OTP)
      .where(
        and(
          eq(OTP.email, email),
          eq(OTP.otp, otp),
          eq(OTP.isUsed, 'false'),
          gt(OTP.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!resetRecord.length) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // Mark user as verified if this is for signup
    await db
      .update(User)
      .set({ isVerified: true })
      .where(eq(User.email, email));

    // Mark OTP as used
    await db
      .update(OTP)
      .set({ isUsed: 'true' })
      .where(eq(OTP.id, resetRecord[0].id));

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
