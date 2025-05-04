import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import mongoose from 'mongoose';
import User from '@/models/User';
import Link from '@/models/Link';

// Handler for GET requests - Get all users with link counts for admin
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
      
    // Get link counts for each user
    const userIds = users.map(user => user._id);
    
    // Aggregate link counts by user
    const linkCounts = await Link.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { 
        _id: '$userId', 
        count: { $sum: 1 },
        activeCount: { 
          $sum: { 
            $cond: [{ $in: ['$status', ['approved', 'pending']] }, 1, 0] 
          } 
        },
        totalImpressions: { $sum: '$impressions' },
        totalClicks: { $sum: '$clicks' },
        totalRevenue: { $sum: '$revenue' }
      }}
    ]);
    
    // Map counts to users
    const linkCountMap = new Map();
    linkCounts.forEach(item => {
      linkCountMap.set(item._id.toString(), {
        count: item.count,
        activeCount: item.activeCount,
        totalImpressions: item.totalImpressions,
        totalClicks: item.totalClicks,
        totalRevenue: item.totalRevenue
      });
    });
    
    // Add link counts to user objects
    const usersWithCounts = users.map(user => {
      const userObj = user.toObject();
      const stats = linkCountMap.get(user._id.toString()) || {
        count: 0,
        activeCount: 0,
        totalImpressions: 0,
        totalClicks: 0,
        totalRevenue: 0
      };
      
      return {
        ...userObj,
        linksCount: stats.count,
        activeLinksCount: stats.activeCount,
        totalImpressions: stats.totalImpressions,
        totalClicks: stats.totalClicks,
        totalRevenue: stats.totalRevenue
      };
    });
    
    return NextResponse.json({ 
      users: usersWithCounts,
      success: true 
    });
  } catch (error) {
    console.error('Error fetching users with link counts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
} 