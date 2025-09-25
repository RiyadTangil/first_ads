'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import ChatMessage from './ChatMessage';
import { getUserFromLocalStorage } from '@/lib/localStorage';
import { 
  getConversations, 
  getMessages, 
  sendMessage, 
  markMessagesAsRead,
  createConversation,
  MessageResponse
} from '@/lib/chatService';

interface ChatProps {
  onClose?: () => void;
}

// Helper function to convert API message to local MessageType
const convertToMessageType = (message: MessageResponse) => ({
  id: message._id,
  text: message.text,
  sender: message.senderType,
  timestamp: new Date(message.timestamp),
  read: message.read
});

const Chat: React.FC<ChatProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [conversation, setConversation] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Get user info on mount
  useEffect(() => {
    const userData = getUserFromLocalStorage();
    if (userData) {
      setUser(userData);
    } else {
      setError("Please log in to use the chat feature");
      setLoading(false);
    }
  }, []);

  // Load or create conversation
  useEffect(() => {
    async function loadOrCreateConversation() {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // First check if user has any existing conversations
        const conversations = await getConversations(user.id);
        
        let currentConversation;
        if (Array.isArray(conversations) && conversations.length > 0) {
          // Use the first existing conversation
          currentConversation = conversations[0];
        } else {
          // Get available admins
          const response = await fetch('/api/user/admins', {
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch admin users');
          }
          
          const { admins } = await response.json();
          
          if (!admins || admins.length === 0) {
            setError('No support agents are available at the moment. Please try again later.');
            setLoading(false);
            return;
          }
          
          // Create a new conversation with the first available admin
          currentConversation = await createConversation(user.id, admins[0]._id);
        }
        
        setConversation(currentConversation);
        
        // Load messages for the conversation
        const messagesData = await getMessages(currentConversation._id);
        setMessages(messagesData.map(convertToMessageType));
        
        // Mark all messages as read
        if (currentConversation.unreadCount > 0) {
          await markMessagesAsRead(currentConversation._id, user.id);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading conversation:', error);
        setError('Failed to load conversation. Please try again later.');
        setLoading(false);
      }
    }

    if (user?.id) {
      loadOrCreateConversation();
    }
  }, [user?.id]);

  // Set up polling for messages
  useEffect(() => {
    if (!conversation?._id || !user?.id) return;

    // Clear any existing polling interval
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    // Set up new polling interval
    const interval = setInterval(async () => {
      try {
        // Fetch latest messages
        const messagesData = await getMessages(conversation._id);
        
        // Check if we have new messages
        const currentMessageIds = new Set(messages.map(m => m.id));
        const hasNewMessages = messagesData.some(m => !currentMessageIds.has(m._id));
        
        if (hasNewMessages) {
          setMessages(messagesData.map(convertToMessageType));
          
          // Mark messages as read if there are unread messages
          const unreadCount = messagesData.filter(m => !m.read && m.senderType === 'admin').length;
          if (unreadCount > 0) {
            await markMessagesAsRead(conversation._id, user.id);
          }
        }
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    }, 3000); // Poll every 3 seconds

    setPollingInterval(interval);

    // Cleanup
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [conversation?._id, user?.id, messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversation?._id || !user?.id) return;

    try {
      const message = await sendMessage(conversation._id, user.id, newMessage.trim(), 'user');
      setMessages(prev => [...prev, convertToMessageType(message)]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-sm underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-[380px] h-[400px] bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
      <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-blue-500 to-blue-600">
        <div className="flex items-center">
          <div className="bg-white/10 rounded-lg p-2 mr-3">
            <ChatBubbleLeftRightIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Support Chat</h2>
            <p className="text-xs text-blue-100">We typically reply within 5 minutes</p>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 min-h-0 bg-gray-50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="bg-blue-100 rounded-full p-3 mb-3">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-gray-800 font-medium mb-1">Welcome to FastyAds Support</h3>
            <p className="text-sm text-gray-500">How can we help you today? Send us a message and we'll get back to you as soon as possible.</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500 transition-colors"
            title="Send message"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </form>

      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
            <p className="text-sm text-gray-600">Loading chat...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat; 