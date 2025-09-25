'use client';

import { useState, useEffect, useRef } from 'react';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import { getUserFromLocalStorage } from '@/lib/localStorage';
import { 
  getConversations, 
  getMessages, 
  sendMessage as apiSendMessage, 
  markMessagesAsRead as apiMarkAsRead,
  createConversation,
  MessageResponse,
  ConversationResponse
} from '@/lib/chatService';
import { MessageType } from './ChatMessage';

type ChatModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

// Helper function to convert API message to local MessageType
const convertToMessageType = (message: MessageResponse): MessageType => ({
  id: message._id,
  text: message.text,
  sender: message.senderType,
  timestamp: new Date(message.timestamp),
  read: message.read
});

export default function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [conversation, setConversation] = useState<ConversationResponse | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Get user info on mount
  useEffect(() => {
    const userData = getUserFromLocalStorage();
    if (userData) {
      setUser(userData);
    } else {
      setError('Please log in to use the chat');
      setIsLoading(false);
    }
  }, []);

  // Load conversation and messages
  useEffect(() => {
    async function loadConversation() {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const conversations = await getConversations(user.id);
        
        let currentConversation;
        if (conversations && conversations.length > 0) {
          currentConversation = conversations[0];
        } else {
          // Create a new conversation if none exists
          currentConversation = await createConversation(user.id);
        }

        setConversation(currentConversation);
        
        // Load initial messages
        const messagesData = await getMessages(currentConversation._id);
        setMessages(messagesData.map(convertToMessageType));
        
        // Mark messages as read
        if (user.id) {
          await apiMarkAsRead(currentConversation._id, user.id);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load conversation:', error);
        setError('Failed to load conversation. Please try again.');
        setIsLoading(false);
      }
    }

    if (user?.id) {
      loadConversation();
    }
  }, [user?.id]);

  // Set up polling for messages
  useEffect(() => {
    if (!conversation?._id || !user?.id || !isOpen){
      console.log("yes it's retuning => ",conversation?._id , user?.id)

      
      
      return};

    // Clear any existing polling interval
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    // Set up new polling interval
    const interval = setInterval(async () => {
      try {
        
        // Fetch latest messages
        const messagesData = await getMessages(conversation._id);
        console.log("messagesData => ",messagesData)
        
        // Check if we have new messages
        const currentMessageIds = new Set(messages.map(m => m.id));
        const hasNewMessages = messagesData.some(m => !currentMessageIds.has(m._id));
        
        if (hasNewMessages) {
          setMessages(messagesData.map(convertToMessageType));
          
          // Update conversation state with latest unread count
          const updatedConversation = { ...conversation };
          updatedConversation.unreadCount = messagesData.filter(m => !m.read && m.senderType === 'admin').length;
          setConversation(updatedConversation);
          
          // Mark messages as read if there are unread messages
          if (updatedConversation.unreadCount > 0) {
            await apiMarkAsRead(conversation._id, user.id);
          }
        }
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    }, 3000); // Poll every 3 seconds

    setPollingInterval(interval);

    // Cleanup
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [conversation?._id, user?.id, isOpen, messages]);

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

  // Handle message sending
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !conversation?._id || !user?.id) return;

    try {
      const message = await apiSendMessage(conversation._id, user.id, content, 'user');
      
      // Update messages immediately with the new message
      setMessages(prev => [...prev, convertToMessageType(message)]);
      
      // Update conversation state
      const updatedConversation = { ...conversation };
      updatedConversation.lastMessage = message;
      setConversation(updatedConversation);
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  if (!isOpen) return null;

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
        
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center p-4 text-red-500 text-center">
            {error}
          </div>
        ) : (
          <>
            <ChatHistory messages={messages} />
            <ChatInput onSendMessage={handleSendMessage} />
          </>
        )}
      </div>
    </div>
  );
} 