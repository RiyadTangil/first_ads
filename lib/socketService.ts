import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initializeSocket = (): Socket => {
  if (!socket || !socket.connected) {
    // Get base URL dynamically based on current environment
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    // Create a new socket connection
    socket = io(baseUrl, {
      path: '/api/socketio',
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling']
    });
    
    // Set up event listeners for connection management
    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id);
    });
    
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });
    
    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });
  }
  
  return socket;
};

export const getSocket = (): Socket | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  // Return existing socket or initialize a new one
  return socket || initializeSocket();
};

export const joinAsUser = (userId: string, role: string) => {
  const socket = getSocket();
  if (socket) {
    socket.emit('join', { userId, role });
  }
};

export const joinConversation = (conversationId: string) => {
  const socket = getSocket();
  if (socket && conversationId) {
    socket.emit('join_conversation', conversationId);
  }
};

export const leaveConversation = (conversationId: string) => {
  const socket = getSocket();
  if (socket && conversationId) {
    socket.emit('leave_conversation', conversationId);
  }
};

export const sendMessage = (conversationId: string, message: any) => {
  const socket = getSocket();
  if (socket) {
    socket.emit('new_message', { conversationId, message });
  }
};

export const markMessagesAsRead = (conversationId: string, userId: string) => {
  const socket = getSocket();
  if (socket) {
    socket.emit('mark_read', { conversationId, userId });
  }
};

export const onReceiveMessage = (callback: (message: any) => void) => {
  const socket = getSocket();
  if (socket) {
    socket.on('receive_message', callback);
    return () => {
      socket.off('receive_message', callback);
    };
  }
  return () => {};
};

export const onMessagesRead = (callback: (data: { conversationId: string, userId: string }) => void) => {
  const socket = getSocket();
  if (socket) {
    socket.on('messages_read', callback);
    return () => {
      socket.off('messages_read', callback);
    };
  }
  return () => {};
};

export const onNewUserMessage = (callback: (data: { conversationId: string, message: any }) => void) => {
  const socket = getSocket();
  if (socket) {
    socket.on('new_user_message', callback);
    return () => {
      socket.off('new_user_message', callback);
    };
  }
  return () => {};
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}; 