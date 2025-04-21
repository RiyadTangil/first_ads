import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

/**
 * GET /api/user/admins
 * Get all admin users
 */
export async function GET(req: NextRequest) {
  try {
    // Extract auth token
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing or invalid token format' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    
    // Connect to the database
    await connectToDatabase();
    
    // Verify token for basic authentication
    try {
      jwt.verify(
        token, 
        process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production"
      );
    } catch (tokenError) {
      console.error('Token verification error:', tokenError);
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }
    
    // Get all admin users, excluding sensitive fields
    const admins = await User.find({ role: 'admin' })
      .select('_id name email username')
      .sort({ createdAt: -1 });
    
    console.log(`Fetched ${admins.length} admin users`);
    
    return NextResponse.json({ 
      admins,
      count: admins.length 
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admins' },
      { status: 500 }
    );
  }
} 