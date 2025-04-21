import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Message, Conversation } from '@/lib/models/chat';
import User from '@/models/User';
import mongoose from 'mongoose';

/**
 * GET /api/chat/messages
 * Get messages for a specific conversation
 */
export async function GET(req: NextRequest) {
  try {
    // Get conversation ID from query parameters
    const conversationId = req.nextUrl.searchParams.get('conversationId');
    
    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
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

    // Get messages for the conversation
    const messages = await Message.find({ conversation: conversationId })
      .populate({
        path: 'sender',
        select: 'name email username role'
      })
      .sort({ timestamp: 1 });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chat/messages
 * Send a new message in a conversation
 */
export async function POST(req: NextRequest) {
  try {
    const { conversationId, senderId, text, senderType } = await req.json();
    
    if (!conversationId || !senderId || !text || !senderType) {
      return NextResponse.json(
        { error: 'Conversation ID, sender ID, text, and sender type are required' },
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

    // Check if sender is a participant in the conversation
    const isSenderInConversation = conversation.participants.some(
      (participantId: mongoose.Types.ObjectId) => 
        participantId.toString() === senderId
    );
    
    if (!isSenderInConversation) {
      return NextResponse.json(
        { error: 'Sender is not a participant in this conversation' },
        { status: 403 }
      );
    }

    // Create the new message
    const newMessage = await Message.create({
      conversation: conversationId,
      sender: senderId,
      text,
      timestamp: new Date(),
      read: false,
      senderType
    });

    // Update the conversation with the last message and increment unread count 
    // for the other participants
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: newMessage._id,
      $inc: { unreadCount: 1 },
      updatedAt: new Date()
    });

    // Populate the sender information
    await newMessage.populate({
      path: 'sender',
      select: 'name email username role'
    });

    return NextResponse.json({ message: newMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
} 