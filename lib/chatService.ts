import { getAPIClient } from './apiClient';

// Types
export interface User {
  _id: string;
  name: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
}

export interface MessageResponse {
  _id: string;
  text: string;
  sender: User;
  conversation: string;
  timestamp: string;
  read: boolean;
  senderType: 'user' | 'admin';
}

export interface ConversationResponse {
  _id: string;
  participants: User[];
  lastMessage?: MessageResponse;
  createdAt: string;
  updatedAt: string;
  unreadCount: number;
}

const apiClient = getAPIClient();

// Cache for messages
const messageCache: Record<string, { data: MessageResponse[], timestamp: number }> = {};
const CACHE_TTL = 5000; // 5 seconds

/**
 * Get all conversations for a user
 */
export async function getConversations(userId: string, isAdmin: boolean = false): Promise<ConversationResponse[]> {
  try {
    const response = await apiClient.get(`/api/chat/conversations?userId=${userId}&isAdmin=${isAdmin}`);
    return response.data.conversations;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
}

/**
 * Get messages for a conversation
 */
export const getMessages = async (conversationId: string): Promise<MessageResponse[]> => {
  try {
    // Check if we have a recent cache entry
    const cacheEntry = messageCache[conversationId];
    const now = Date.now();
    
    if (cacheEntry && (now - cacheEntry.timestamp < CACHE_TTL)) {
      console.log(`Using cached messages for conversation: ${conversationId}`);
      return cacheEntry.data;
    }
    
    // No cache or expired, make API call
    const response = await apiClient.get(`/api/chat/messages?conversationId=${conversationId}`);
    
    // Cache the response
    messageCache[conversationId] = {
      data: response.data.messages,
      timestamp: now
    };
    
    return response.data.messages;
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

/**
 * Create a new conversation
 */
export async function createConversation(userId: string, adminId?: string): Promise<ConversationResponse> {
  try {
    const response = await apiClient.post('/api/chat/conversations', { userId, adminId });
    return response.data.conversation;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
}

/**
 * Send a new message
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  text: string,
  senderType: 'user' | 'admin'
): Promise<MessageResponse> {
  try {
    const response = await apiClient.post('/api/chat/messages', {
      conversationId,
      senderId,
      text,
      senderType
    });
    return response.data.message;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(
  conversationId: string,
  userId: string
): Promise<{ success: boolean, messagesUpdated: number }> {
  try {
    const response = await apiClient.put('/api/chat/read', {
      conversationId,
      userId
    });
    return response.data;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
} 