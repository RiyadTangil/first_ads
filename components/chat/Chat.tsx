import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/solid';
import ChatMessage, { MessageType } from './ChatMessage';
import { v4 as uuidv4 } from 'uuid';

// Dummy data for testing
const initialMessages: MessageType[] = [
  {
    id: '1',
    text: 'Hello! How can I help you today?',
    sender: 'admin',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: true,
  },
];

interface ChatProps {
  onClose?: () => void;
}

const Chat: React.FC<ChatProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<MessageType[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded-r-lg hover:bg-blue-700"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat; 