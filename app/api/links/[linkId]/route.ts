import { NextRequest, NextResponse } from 'next/server';

import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { calculateRevenue } from '@/lib/utils';
import Link from '@/models/Link';
import User from '@/models/User';

// PUT handler for updating a link
export async function PUT(
  req: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {
    // Await params to ensure it's fully resolved
    const linkId = params.linkId;
    const { 
      adminId, 
      userId, 
      name, 
      url, 
      status, 
      impressions, 
      clicks, 
      cpm 
    } = await req.json();
    
    // Validate the request body
    if (!adminId) {
      return NextResponse.json(
        { error: 'Admin ID is required' },
        { status: 400 }
      );
    }
    
    if (!name || !url || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
   connectToDatabase();

    // Verify admin privileges
    const admin = await User.findOne({
      _id: new ObjectId(adminId),
      role: 'admin'
    });
  
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin privileges required.' },
        { status: 401 }
      );
    }
    
    // Check if the link exists
    const existingLink = await Link.findOne({
      _id: new ObjectId(linkId)
    });
    
    if (!existingLink) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }
    
    // Calculate the CTR and revenue based on provided metrics
    const ctr = clicks && impressions ? (clicks / impressions) * 100 : 0;
    const revenue = calculateRevenue(impressions, cpm);
    
    // Update the link

    const result = await Link.updateOne(
      { _id: new ObjectId(linkId) },
      { 
        $set: { 
          name,
          url,
          userId: new ObjectId(userId._id),
          status,
          impressions: parseInt(impressions) || 0,
          clicks: parseInt(clicks) || 0,
          ctr,
          cpm: parseFloat(cpm) || 0,
          revenue,
          updatedAt: new Date()
        } 
      }
    );
    console.log(result)
    if (!result.modifiedCount) {
      return NextResponse.json(
        { error: 'Failed to update link' },
        { status: 500 }
      );
    }
    
    // Get the updated link with user info
    const updatedLink = await Link.aggregate([
      { $match: { _id: new ObjectId(linkId) } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          name: 1,
          url: 1,
          userId: 1,
          status: 1,
          impressions: 1,
          clicks: 1,
          ctr: 1,
          cpm: 1,
          revenue: 1,
          createdAt: 1,
          updatedAt: 1,
          'user._id': 1,
          'user.name': 1,
          'user.email': 1
        }
      }
    ]);
    
    return NextResponse.json({
      message: 'Link updated successfully',
      link: updatedLink[0]
    });
    
  } catch (error) {
    console.error('Error updating link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE handler for deleting a link
export async function DELETE(
  req: NextRequest,
  { params }: { params: { linkId: string } }
) {
  
  try {
    // Await params to ensure it's fully resolved
    const linkId = params.linkId;
    const { adminId } = await req.json();
    
    // Validate the request
    if (!adminId) {
      return NextResponse.json(
        { error: 'Admin ID is required' },
        { status: 400 }
      );
    }
    
  
    
    // Verify admin privileges
    const admin = await User.findOne({
      _id: new ObjectId(adminId),
      role: 'admin'
    });
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin privileges required.' },
        { status: 401 }
      );
    }
    
    // Check if the link exists
    const existingLink = await Link.findOne({
      _id: new ObjectId(linkId)
    });
    
    if (!existingLink) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }
    
    // Delete the link
    const result = await Link.deleteOne({
      _id: new ObjectId(linkId)
    });
    
    if (!result.deletedCount) {
      return NextResponse.json(
        { error: 'Failed to delete link' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Link deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 