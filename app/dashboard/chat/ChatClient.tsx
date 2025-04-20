'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatBubbleLeftRightIcon, ClockIcon } from '@heroicons/react/24/outline';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import ChatMessage, { MessageType } from '@/components/chat/ChatMessage';
import { formatDistanceToNow } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

interface ChatClientProps {
  initialMessages: MessageType[];
}

export default function ChatClient({ initialMessages }: ChatClientProps) {
  const [messages, setMessages] = useState<MessageType[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Calculate chat stats
  const lastMessageTime = messages.length > 0 ? messages[messages.length - 1].timestamp : new Date();
  const firstMessageTime = messages.length > 0 ? messages[0].timestamp : new Date();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newMessage.trim() === '') return;
    
    // Add user message
    const userMessage: MessageType = {
      id: uuidv4(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
      read: false,
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setNewMessage('');
    
    // Simulate admin response after a short delay
    setTimeout(() => {
      const adminMessage: MessageType = {
        id: uuidv4(),
        text: 'Thanks for your message! An admin will respond to you shortly.',
        sender: 'admin',
        timestamp: new Date(),
        read: true,
      };
      
      setMessages((prev) => [...prev, adminMessage]);
    }, 1000);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-350px)]">
      <div className="bg-white rounded-lg shadow-md p-4 flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 border-b pb-4 mb-4">
          <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600" />
          <h2 className="font-semibold text-gray-800">Chat History</h2>
        </div>
        
        <div className="overflow-y-auto flex-1 pr-2">
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
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
              className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition"
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
            <p className="font-medium">{formatDistanceToNow(lastMessageTime)} ago</p>
          </div>
          
          <div className="text-sm">
            <p className="text-gray-600">Conversation started:</p>
            <p className="font-medium">{formatDistanceToNow(firstMessageTime)} ago</p>
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