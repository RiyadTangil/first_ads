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
import { 
  ensureSocketConnected, 
  joinUserRoom,
  joinConversation, 
  leaveConversation, 
  sendSocketMessage, 
  markMessagesReadSocket
} from '@/lib/socketClient';

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
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get user info on mount
  useEffect(() => {
    const userData = getUserFromLocalStorage();
    if (userData) {
      setUser(userData);
    } else {
      setError("Please log in to use the chat feature");
      setLoading(false);
    }
    
    // Set up polling for new messages
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Initialize Socket.IO
  useEffect(() => {
    // Set up Socket.IO listeners
    let socket: any = null;
    let isSocketInitialized = false;
    
    const setupSocketListeners = async () => {
      try {
        // Get the socket connection
        socket = await ensureSocketConnected();
        
        // Join user room if we have user data
        if (user?.id) {
          await joinUserRoom(user.id, user.role || 'user');
        }
        
        // Listen for new messages
        socket.on('receive_message', (message: any) => {
          // Convert the message to our format and add it to the messages state
          // Only update if we're currently viewing this conversation
          if (conversation?._id === message.conversation) {
            setMessages(prev => {
              // Check if message already exists in the list to avoid duplicates
              const messageExists = prev.some(msg => msg.id === message._id);
              if (messageExists) {
                return prev;
              }
              return [...prev, convertToMessageType(message)];
            });
            
            // Mark message as read if it's from an admin
            if (message.senderType === 'admin' && user?.id) {
              markMessagesAsRead(message.conversation, user.id).catch(console.error);
              markMessagesReadSocket(message.conversation, user.id).catch(console.error);
            }
          }
        });
        
        // Listen for read receipts
        socket.on('messages_read', ({ conversationId, userId }: any) => {
          // Update messages to show as read
          if (conversation?._id === conversationId) {
            setMessages(prev => 
              prev.map(msg => 
                msg.sender === 'user' ? { ...msg, read: true } : msg
              )
            );
          }
        });
        
        isSocketInitialized = true;
      } catch (err) {
        console.error('Failed to initialize socket:', err);
      }
    };
    
    setupSocketListeners();
    
    // Clean up on unmount
    return () => {
      if (socket && isSocketInitialized) {
        socket.off('receive_message');
        socket.off('messages_read');
        
        // Leave conversation room if we were in one
        if (conversation?._id) {
          leaveConversation(conversation._id).catch(console.error);
        }
      }
    };
  }, [conversation?._id, user?.id]);

  // Join conversation room when the conversation changes
  useEffect(() => {
    if (conversation?._id) {
      // Join the conversation room to receive messages
      joinConversation(conversation._id);
    }
    
    return () => {
      if (conversation?._id) {
        // Leave the conversation room when we change conversations
        leaveConversation(conversation._id);
      }
    };
  }, [conversation?._id]);

  // Update loadOrCreateConversation function to remove polling
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
        await markMessagesAsRead(currentConversation._id, user.id);
        markMessagesReadSocket(currentConversation._id, user.id);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading conversation:', err);
        setError('Unable to connect to chat. Please try again later.');
        setLoading(false);
      }
    }
    
    if (user?.id) {
      loadOrCreateConversation();
    }
  }, [user?.id]);

  // Update handleSubmit to use Socket.IO
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!conversation?._id || !user?.id || !newMessage.trim()) return;
    
    try {
      // Send message to API
      const sentMessage = await sendMessage(
        conversation._id,
        user.id,
        newMessage,
        'user'
      );
      
      // Add the message to UI
      setMessages(prev => [...prev, convertToMessageType(sentMessage)]);
      setNewMessage('');
      
      // Send the message via Socket.IO
      sendSocketMessage(conversation._id, sentMessage);
      
      // Force scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message. Please try again.');
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex flex-col bg-white rounded-lg shadow-xl w-80 sm:w-96 h-96 border border.gray-200">
        <div className="flex items-center justify-between bg-blue-600 text-white p-4 rounded-t-lg">
          <h3 className="font-medium">Support Chat</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col bg-white rounded-lg shadow-xl w-80 sm:w-96 h-96 border border-gray-200">
        <div className="flex items-center justify-between bg-blue-600 text-white p-4 rounded-t-lg">
          <h3 className="font-medium">Support Chat</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-red-600 mb-3">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white rounded-lg shadow-xl w-80 sm:w-96 h-96 border border-gray-200">
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <ChatBubbleLeftRightIcon className="h-5 w-5" />
          </div>
          <h3 className="font-medium">Client Support</h3>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors p-1"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col h-full items-center justify-center text-center p-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-gray-500 font-medium mb-2">
              Welcome to Support Chat
            </p>
            <p className="text-gray-400 text-sm">
              How can we help you today? Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat; 