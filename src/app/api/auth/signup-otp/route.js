import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { User, OTP } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(request) {
  try {
    const { email, username, password, firstName, lastName } =
      await request.json();

    if (!email || !username || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email, username, and password are required',
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(User)
      .where(eq(User.email, email))
      .limit(1);
    if (existingUser.length && existingUser[0].isVerified) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    if (existingUser.length && !existingUser[0].isVerified) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please verify your email. Check your inbox for the OTP.',
        },
        { status: 400 }
      );
    }

    const existingUsername = await db
      .select()
      .from(User)
      .where(eq(User.username, username))
      .limit(1);
    if (existingUsername.length) {
      return NextResponse.json(
        { success: false, message: 'Username already taken' },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create temporary unverified user
    const hashedPassword = await bcrypt.hash(password, 12);
    const [tempUser] = await db
      .insert(User)
      .values({
        email,
        username,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        isVerified: false, // Mark as unverified
      })
      .returning();

    // Store OTP in otps table
    await db.insert(OTP).values({
      userId: tempUser.id,
      email,
      otp,
      type: 'email_verification',
      expiresAt: otpExpiry,
    });

    // Send verification email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification OTP - DSATrek',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">Welcome to DSATrek!</h2>
          <p>Please verify your email address to complete your registration:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #1f2937; font-size: 32px; margin: 0;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: 'Verification OTP sent to your email',
    });
  } catch (error) {
    console.error('Signup OTP error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
