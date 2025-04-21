'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatBubbleLeftRightIcon, ClockIcon } from '@heroicons/react/24/outline';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import ChatMessage from '@/components/chat/ChatMessage';
import { formatDistanceToNow } from 'date-fns';
import { getUserFromLocalStorage } from '@/lib/localStorage';
import { 
  getConversations, 
  getMessages, 
  sendMessage as apiSendMessage, 
  markMessagesAsRead as apiMarkAsRead,
  createConversation,
  ConversationResponse,
  MessageResponse
} from '@/lib/chatService';
import { 
  initSocketClient,
  joinUserRoom,
  joinConversation,
  leaveConversation,
  sendSocketMessage,
  markMessagesReadSocket,
  onReceiveMessage,
  onMessagesRead
} from '@/lib/socketClient';

interface ChatClientProps {}

// Helper function to convert API message to local MessageType
const convertToMessageType = (message: MessageResponse) => ({
  id: message._id,
  text: message.text,
  sender: message.senderType,
  timestamp: new Date(message.timestamp),
  read: message.read
});

export default function ChatClient({}: ChatClientProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [conversation, setConversation] = useState<ConversationResponse | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<any>(null);
  const [admins, setAdmins] = useState<any[]>([]);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  
  // Calculate chat stats
  const lastMessageTime = messages.length > 0 ? messages[messages.length - 1].timestamp : new Date();
  const firstMessageTime = messages.length > 0 ? messages[0].timestamp : new Date();

  // Get user info on mount
  useEffect(() => {
    const userData = getUserFromLocalStorage();
    if (userData) {
      setUser(userData);
      
      // Initialize socket connection
      initSocketClient()
        .then(() => {
          // Join user room
          return joinUserRoom(userData.id, userData.role || 'user');
        })
        .catch(err => {
          console.error('Failed to initialize socket:', err);
        });
    }
  }, []);
  
  // Fetch available admins
  useEffect(() => {
    async function fetchAdmins() {
      if (!user?.token) return;
      
      try {
        const response = await fetch('/api/user/admins', {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch admins');
        }
        
        const data = await response.json();
        setAdmins(data.admins || []);
      } catch (error) {
        console.error('Error fetching admins:', error);
      }
    }
    
    if (user?.id) {
      fetchAdmins();
    }
  }, [user?.id, user?.token]);

  // Load conversation on mount
  useEffect(() => {
    async function loadConversation() {
      try {
        if (!user?.id) return;
        
        setIsLoading(true);

        // First get or create a conversation with an admin
        const conversationsData = await getConversations(user.id);
        
        let currentConversation;
        if (Array.isArray(conversationsData) && conversationsData.length > 0) {
          // Use the first conversation
          currentConversation = conversationsData[0];
        } else {
          // Find an admin to start a conversation with
          if (admins.length > 0) {
            setIsCreatingConversation(true);
            // Create conversation with the first available admin
            currentConversation = await createConversation(user.id, admins[0]._id);
            setIsCreatingConversation(false);
          } else {
            // No admin available, don't create a conversation yet
            setIsLoading(false);
            return;
          }
        }
        
        setConversation(currentConversation);
        
        // Then load messages for that conversation
        const messagesData = await getMessages(currentConversation._id);
        setMessages(messagesData.map(convertToMessageType));
        
        // Mark messages as read
        if (user.id) {
          await apiMarkAsRead(currentConversation._id, user.id);
          await markMessagesReadSocket(currentConversation._id, user.id);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load conversation:', err);
        setError('Failed to load your conversation. Please try again later.');
        setIsLoading(false);
      }
    }

    if (user?.id && admins.length > 0) {
      loadConversation();
    }
  }, [user?.id, admins]);

  // Set up socket event listeners
  useEffect(() => {
    if (!conversation?._id) return;
    
    // Set up listeners for the current conversation
    const removeMessageListener = onReceiveMessage(async (message) => {
      // Only update if the message is for the current conversation
      if (conversation._id === message.conversation) {
        setMessages(prev => [...prev, convertToMessageType(message)]);
        
        // Mark message as read if it's from an admin
        if (message.senderType === 'admin' && user?.id) {
          await apiMarkAsRead(message.conversation, user.id);
          await markMessagesReadSocket(message.conversation, user.id);
        }
      }
    });
    
    // Set up listener for read receipts
    const removeReadListener = onMessagesRead(({ conversationId, userId }) => {
      // Update messages to show as read
      if (conversation._id === conversationId) {
        setMessages(prev => 
          prev.map(msg => 
            msg.sender === 'user' ? { ...msg, read: true } : msg
          )
        );
      }
    });
    
    // Join the conversation room
    joinConversation(conversation._id);
    
    // Clean up
    return () => {
      removeMessageListener();
      removeReadListener();
      
      // Leave the conversation room
      if (conversation._id) {
        leaveConversation(conversation._id);
      }
    };
  }, [conversation?._id, user?.id]);

  // Handle message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!conversation?._id || !user?.id || newMessage.trim() === '') return;
    
    try {
      // Send the message via API
      const sentMessage = await apiSendMessage(
        conversation._id,
        user.id,
        newMessage,
        'user'
      );
      
      // Add the message to the UI
      setMessages(prev => [...prev, convertToMessageType(sentMessage)]);
      setNewMessage('');
      
      // Send the message via Socket.IO
      await sendSocketMessage(conversation._id, sentMessage);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading || isCreatingConversation) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-350px)]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-3"></div>
          <p className="text-gray-500 text-sm">
            {isCreatingConversation ? 'Creating new conversation...' : 'Loading your conversation...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="mt-2 text-sm underline">
          Try again
        </button>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">No support agents available</h2>
        <p className="text-gray-600 mb-4">
          There are currently no support agents available to chat with. Please check back later.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-350px)]">
      <div className="bg-white rounded-lg shadow-md p-4 flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 border-b pb-4 mb-4">
          <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600" />
          <h2 className="font-semibold text-gray-800">Chat History</h2>
        </div>
        
        <div className="overflow-y-auto flex-1 pr-2">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No messages yet. Start a conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        <div className="pt-4 mt-auto border-t">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4 w-full md:w-72">
        <div className="flex items-center gap-2 border-b pb-4 mb-4">
          <ClockIcon className="h-5 w-5 text-blue-600" />
          <h2 className="font-semibold text-gray-800">Recent Activity</h2>
        </div>
        
        <div className="space-y-4">
          <div className="text-sm">
            <p className="text-gray-600">Last message:</p>
            <p className="font-medium">
              {messages.length > 0 
                ? formatDistanceToNow(lastMessageTime) + ' ago'
                : 'No messages yet'
              }
            </p>
          </div>
          
          <div className="text-sm">
            <p className="text-gray-600">Conversation started:</p>
            <p className="font-medium">
              {messages.length > 0 
                ? formatDistanceToNow(firstMessageTime) + ' ago'
                : 'No messages yet'
              }
            </p>
          </div>
          
          <div className="text-sm">
            <p className="text-gray-600">Total messages:</p>
            <p className="font-medium">{messages.length}</p>
          </div>
          
          <div className="border-t pt-4 mt-4">
            <h3 className="font-medium text-gray-800 mb-2">Support Team</h3>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xs font-medium">CS</span>
              </div>
              <div>
                <p className="text-sm font-medium">Customer Support</p>
                <p className="text-xs text-gray-500">Available 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 