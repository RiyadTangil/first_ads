'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatBubbleLeftRightIcon, UserCircleIcon, UserIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import ChatMessage, { MessageType } from '@/components/chat/ChatMessage';
import { v4 as uuidv4 } from 'uuid';
import { formatDistanceToNow } from 'date-fns';

// Dummy user data for admin interface
const dummyUsers = [
  {
    id: 'user1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: null,
    lastActive: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    unread: 2,
  },
  {
    id: 'user2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    avatar: null,
    lastActive: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    unread: 0,
  },
  {
    id: 'user3',
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    avatar: null,
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    unread: 1,
  },
  {
    id: 'user4',
    name: 'Sarah Williams',
    email: 'sarah.williams@example.com',
    avatar: null,
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    unread: 0,
  },
  {
    id: 'user5',
    name: 'Robert Brown',
    email: 'robert.brown@example.com',
    avatar: null,
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    unread: 0,
  },
];

// Mock message data per user
const userMessages: Record<string, MessageType[]> = {
  user1: [
    {
      id: '1',
      text: 'Hello! I need help with my account.',
      sender: 'user',
      timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      read: true,
    },
    {
      id: '2',
      text: 'I can help you with that. What seems to be the issue?',
      sender: 'admin',
      timestamp: new Date(Date.now() - 1000 * 60 * 55), // 55 minutes ago
      read: true,
    },
    {
      id: '3',
      text: 'I cannot reset my password.',
      sender: 'user',
      timestamp: new Date(Date.now() - 1000 * 60 * 50), // 50 minutes ago
      read: true,
    },
    {
      id: '4',
      text: 'Have you tried using the "Forgot Password" link on the login page?',
      sender: 'admin',
      timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
      read: true,
    },
    {
      id: '5',
      text: 'Yes, but I never receive the email.',
      sender: 'user',
      timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
      read: false,
    },
  ],
  user2: [
    {
      id: '1',
      text: 'Hi there, I have a billing question.',
      sender: 'user',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: true,
    },
    {
      id: '2',
      text: 'I see you were charged twice this month. Let me fix that for you.',
      sender: 'admin',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5), // 1.5 hours ago
      read: true,
    },
    {
      id: '3',
      text: 'Thank you! That would be great.',
      sender: 'user',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.4), // 1.4 hours ago
      read: true,
    },
  ],
  user3: [
    {
      id: '1',
      text: 'I need to cancel my subscription.',
      sender: 'user',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      read: true,
    },
    {
      id: '2',
      text: 'I can help with that. May I ask why you want to cancel?',
      sender: 'admin',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4.8), // 4.8 hours ago
      read: true,
    },
    {
      id: '3',
      text: 'It\'s too expensive for me right now.',
      sender: 'user',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      read: false,
    },
  ],
  user4: [
    {
      id: '1',
      text: 'How do I upgrade my plan?',
      sender: 'user',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 13), // 13 hours ago
      read: true,
    },
    {
      id: '2',
      text: 'You can upgrade from your account settings page. Go to Settings > Plans.',
      sender: 'admin',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12.5), // 12.5 hours ago
      read: true,
    },
  ],
  user5: [
    {
      id: '1',
      text: 'When will the new features be released?',
      sender: 'user',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25), // 25 hours ago
      read: true,
    },
    {
      id: '2',
      text: 'We\'re planning to release them next month. You\'ll get a notification when they\'re available.',
      sender: 'admin',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24.5), // 24.5 hours ago
      read: true,
    },
  ],
};

interface AdminChatClientProps {
  initialMessages?: MessageType[];
}

export default function AdminChatClient({ initialMessages = [] }: AdminChatClientProps) {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageType[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Filter users based on search term
  const filteredUsers = dummyUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Set messages when user is selected
  useEffect(() => {
    if (selectedUser && userMessages[selectedUser]) {
      setMessages(userMessages[selectedUser]);
    } else {
      setMessages([]);
    }
  }, [selectedUser]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser || newMessage.trim() === '') return;
    
    // Add admin message
    const adminMessage: MessageType = {
      id: uuidv4(),
      text: newMessage,
      sender: 'admin',
      timestamp: new Date(),
      read: true,
    };
    
    setMessages((prev) => [...prev, adminMessage]);
    setNewMessage('');
    
    // Update user message history
    if (userMessages[selectedUser]) {
      userMessages[selectedUser] = [...userMessages[selectedUser], adminMessage];
    }
  };

  const selectUser = (userId: string) => {
    setSelectedUser(userId);
    
    // Mark messages as read when selecting a user
    if (userMessages[userId]) {
      const updatedMessages = userMessages[userId].map(msg => ({
        ...msg,
        read: true
      }));
      userMessages[userId] = updatedMessages;
      
      // Update the unread count for this user
      const userIndex = dummyUsers.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        dummyUsers[userIndex].unread = 0;
      }
    }
  };

  return (
    <div className="flex h-[calc(100vh-200px)]">
      {/* User list */}
      <div className="w-64 border-r border-gray-200 flex flex-col bg-white rounded-l-lg shadow-md">
        <div className="p-2 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-8 pr-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <MagnifyingGlassIcon className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        <div className="overflow-y-auto flex-1">
          {filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No users found</div>
          ) : (
            filteredUsers.map(user => (
              <div
                key={user.id}
                onClick={() => selectUser(user.id)}
                className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedUser === user.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center">
                  <div className="relative">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-gray-500" />
                      </div>
                    )}
                    {user.unread > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                        {user.unread}
                      </span>
                    )}
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(user.lastActive, { addSuffix: true })}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-white rounded-r-lg shadow-md">
        {selectedUser ? (
          <>
            {/* Chat header */}
            <div className="p-3 border-b border-gray-200 flex items-center">
              <div className="mr-2">
                {dummyUsers.find(u => u.id === selectedUser)?.avatar ? (
                  <img 
                    src={dummyUsers.find(u => u.id === selectedUser)?.avatar || ''} 
                    alt={dummyUsers.find(u => u.id === selectedUser)?.name || 'User'} 
                    className="w-8 h-8 rounded-full" 
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-gray-500" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-sm">
                  {dummyUsers.find(u => u.id === selectedUser)?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500">
                  {dummyUsers.find(u => u.id === selectedUser)?.email || ''}
                </p>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              <div className="space-y-4">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            {/* Message input */}
            <div className="p-3 border-t border-gray-200">
              <form onSubmit={handleSubmit} className="flex items-center">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your reply..."
                  className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 text-white p-2 rounded-r-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
            <div className="text-center">
              <UserCircleIcon className="h-16 w-16 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-800 mb-1">Select a user</h3>
              <p className="text-gray-500 text-sm max-w-md">
                Choose a user from the list to view their conversation and respond to their messages.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 