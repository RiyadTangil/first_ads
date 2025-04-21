import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

/**
 * GET /api/user/list
 * Get all users (admin only)
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
    
    // Connect to the database first to ensure we're ready to query
    await connectToDatabase();

    // Verify token and role
    let userId;
    let userRole;
    
    try {
      // Use the same secret as in your auth configuration
      const decoded = jwt.verify(
        token, 
        process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production"
      ) as any;
      
      userId = decoded.id || decoded.sub;
      userRole = decoded.role;
      
      // Check if role exists in token
      if (!userRole) {
        // If not in token, try to get from database as fallback
        const user = await User.findById(userId).select('role');
        if (user) {
          userRole = user.role;
        }
      }
      
      // Verify admin role
      if (userRole !== 'admin') {
        return NextResponse.json(
          { error: 'Forbidden - Admin access required' },
          { status: 403 }
        );
      }
    } catch (tokenError) {
      console.error('Token verification error:', tokenError);
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }
    
    // Get all users, excluding sensitive fields
    const users = await User.find({})
      .select('name email username role createdAt')
      .sort({ createdAt: -1 });
    
    console.log(`Fetched ${users.length} users for admin`);
    
    return NextResponse.json({ 
      users,
      count: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users',errorInfo:error },
      { status: 500 }
    );
  }
} 