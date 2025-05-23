import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import mongoose from 'mongoose';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

/**
 * GET /api/user/list
 * Get all users (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Get adminId from query parameters
    const searchParams = request.nextUrl.searchParams;
    const adminId = searchParams.get('adminId');

    if (!adminId) {
      return NextResponse.json(
        { error: 'Admin ID is required' },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();
    
    // Check if admin user exists and has admin role
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }
    
    // Query all users except admins
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('_id name email username role createdAt')
      .sort({ name: 1 });
    
    return NextResponse.json({ 
      users,
      success: true 
    });
  } catch (error) {
    console.error('Error fetching users for admin:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
} 