// Message type
export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

// User type for chat
export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  role: 'user' | 'admin';
  lastActive?: string;
}

// Chat conversation type
export interface Conversation {
  id: string;
  participants: string[]; // user IDs
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
  unreadCount: number;
} 