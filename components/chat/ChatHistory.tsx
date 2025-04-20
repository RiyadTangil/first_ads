'use client';

import { useEffect, useRef } from 'react';
import ChatMessage, { MessageType } from './ChatMessage';

type ChatHistoryProps = {
  messages: MessageType[];
  isLoading?: boolean;
};

export default function ChatHistory({ messages, isLoading = false }: ChatHistoryProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="font-medium">No messages yet</p>
          <p className="text-sm">Start the conversation by sending a message.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      
      {isLoading && (
        <div className="flex justify-start mb-4">
          <div className="bg-gray-100 dark:bg-gray-800 py-2 px-4 rounded-lg rounded-tl-none">
            <div className="flex space-x-2 items-center">
              <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse delay-75"></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse delay-150"></div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
} 