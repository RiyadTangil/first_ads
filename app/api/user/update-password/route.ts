import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function PUT(req: NextRequest) {
  try {
    let userId = null;
    let userEmail = null;
    let reqBody: any = null;
    
    // Check if user is authenticated via session or token
    const session = await getServerSession(authOptions);
    
    // Log authentication attempt details
    console.log('Password change - Auth attempt - Session:', session ? 'exists' : 'null');
    
    if (session?.user?.id) {
      // User is authenticated via NextAuth session
      userId = session.user.id;
      userEmail = session.user.email;
      console.log('Using session auth, user ID:', userId);
    } else {
      // Try token-based authentication
      const authHeader = req.headers.get('authorization');
      console.log('Auth header:', authHeader ? `${authHeader.substring(0, 15)}...` : 'null');
      
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
          // Use a more lenient approach for JWT verification
          const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback_jwt_secret',
            { ignoreExpiration: true } // More lenient - ignore expiration for now
          );
          userId = (decoded as any).id;
          userEmail = (decoded as any).email;
          console.log('Token decoded, user ID:', userId);
        } catch (error) {
          console.error('Token verification failed:', error);
          // Continue to next auth method
        }
      }
    }
    
    // Get request body early - we'll need it for user ID and form data
    try {
      reqBody = await req.json();
      console.log('Request body parsed for password change:', reqBody);
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    // As a fallback, try to extract user info from the request body
    if (!userId && reqBody?.id) {
      userId = reqBody.id;
      console.log('Using ID from request body:', userId);
    }
    if (!userEmail && reqBody?.email) {
      userEmail = reqBody.email;
      console.log('Using email from request body:', userEmail);
    }
    
    if (!userId && !userEmail) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Extract password info from body
    const { currentPassword, newPassword } = reqBody;
    console.log('Processing password change, current password length:', 
      currentPassword ? currentPassword.length : 0,
      'new password length:', 
      newPassword ? newPassword.length : 0);

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    // Password validation
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Fetch user from database - try by ID first, then by email
    console.log('Looking up user with ID:', userId, 'or email:', userEmail);
    let user = null;
    
    if (userId) {
      user = await User.findById(userId).select('+password');
    }
    
    if (!user && userEmail) {
      user = await User.findOne({ email: userEmail }).select('+password');
    }

    if (!user) {
      console.log('User not found');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('User found, verifying password');
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      console.log('Password verification failed');
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    console.log('Password verified, updating to new password');
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    console.log('Password updated successfully');
    
    return NextResponse.json(
      { message: 'Password updated successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating password:', error);
    return NextResponse.json(
      { error: 'Failed to update password', details: error.message },
      { status: 500 }
    );
  }
} 