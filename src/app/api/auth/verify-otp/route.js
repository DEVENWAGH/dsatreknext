import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
import { db } from '@/lib/db';
import { PasswordReset } from '@/lib/schema';
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

    // Check OTP from password_resets table
    const resetRecord = await db.select()
      .from(PasswordReset)
      .where(
        and(
          eq(PasswordReset.email, email),
          eq(PasswordReset.otp, otp),
          eq(PasswordReset.isUsed, 'false'),
          gt(PasswordReset.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!resetRecord.length) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

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