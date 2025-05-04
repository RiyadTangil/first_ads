import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import mongoose from 'mongoose';
import Link from '@/models/Link';
import User from '@/models/User';

// Handler for PUT requests - Unpm run devpdate link status
export async function PUT(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {
    const { linkId } = params;
    const { status, adminId } = await request.json();

    // Validate required fields
    if (!linkId || !status || !adminId) {
      return NextResponse.json(
        { error: 'Link ID, status, and admin ID are required' },
        { status: 400 }
      );
    }

    // Validate status
    if (status !== 'approved' && status !== 'rejected') {
      return NextResponse.json(
        { error: 'Status must be either "approved" or "rejected"' },
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
    
    // Find and update the link
    const link = await Link.findById(linkId);
    
    if (!link) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }
    
    // Update the link status
    link.status = status;
    link.updatedAt = new Date();
    
    // If approving, set initial performance metrics to 0
    if (status === 'approved' && link.status !== 'approved') {
      link.impressions = 0;
      link.clicks = 0;
      link.ctr = 0;
      link.cpm = 0;
      link.revenue = 0;
    }
    
    await link.save();
    
    return NextResponse.json({ 
      success: true,
      message: `Link has been ${status}`,
      linkId,
      status
    });
  } catch (error) {
    console.error('Error updating link status:', error);
    return NextResponse.json(
      { error: 'Failed to update link status' },
      { status: 500 }
    );
  }
} 