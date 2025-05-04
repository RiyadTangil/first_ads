import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import mongoose from 'mongoose';
import Link from '@/models/Link';

// Define interfaces for link data
interface LinkData {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  impressions: number;
  clicks: number;
  ctr: number;
  cpm: number;
  revenue: number;
  createdAt: Date;
  updatedAt: Date;
}

// Handler for GET requests - Get user links
export async function GET(request: NextRequest) {
  try {
    // Get userId from query parameters
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // For mock purposes, let's return some sample data
    // In a real implementation, this would be fetched from a database
    
    // const mockLinks = [
    //   {
    //     _id: new mongoose.Types.ObjectId(),
    //     userId: new mongoose.Types.ObjectId(userId),
    //     name: 'Summer Promotion',
    //     url: 'https://example.com/promo1',
    //     status: 'pending',
    //     impressions: 0,
    //     clicks: 0,
    //     ctr: 0,
    //     cpm: 0,
    //     revenue: 0,
    //     createdAt: new Date('2023-06-15T08:30:00Z'),
    //     updatedAt: new Date('2023-06-15T08:30:00Z'),
    //     user: {
    //       _id: userId,
    //       name: 'John Doe',
    //       email: 'john@example.com'
    //     }
    //   },
    //   {
    //     _id: new mongoose.Types.ObjectId(),
    //     userId: new mongoose.Types.ObjectId(userId),
    //     name: 'Special Offer',
    //     url: 'https://example.com/special-offer',
    //     status: 'approved',
    //     impressions: 2430,
    //     clicks: 198,
    //     ctr: 8.15,
    //     cpm: 6.75,
    //     revenue: 16.40,
    //     createdAt: new Date('2023-06-10T10:15:00Z'),
    //     updatedAt: new Date('2023-06-10T10:15:00Z'),
    //     user: {
    //       _id: userId,
    //       name: 'John Doe',
    //       email: 'john@example.com'
    //     }
    //   }
    // ];

    // return NextResponse.json({ 
    //   links: mockLinks,
    //   success: true 
    // });
    
    // In a real implementation, we would do something like:
    

    
    // Query links that belong to the specified user
    const links = await Link.find({ userId })
      .populate('userId', 'name email') // Populate user details
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ 
      links,
      success: true 
    });
    
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json(
      { error: 'Failed to fetch links' },
      { status: 500 }
    );
  }
}

// Handler for POST requests - Create a new link
export async function POST(request: NextRequest) {
  try {
    const { userId, name, url } = await request.json();

    // Validate required fields
    if (!userId || !name || !url) {
      return NextResponse.json(
        { error: 'User ID, name, and URL are required' },
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

    // For mock purposes, let's return a created link
    // In a real implementation, this would be saved to a database
    
    const mockLink = {
      _id: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(userId),
      name,
      url,
      status: 'pending',
      impressions: 0,
      clicks: 0,
      ctr: 0,
      cpm: 0,
      revenue: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        _id: userId,
        name: 'John Doe',
        email: 'john@example.com'
      }
    };

    return NextResponse.json({ 
      link: mockLink,
      success: true 
    }, { status: 201 });
    
    /* In a real implementation, we would do something like:
    
    const Link = mongoose.models.Link || mongoose.model('Link', LinkSchema);
    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    
    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Create a new link with pending status
    const newLink = new Link({
      userId,
      name,
      url,
      status: 'pending',
      impressions: 0,
      clicks: 0,
      ctr: 0,
      cpm: 0,
      revenue: 0
    });
    
    await newLink.save();
    
    // Populate user details
    await newLink.populate('userId', 'name email');
    
    return NextResponse.json({ 
      link: newLink,
      success: true 
    }, { status: 201 });
    */
  } catch (error) {
    console.error('Error creating link:', error);
    return NextResponse.json(
      { error: 'Failed to create link' },
      { status: 500 }
    );
  }
} 