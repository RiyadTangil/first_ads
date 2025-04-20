'use client';

import { useState, FormEvent } from 'react';

type ChatInputProps = {
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  placeholder?: string;
};

export default function ChatInput({ 
  onSendMessage, 
  isLoading = false, 
  placeholder = "Type your message here..." 
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (message.trim() === "" || isLoading) return;
    
    onSendMessage(message.trim());
    setMessage("");
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          className="flex-1 bg-gray-100 dark:bg-gray-800 border-0 rounded-l-full py-2 px-4 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={message.trim() === "" || isLoading}
          className={`bg-blue-600 hover:bg-blue-700 text-white rounded-r-full px-4 py-2 transition-colors 
            ${message.trim() === "" || isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
} 