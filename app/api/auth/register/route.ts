import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const { name, username, email, password } = await req.json();

    // Validate input
    if (!name || !username || !email || !password) {
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already in use', field: 'email' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    
    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username already taken', field: 'username' },
        { status: 400 }
      );
    }

    // Create new user
    const user = await User.create({
      name,
      username,
      email,
      password,
      role: 'user' // Default role
    });

    // Don't return password in response
    const userWithoutPassword = {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role
    };

    return NextResponse.json(
      { success: true, user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const errorMessage = field === 'email' 
        ? 'Email already in use' 
        : 'Username already taken';
      
      return NextResponse.json(
        { error: errorMessage, field },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
} 