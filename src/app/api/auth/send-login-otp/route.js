import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { User, OTP } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  secure: true,
  port: 465,
});

console.log('Email config:', {
  user: process.env.EMAIL_USER,
  passLength: process.env.EMAIL_PASS?.length,
});

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists and is unverified
    const userResult = await db
      .select()
      .from(User)
      .where(eq(User.email, email))
      .limit(1);

    if (!userResult.length) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResult[0];

    if (user.isVerified) {
      return NextResponse.json(
        { success: false, message: 'User is already verified' },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing unused OTPs for this user
    await db
      .delete(OTP)
      .where(
        and(
          eq(OTP.email, email),
          eq(OTP.isUsed, 'false'),
          eq(OTP.type, 'email_verification')
        )
      );

    // Store new OTP
    await db.insert(OTP).values({
      userId: user.id,
      email,
      otp,
      type: 'email_verification',
      expiresAt: otpExpiry,
    });

    // Send verification email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification Required - DSATrek',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">Email Verification Required</h2>
          <p>Please verify your email address to complete your login:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #1f2937; font-size: 32px; margin: 0;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't try to login, please ignore this email.</p>
        </div>
      `,
    };

    console.log('Attempting to send email to:', email);
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');

    return NextResponse.json({
      success: true,
      message: 'Verification OTP sent to your email',
    });
  } catch (error) {
    console.error('Send login OTP error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
