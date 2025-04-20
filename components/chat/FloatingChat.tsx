'use client';

import React, { useState } from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import Chat from './Chat';

const FloatingChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };
  
  const closeChat = () => {
    setIsOpen(false);
  };
  
  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen ? (
        <Chat onClose={closeChat} />
      ) : (
        <button
          onClick={toggleChat}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          aria-label="Open chat"
        >
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default FloatingChat; 