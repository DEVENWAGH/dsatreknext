import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { User, PasswordReset } from '@/lib/schema';
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

    // Verify OTP from database
    const resetRecord = await db
      .select()
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

    // Mark user as verified
    const [verifiedUser] = await db
      .update(User)
      .set({ isVerified: true })
      .where(eq(User.email, email))
      .returning();

    // Mark OTP as used
    await db
      .update(PasswordReset)
      .set({ isUsed: 'true' })
      .where(eq(PasswordReset.id, resetRecord[0].id));

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: verifiedUser.id,
        email: verifiedUser.email,
        username: verifiedUser.username,
        firstName: verifiedUser.firstName,
        lastName: verifiedUser.lastName,
      },
    });
  } catch (error) {
    console.error('Verify signup error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
