'use client';

import React from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { getUserFromLocalStorage } from '@/lib/localStorage';

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
  const user = getUserFromLocalStorage();
  
  // Get initials for avatars
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  
  // Format time to display as HH:MM
  const formattedTime = format(message.timestamp, 'h:mm a');
  
  // For the date display - "Today", "Yesterday", or the date
  const formattedDate = format(message.timestamp, 'MMM d, yyyy');
  
  return (
    <div className={`flex mb-5 ${isAdmin ? 'justify-start' : 'justify-end'}`}>
      {isAdmin && (
        <div className="w-6 h-6 rounded-full bg-gray-200 flex-shrink-0 mr-2 shadow-sm flex items-center justify-center text-xs font-semibold text-gray-600">
          A
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          isAdmin
            ? 'bg-white border border-gray-100 text-gray-800 rounded-bl-none shadow-sm'
            : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-br-none shadow-md'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
        <div 
          className={`flex items-center justify-end mt-2 text-xs ${
            isAdmin ? 'text-gray-400' : 'text-blue-100'
          }`}
        >
          <span>{formattedTime}</span>
          {!isAdmin && (
            <span className="ml-1.5 flex items-center">
              {message.read ? (
                <span className="flex items-center" title="Read">
                  <CheckIcon className="h-3 w-3" />
                  <CheckIcon className="-ml-1.5 h-3 w-3" />
                </span>
              ) : (
                <CheckIcon className="h-3 w-3" title="Sent" />
              )}
            </span>
          )}
        </div>
      </div>
      {!isAdmin && (
        <div className="w-6 h-6 rounded-full bg-blue-500 flex-shrink-0 ml-2 shadow-sm flex items-center justify-center text-xs font-semibold text-white">
          {userInitial}
        </div>
      )}
    </div>
  );
};

export default ChatMessage; 