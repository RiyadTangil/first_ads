import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Conversation } from '@/lib/models/chat';
import User from '@/models/User';
import mongoose from 'mongoose';

/**
 * GET /api/chat/conversations
 * Get all conversations for the current user or all conversations for admin
 */
export async function GET(req: NextRequest) {
  try {
    // Get user data from the query parameters
    const userId = req.nextUrl.searchParams.get('userId');
    const isAdmin = req.nextUrl.searchParams.get('isAdmin') === 'true';
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Validate that the user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let query = {};
    
    // For regular users, only return their conversations
    if (!isAdmin) {
      query = { 
        participants: { $in: [new mongoose.Types.ObjectId(userId)] }
      };
    }

    // For admins, return all conversations (but we could add pagination later)
    const conversations = await Conversation.find(query)
      .populate({
        path: 'participants',
        select: 'name email username role'
      })
      .populate({
        path: 'lastMessage',
        select: 'text timestamp read senderType'
      })
      .sort({ updatedAt: -1 });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations',errorInfo:error },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chat/conversations
 * Create a new conversation
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, adminId } = await req.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if conversation already exists
    const participants = adminId 
      ? [new mongoose.Types.ObjectId(userId), new mongoose.Types.ObjectId(adminId)]
      : [new mongoose.Types.ObjectId(userId)];
      
    let conversation = await Conversation.findOne({
      participants: { $all: participants, $size: participants.length }
    });
    
    // If conversation doesn't exist, create it
    if (!conversation) {
      conversation = await Conversation.create({
        participants,
        unreadCount: 0
      });
      
      // Populate participants before returning
      await conversation.populate({
        path: 'participants',
        select: 'name email username role'
      });
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
} 