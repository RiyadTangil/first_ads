'use client';

import { useState, useEffect, useRef } from 'react';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'admin';
  timestamp: Date;
};

type ChatModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! How can I help you today?',
      sender: 'admin',
      timestamp: new Date(),
    },
  ]);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, newMessage]);
    
    // Mock response from admin after 1 second
    setTimeout(() => {
      const adminResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Thanks for your message. An admin will respond shortly.',
        sender: 'admin',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, adminResponse]);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-end sm:items-center sm:justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-white w-full sm:w-96 h-[70vh] sm:h-[500px] sm:rounded-lg shadow-xl overflow-hidden flex flex-col"
      >
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white flex justify-between items-center">
          <h3 className="font-semibold">Support Chat</h3>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        
        <ChatHistory messages={messages} />
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
} 