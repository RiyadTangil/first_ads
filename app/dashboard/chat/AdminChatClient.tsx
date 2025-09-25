'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatBubbleLeftRightIcon, UserCircleIcon, UserIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
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
  MessageResponse,
  User
} from '@/lib/chatService';
import AdminChatMessage from './AdminChatMessage';

interface AdminChatClientProps {}

// Helper function to convert API message to local MessageType
const convertToMessageType = (message: MessageResponse) => ({
  id: message._id,
  text: message.text,
  sender: message.senderType,
  timestamp: new Date(message.timestamp),
  read: message.read
});

interface UserWithConversation extends User {
  conversation?: ConversationResponse;
  unreadCount?: number;
}

export default function AdminChatClient({}: AdminChatClientProps) {
  const [users, setUsers] = useState<UserWithConversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ConversationResponse | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [admin, setAdmin] = useState<any>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Add debounce for mark as read
  const markMessagesReadDebounced = useRef<NodeJS.Timeout | null>(null);

  // Helper function to mark messages as read with debounce
  const markMessagesAsReadWithDebounce = (conversationId: string, userId: string) => {
    // Clear any existing timeout
    if (markMessagesReadDebounced.current) {
      clearTimeout(markMessagesReadDebounced.current);
    }
    
    // Set a new timeout
    markMessagesReadDebounced.current = setTimeout(async () => {
      try {
        await apiMarkAsRead(conversationId, userId);
      } catch (error) {
        console.error('Failed to mark messages as read:', error);
      }
    }, 1000); // 1 second debounce
  };

  // Get admin info on mount
  useEffect(() => {
    const userData = getUserFromLocalStorage();
    if (userData) {
      setAdmin(userData);
    } else {
      setError('Please log in to access the admin chat');
      setIsLoading(false);
    }
  }, []);

  // Fetch users
  useEffect(() => {
    async function fetchUsers() {
      if (!admin?.token || !admin?.id) {
        setError('Authentication required');
        setUsersLoading(false);
        setIsLoading(false);
        return;
      }
      
      try {
        setUsersLoading(true);
        const response = await fetch(`/api/user/list?adminId=${admin.id}`, {
          headers: {
            'Authorization': `Bearer ${admin.token}`
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch users');
        }
        
        const data = await response.json();
        
        if (!data.success || !data.users) {
          throw new Error('Invalid response format from server');
        }
        
        // Now get all conversations for the admin
        const conversations = await getConversations(admin.id, true);
        
        // Map conversations to users
        const enhancedUsers = data.users.map((user: UserWithConversation) => {
          const userConversation = conversations.find((conv: ConversationResponse) => 
            conv.participants.some((participant: User) => participant._id === user._id)
          );
          
          return {
            ...user,
            conversation: userConversation || undefined,
            unreadCount: userConversation?.unreadCount || 0
          };
        });
        
        setUsers(enhancedUsers);
        setUsersLoading(false);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError(error instanceof Error ? error.message : 'Failed to load users. Please try again later.');
        setUsersLoading(false);
        setIsLoading(false);
      }
    }
    
    if (admin?.id && admin?.token) {
      fetchUsers();
    }
  }, [admin?.id, admin?.token]);

  // Load messages when a user is selected
  useEffect(() => {
    async function loadMessages(userId: string) {
      // Prevent multiple simultaneous loading attempts
      if (isLoadingMessages) return;
      
      try {
        setIsLoadingMessages(true);
        setMessagesLoading(true);
        
        // Check if we already have a conversation with this user
        let conversation = users.find(u => u._id === userId)?.conversation;
        
        // If not, create a new conversation
        if (!conversation && admin?.id) {
          conversation = await createConversation(userId, admin.id);
        }
        
        if (!conversation) {
          setError('Failed to load or create conversation');
          setMessagesLoading(false);
          setIsLoadingMessages(false);
          return;
        }
        
        setCurrentConversation(conversation);
        
        // Get messages for this conversation
        const messagesData = await getMessages(conversation._id);
        setMessages(messagesData.map(convertToMessageType));
        
        // Mark all messages as read if user has unread messages
        if (admin?.id && conversation.unreadCount > 0) {
          markMessagesAsReadWithDebounce(conversation._id, admin.id);
          
          // Update the unread count for this user in the user list
          setUsers(prevUsers => 
            prevUsers.map(user => 
              user._id === userId 
                ? { ...user, unreadCount: 0 } 
                : user
            )
          );
        }
        
        setMessagesLoading(false);
        setIsLoadingMessages(false);
      } catch (err) {
        console.error('Failed to load messages:', err);
        setError('Failed to load messages. Please try again later.');
        setMessagesLoading(false);
        setIsLoadingMessages(false);
      }
    }
    
    if (selectedUserId) {
      loadMessages(selectedUserId);
    }

    // Clean up
    return () => {
      if (markMessagesReadDebounced.current) {
        clearTimeout(markMessagesReadDebounced.current);
      }
    };
  }, [selectedUserId, admin?.id]);

  // Set up polling for messages
  useEffect(() => {
    if (!currentConversation?._id || !admin?.id) return;
    
    // Clear any existing polling interval
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    // Set up new polling interval
    const interval = setInterval(async () => {
      try {
        // Fetch latest messages
        const messagesData = await getMessages(currentConversation._id);
        setMessages(messagesData.map(convertToMessageType));

        // Mark messages as read
        if (currentConversation.unreadCount > 0) {
          await apiMarkAsRead(currentConversation._id, admin.id);
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
  }, [currentConversation?._id, admin?.id]);

  // Handle message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentConversation?._id || !admin?.id) return;

    try {
      const message = await apiSendMessage(currentConversation._id, admin.id, newMessage, 'admin');
      setMessages(prev => [...prev, convertToMessageType(message)]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message. Please try again.');
    }
  };
  
  // Select the first user by default if none selected
  useEffect(() => {
    if (users.length > 0 && !selectedUserId && !usersLoading) {
      setSelectedUserId(users[0]._id);
    }
  }, [users, selectedUserId, usersLoading]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-152px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
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

  return (
    <div className="flex h-[calc(100vh-152px)] overflow-hidden bg-white rounded-lg shadow-lg">
      {/* User list */}
      <div className="w-80 border-r overflow-y-auto bg-gray-50">
        <div className="p-4 border-b bg-white sticky top-0 z-10 shadow-sm">
          <h2 className="font-semibold text-gray-800 text-lg">Client Conversations</h2>
          <div className="mt-3 relative">
            <input 
              type="text" 
              placeholder="Search users..." 
              className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <MagnifyingGlassIcon className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        {usersLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-gray-500 text-center">
            <div className="flex justify-center mb-3">
              <UserCircleIcon className="h-12 w-12 text-gray-300" />
            </div>
            <p className="font-medium">No users found</p>
            <p className="text-sm mt-1">There are no active conversations</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {users.map((user) => {
              const isSelected = user._id === selectedUserId;
              const hasUnread = (user.unreadCount || 0) > 0;
              
              return (
                <li key={user._id}>
                  <button
                    onClick={() => setSelectedUserId(user._id)}
                    className={`w-full text-left px-4 py-4 flex items-center gap-3 hover:bg-gray-100 transition-all duration-200
                      ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}
                      ${hasUnread ? 'font-semibold' : ''}`}
                  >
                    <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden flex-1">
                      <p className="truncate font-medium text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                    </div>
                    {hasUnread && (
                      <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-white bg-blue-600 rounded-full">
                        {user.unreadCount}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      
      {/* Chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedUserId ? (
          <>
            <div className="p-4 border-b flex justify-between items-center shadow-sm bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {users.find(u => u._id === selectedUserId)?.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800 text-lg">
                    {users.find(u => u._id === selectedUserId)?.name}
                  </h2>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500">
                      @{users.find(u => u._id === selectedUserId)?.username}
                    </p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white">
              {messagesLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-lg font-medium mb-2">No messages yet</p>
                  <p className="text-sm text-gray-400">Start the conversation with this client!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((message) => (
                    <AdminChatMessage key={message.id} message={message} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            <div className="p-4 border-t bg-white">
              <form onSubmit={handleSubmit} className="flex items-center gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || !currentConversation}
                  className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <span className="hidden sm:inline">Send</span>
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-gray-50">
            <div className="bg-white p-8 rounded-xl shadow-sm flex flex-col items-center max-w-md">
              <ChatBubbleLeftRightIcon className="h-16 w-16 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Admin Chat Console</h3>
              <p className="text-center text-gray-500 mb-6">Select a client from the list to start or continue a conversation</p>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-700 w-full">
                <p className="font-medium mb-1">💡 Quick Tip</p>
                <p>Messages sent here will appear in the client's floating chat interface!</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 