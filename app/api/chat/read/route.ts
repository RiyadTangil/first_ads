import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Message, Conversation } from '@/lib/models/chat';
import mongoose from 'mongoose';

/**
 * PUT /api/chat/read
 * Mark messages as read for a specific conversation
 */
export async function PUT(req: NextRequest) {
  try {
    const { conversationId, userId } = await req.json();
    
    if (!conversationId || !userId) {
      return NextResponse.json(
        { error: 'Conversation ID and user ID are required' },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Check if conversation exists
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Mark messages as read where the recipient is the current user
    const result = await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: userId }, // Messages not sent by the current user
        read: false
      },
      { read: true }
    );

    // Reset unread count for this conversation
    await Conversation.findByIdAndUpdate(
      conversationId,
      { unreadCount: 0 }
    );

    return NextResponse.json({ 
      success: true, 
      messagesUpdated: result.modifiedCount 
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark messages as read' },
      { status: 500 }
    );
  }
} 