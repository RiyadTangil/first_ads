import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function PUT(req: NextRequest) {
  try {
    let userId = null;
    let reqBody: any = null;
    
    // Check if user is authenticated via session or token
    const session = await getServerSession(authOptions);
    
    // Log authentication attempt details
    console.log('Auth attempt - Session:', session ? 'exists' : 'null');
    
    if (session?.user?.id) {
      // User is authenticated via NextAuth session
      userId = session.user.id;
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
      console.log('Request body parsed:', reqBody);
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json(
        { message: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    // As a fallback, try to extract user ID from the request body
    if (!userId && reqBody?.id) {
      userId = reqBody.id;
      console.log('Using ID from request body:', userId);
    }
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Extract needed fields from body
    const { name, email } = reqBody;
    console.log('Processing update with name:', name, 'and email:', email);

    // Validate input
    if (!name || typeof name !== 'string' || !name.trim()) {
      console.log('Name validation failed:', { name, type: typeof name, isEmpty: !name?.trim() });
      return NextResponse.json(
        { message: 'Name is required', field: 'name' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      console.log('Email validation failed:', { email, type: typeof email, isEmpty: !email?.trim() });
      return NextResponse.json(
        { message: 'Email is required', field: 'email' },
        { status: 400 }
      );
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { message: 'Please enter a valid email address', field: 'email' },
        { status: 400 }
      );
    }

    // Find the user
    console.log('Looking up user with ID:', userId);
    const user = await User.findById(userId);
    
    if (!user) {
      console.log('User not found with ID:', userId);
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    console.log('User found, proceeding with update');

    // Check if email is already taken (but not by the current user)
    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      
      if (existingUser) {
        return NextResponse.json(
          { message: 'Email is already taken', field: 'email' },
          { status: 400 }
        );
      }
    }

    // Update the user
    user.name = name;
    // Username is NOT updated - it stays the same
    user.email = email;
    
    await user.save();
    console.log('User updated successfully');

    return NextResponse.json(
      { 
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating profile:', error);
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const message = `This ${field} is already taken`;
      
      return NextResponse.json(
        { message, field },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
} 