import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import mongoose from 'mongoose';
import Link from '@/models/Link';
import User from '@/models/User';

// Handler for POST requests - Admin creates a link for a user
export async function POST(request: NextRequest) {
  try {
    const {
      adminId,
      userId,
      name,
      url,
      status = 'approved',
      impressions = 0,
      clicks = 0,
      cpm = 0
    } = await request.json();

    // Validate required fields
    if (!adminId || !userId || !name || !url) {
      return NextResponse.json(
        { error: 'Admin ID, User ID, name, and URL are required' },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status !== 'approved' && status !== 'pending' && status !== 'rejected') {
      return NextResponse.json(
        { error: 'Status must be either "approved", "pending", or "rejected"' },
        { status: 400 }
      );
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Check if admin exists and has admin role
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Count existing active links for the user
    const activeLinksCount = await Link.countDocuments({
      userId,
      status: { $in: ['approved', 'pending'] }
    });

    // Check if user has reached the maximum limit of 5 links
    if (activeLinksCount >= 5) {
      return NextResponse.json(
        { error: 'User has reached the maximum limit of 5 active links' },
        { status: 400 }
      );
    }

    // Calculate metrics if impressions are provided
    let ctr = 0;
    let revenue = 0;

    if (impressions > 0) {
      ctr = clicks > 0 ? (clicks / impressions) * 100 : 0;
      revenue = (impressions / 1000) * cpm;
    }

    // Create a new link with the specified status (default: approved)
    const newLink = new Link({
      userId,
      name,
      url,
      status,
      impressions: Number(impressions),
      clicks: Number(clicks),
      ctr,
      cpm: Number(cpm),
      revenue
    });

    await newLink.save();

    // Populate user details
    await newLink.populate('userId', 'name email');

    return NextResponse.json({
      link: newLink,
      success: true
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating link by admin:', error);
    return NextResponse.json(

      { error: error || 'Failed to create link' },
      { status: 500 }
    );
  }
} 