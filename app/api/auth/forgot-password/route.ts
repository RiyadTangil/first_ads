import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Please provide an email address' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find user with this email
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: 'There is no user with that email' },
        { status: 404 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire time (10 minutes)
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    // Create reset URL
    const resetUrl = `${req.nextUrl.origin}/auth/reset-password/${resetToken}`;

    try {
      // Send the email using our utility
      await sendPasswordResetEmail(user.email, resetUrl);
      
      return NextResponse.json({
        success: true,
        message: 'Password reset email sent',
      });
    } catch (emailError) {
      // If email sending fails, reset the user's token
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      
      console.error('Email sending error:', emailError);
      return NextResponse.json(
        { error: 'Failed to send email. Please try again later.' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
} 