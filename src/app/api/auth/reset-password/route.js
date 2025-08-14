import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { User, PasswordReset } from '@/lib/schema';
import { eq, and, gt } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Verify OTP from password_resets table
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

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await db
      .update(User)
      .set({ password: hashedPassword })
      .where(eq(User.email, email));

    // Mark OTP as used
    await db
      .update(PasswordReset)
      .set({ isUsed: 'true' })
      .where(eq(PasswordReset.id, resetRecord[0].id));

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
