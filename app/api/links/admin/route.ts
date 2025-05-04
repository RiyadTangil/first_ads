import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import mongoose from 'mongoose';
import Link from '@/models/Link';
import User from '@/models/User';

// Handler for GET requests - Get all links for admin
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
    
    // Query all links
    const links = await Link.find({})
      .populate('userId', 'name email') // Populate user details
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ 
      links,
      success: true 
    });
  } catch (error) {
    console.error('Error fetching links for admin:', error);
    return NextResponse.json(
      { error: 'Failed to fetch links' },
      { status: 500 }
    );
  }
} 