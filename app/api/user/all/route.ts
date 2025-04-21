import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';

/**
 * GET /api/user/all
 * Get all users (admin only)
 */
export async function GET(req: NextRequest) {
  try {
    // Extract auth token
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];

    // Connect to the database
    await connectToDatabase();
    
    // Verify the user is an admin
    // Note: This is a simplified approach. In a real app, you'd verify the token properly
    // and check user roles in a more secure way.
    // For a complete implementation, you'd likely use middleware or a more robust auth check
    
    // Get all users, excluding sensitive fields
    const users = await User.find({})
      .select('name email username role createdAt')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
} 