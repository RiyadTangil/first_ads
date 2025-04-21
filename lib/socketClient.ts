import { io, Socket } from 'socket.io-client';
import { getUserFromLocalStorage } from './localStorage';

// Global socket instance
let socket: Socket | null = null;
let connectionPromise: Promise<Socket> | null = null;

/**
 * Initialize the Socket.IO client connection
 */
export const initSocketClient = async (): Promise<Socket> => {
  if (connectionPromise) return connectionPromise;

  connectionPromise = new Promise((resolve, reject) => {
    try {
      console.log('Creating new socket connection');
      
      // Create socket instance if it doesn't exist
      if (!socket) {
        // Get base URL dynamically based on current environment
        const baseUrl = typeof window !== 'undefined' 
          ? window.location.origin 
          : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        
        console.log(`Socket connection URL: ${baseUrl}`);
        
        // Create a new socket connection with more debugging
        socket = io(baseUrl, {
          path: '/api/socketio',
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 20000,
          transports: ['polling', 'websocket'], // Try both transport types
          withCredentials: false,
          autoConnect: false, // Don't connect automatically, we'll do it manually
          forceNew: true,     // Force a new connection
          extraHeaders: {     // Add extra headers for debugging
            'X-Client-Id': `client-${Date.now()}`
          }
        });
      }

      // Set up more detailed debugging for the socket
      if (socket) {
        // Basic connection events
        socket.on('connect', () => {
          console.log(`Socket connected successfully with ID: ${socket?.id}`);
          resolve(socket as Socket);
        });

        socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          if (!socket?.connected) {
            connectionPromise = null; // Reset promise on connection errors
            reject(error);
          }
        });

        socket.on('disconnect', (reason) => {
          console.log(`Socket disconnected: ${reason}`);
          
          // If the disconnection was initiated by the server, try to reconnect
          if (reason === 'io server disconnect') {
            socket?.connect();
          }
        });

        // Add safer access to socket.io engine properties
        try {
          if (socket.io && socket.io.engine) {
            // Log transport changes
            socket.io.engine.on("upgrade", (transport) => {
              console.log("Transport upgraded to:", transport.name);
            });
            
            socket.io.engine.on("error", (err) => {
              console.log("Engine error:", err);
            });
          }
        } catch (err) {
          console.warn("Could not access socket.io engine properties:", err);
        }
        
        // Start connection attempt
        console.log("Manually connecting socket...");
        socket.connect();
        
        // If socket is already connected, resolve immediately
        if (socket.connected) {
          console.log('Socket already connected:', socket.id);
          resolve(socket);
        }
      } else {
        reject(new Error("Failed to create socket instance"));
      }
    } catch (error) {
      console.error('Socket initialization error:', error);
      connectionPromise = null;
      reject(error);
    }
  });

  return connectionPromise;
};

/**
 * Ensure Socket.IO is connected
 */
export const ensureSocketConnected = async (): Promise<Socket> => {
  if (socket?.connected) {
    return socket;
  }
  
  try {
    return await initSocketClient();
  } catch (error) {
    console.error('Failed to establish socket connection:', error);
    connectionPromise = null;
    throw error;
  }
};

/**
 * Get the Socket.IO client instance (creates one if it doesn't exist)
 * This is a synchronous version that returns the current socket instance,
 * and initiates a connection if none exists. For reliable socket access,
 * use ensureSocketConnected instead.
 */
export const getSocketClient = (): Socket => {
  if (!socket) {
    // Initiate connection, but don't wait for it
    const userData = getUserFromLocalStorage();
    if (userData) {
      initSocketClient().then(socket => {
        joinUserRoom(userData.id, userData.role || 'user').catch(console.error);
      }).catch(console.error);
    } else {
      initSocketClient().catch(console.error);
    }
  }
  
  // Return current socket (might not be connected yet)
  if (!socket) {
    throw new Error('Socket not initialized');
  }
  
  return socket;
};

/**
 * Join a conversation room to receive messages for a specific conversation
 */
export const joinConversation = async (conversationId: string): Promise<boolean> => {
  try {
    const activeSocket = await ensureSocketConnected();
    console.log(`Joining conversation: ${conversationId}`);
    activeSocket.emit('join_conversation', conversationId);
    return true;
  } catch (error) {
    console.error('Error joining conversation:', error);
    return false;
  }
};

/**
 * Leave a conversation room
 */
export const leaveConversation = async (conversationId: string): Promise<boolean> => {
  try {
    const activeSocket = await ensureSocketConnected();
    console.log(`Leaving conversation: ${conversationId}`);
    activeSocket.emit('leave_conversation', conversationId);
    return true;
  } catch (error) {
    console.error('Error leaving conversation:', error);
    return false;
  }
};

/**
 * Send a message via Socket.IO
 */
export const sendSocketMessage = async (conversationId: string, message: any): Promise<boolean> => {
  try {
    const activeSocket = await ensureSocketConnected();
    console.log(`Sending message to conversation: ${conversationId}`, message);
    activeSocket.emit('new_message', { conversationId, message });
    return true;
  } catch (error) {
    console.error('Error sending socket message:', error);
    return false;
  }
};

/**
 * Mark messages as read via Socket.IO
 */
export const markMessagesReadSocket = async (conversationId: string, userId: string): Promise<boolean> => {
  try {
    const activeSocket = await ensureSocketConnected();
    console.log(`Marking messages as read for user ${userId} in conversation ${conversationId}`);
    activeSocket.emit('mark_read', { conversationId, userId });
    return true;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return false;
  }
};

/**
 * Disconnect the Socket.IO client
 */
export const disconnectSocket = (): void => {
  if (socket) {
    console.log('Disconnecting socket client');
    socket.disconnect();
  }
  socket = null;
  connectionPromise = null;
};

// Export the socket instance for direct access if needed
export const getSocket = (): Socket | null => socket;

// Join user's room
export const joinUserRoom = async (userId: string, role: string) => {
  try {
    const socket = await ensureSocketConnected();
    socket.emit('join', { userId, role });
    
    return new Promise<void>((resolve, reject) => {
      // Set a timeout to prevent hanging if the server doesn't respond
      const timeout = setTimeout(() => {
        socket.off('joined');
        reject(new Error('Timeout waiting for join confirmation'));
      }, 5000);
      
      socket.once('joined', () => {
        clearTimeout(timeout);
        resolve();
      });
    });
  } catch (error) {
    console.error('Error joining user room:', error);
    throw error;
  }
};

// Set up callback for receiving messages
export const onReceiveMessage = async (callback: (message: any) => void) => {
  const socket = await ensureSocketConnected();
  socket.on('receive_message', callback);
  
  return () => {
    socket.off('receive_message', callback);
  };
};

// Set up callback for messages read
export const onMessagesRead = async (callback: (data: { conversationId: string, userId: string }) => void) => {
  const socket = await ensureSocketConnected();
  socket.on('messages_read', callback);
  
  return () => {
    socket.off('messages_read', callback);
  };
};

// Set up callback for new user messages (for admin notifications)
export const onNewUserMessage = async (callback: (data: { conversationId: string, message: any }) => void) => {
  const socket = await ensureSocketConnected();
  socket.on('new_user_message', callback);
  
  return () => {
    socket.off('new_user_message', callback);
  };
}; 