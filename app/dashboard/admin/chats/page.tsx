'use client';

import { useState } from 'react';
import { ChatUser, Conversation, Message } from '@/types/chat';
import { formatDistanceToNow } from 'date-fns';

// Dummy data for admin chat interface
const dummyUsers: ChatUser[] = [
  {
    id: 'user-1',
    name: 'John Doe',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff',
    email: 'john.doe@example.com',
    role: 'user',
    lastActive: new Date(Date.now() - 1000 * 60 * 5).toISOString() // 5 minutes ago
  },
  {
    id: 'user-2',
    name: 'Jane Smith',
    avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=8A2BE2&color=fff',
    email: 'jane.smith@example.com',
    role: 'user',
    lastActive: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
  },
  {
    id: 'user-3',
    name: 'Robert Johnson',
    avatar: 'https://ui-avatars.com/api/?name=Robert+Johnson&background=228B22&color=fff',
    email: 'robert.johnson@example.com',
    role: 'user',
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
  }
];

const dummyConversations: Record<string, Conversation> = {
  'user-1': {
    id: 'conv-1',
    participants: ['admin-1', 'user-1'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    unreadCount: 2
  },
  'user-2': {
    id: 'conv-2',
    participants: ['admin-1', 'user-2'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    unreadCount: 0
  },
  'user-3': {
    id: 'conv-3',
    participants: ['admin-1', 'user-3'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    unreadCount: 1
  }
};

const dummyMessages: Record<string, Message[]> = {
  'user-1': [
    {
      id: '1-1',
      senderId: 'admin-1',
      text: 'Hello! How can I help you today?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
      isRead: true
    },
    {
      id: '1-2',
      senderId: 'user-1',
      text: 'I have a question about my subscription.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      isRead: true
    },
    {
      id: '1-3',
      senderId: 'user-1',
      text: 'When will the new features be available?',
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 minutes ago
      isRead: false
    }
  ],
  'user-2': [
    {
      id: '2-1',
      senderId: 'admin-1',
      text: 'Hi Jane, welcome to our platform!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
      isRead: true
    },
    {
      id: '2-2',
      senderId: 'user-2',
      text: 'Thanks! I\'m having a great experience so far.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
      isRead: true
    },
    {
      id: '2-3',
      senderId: 'admin-1',
      text: 'Glad to hear that! Let us know if you need anything.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
      isRead: true
    }
  ],
  'user-3': [
    {
      id: '3-1',
      senderId: 'user-3',
      text: 'Hello, I need help with billing.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
      isRead: true
    },
    {
      id: '3-2',
      senderId: 'admin-1',
      text: 'I\'d be happy to help. What specific billing issue are you experiencing?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5).toISOString(), // 2.5 hours ago
      isRead: true
    },
    {
      id: '3-3',
      senderId: 'user-3',
      text: 'I was charged twice for this month.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      isRead: false
    }
  ]
};

export default function AdminChatsPage() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // Load messages when selecting a user
  const handleSelectUser = (userId: string) => {
    setSelectedUser(userId);
    setMessages(dummyMessages[userId] || []);
    
    // Mark messages as read
    const updatedConversations = { ...dummyConversations };
    if (updatedConversations[userId]) {
      updatedConversations[userId].unreadCount = 0;
    }
  };

  // Handle sending a new message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser || !newMessage.trim()) return;
    
    const newMsg: Message = {
      id: Date.now().toString(),
      senderId: 'admin-1',
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
      isRead: true
    };
    
    // Add the new message to the current conversation
    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Support Conversations</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg">
        {/* Users List */}
        <div className="border-r border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-lg text-gray-800 dark:text-white">Active Conversations</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {dummyUsers.length} users have contacted support
            </p>
          </div>
          
          <div className="overflow-y-auto max-h-[600px]">
            {dummyUsers.map(user => {
              const conversation = dummyConversations[user.id];
              const lastMessage = dummyMessages[user.id]?.slice(-1)[0];
              
              return (
                <div 
                  key={user.id}
                  onClick={() => handleSelectUser(user.id)}
                  className={`
                    flex items-center p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors
                    ${selectedUser === user.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                  `}
                >
                  <div className="relative mr-3">
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-12 h-12 rounded-full"
                    />
                    {user.lastActive && new Date(user.lastActive).getTime() > Date.now() - 1000 * 60 * 15 && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">{user.name}</h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
                      </span>
                    </div>
                    
                    {lastMessage && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {lastMessage.senderId === 'admin-1' ? 'You: ' : ''}{lastMessage.text}
                      </p>
                    )}
                  </div>
                  
                  {conversation.unreadCount > 0 && (
                    <div className="ml-2 bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {conversation.unreadCount}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Chat Area */}
        <div className="lg:col-span-2 flex flex-col h-[600px]">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
                {dummyUsers.find(u => u.id === selectedUser) && (
                  <>
                    <img 
                      src={dummyUsers.find(u => u.id === selectedUser)?.avatar} 
                      alt={dummyUsers.find(u => u.id === selectedUser)?.name} 
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {dummyUsers.find(u => u.id === selectedUser)?.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {dummyUsers.find(u => u.id === selectedUser)?.email}
                      </p>
                    </div>
                  </>
                )}
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
                <div className="space-y-4">
                  {messages.map(message => (
                    <div 
                      key={message.id}
                      className={`flex ${message.senderId === 'admin-1' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.senderId !== 'admin-1' && (
                        <img 
                          src={dummyUsers.find(u => u.id === selectedUser)?.avatar} 
                          alt={dummyUsers.find(u => u.id === selectedUser)?.name}
                          className="w-8 h-8 rounded-full mr-2 mt-1"
                        />
                      )}
                      
                      <div className={`
                        max-w-[80%] 
                        ${message.senderId === 'admin-1' 
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' 
                          : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white'
                        }
                        rounded-lg py-2 px-4 shadow-sm
                      `}>
                        <p>{message.text}</p>
                        <div className={`text-xs mt-1 ${message.senderId === 'admin-1' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                          {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1 py-2 px-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-4 rounded-r-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2">
                Your Conversations
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                Select a conversation from the list to view messages and respond to users.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 