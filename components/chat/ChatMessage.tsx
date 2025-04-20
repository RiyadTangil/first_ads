'use client';

import React from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

export interface MessageType {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  timestamp: Date;
  read: boolean;
}

interface ChatMessageProps {
  message: MessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAdmin = message.sender === 'admin';
  
  return (
    <div className={`flex mb-4 ${isAdmin ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
          isAdmin
            ? 'bg-gray-100 text-gray-800 rounded-bl-none'
            : 'bg-blue-600 text-white rounded-br-none'
        }`}
      >
        <p className="text-sm">{message.text}</p>
        <div className={`flex items-center justify-end mt-1 text-xs ${isAdmin ? 'text-gray-500' : 'text-blue-100'}`}>
          <span>{formatDistanceToNow(message.timestamp, { addSuffix: true })}</span>
          {!isAdmin && message.read && (
            <CheckIcon className="ml-1 h-3 w-3" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage; 