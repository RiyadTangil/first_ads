import { Server as NetServer } from 'http';
import { NextApiRequest } from 'next';
import { Server as ServerIO } from 'socket.io';
import { NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Socket.IO server instance
let io: ServerIO | null = null;

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: ServerIO;
    };
  };
};

export const initSocketIO = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  // If the Socket.IO server is already running, skip initialization
  if (res.socket.server.io) {
    console.log('Socket.IO already running');
    return res.socket.server.io;
  }

  // Create a new Socket.IO server
  const io = new ServerIO(res.socket.server, {
    path: '/api/socketio',
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Store the Socket.IO server instance
  res.socket.server.io = io;
  console.log('Socket.IO initialized');

  // Set up Socket.IO connection handler
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join specific room for user or admin
    socket.on('join', (data) => {
      const { userId, role } = data;
      // Join a room specific to this user
      socket.join(`user:${userId}`);
      console.log(`${role} joined room: user:${userId}`);
      
      // If admin, join the admin room
      if (role === 'admin') {
        socket.join('admins');
        console.log(`Admin joined admin room`);
      }
    });

    // Handle new message
    socket.on('new_message', (data) => {
      const { conversationId, message } = data;
      // Emit to the specific conversation room
      io.to(`conversation:${conversationId}`).emit('receive_message', message);
      
      // Also notify admins about new messages
      if (message.senderType === 'user') {
        io.to('admins').emit('new_user_message', {
          conversationId,
          message
        });
      }
    });

    // Join conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`Joined conversation: ${conversationId}`);
    });
    
    // Leave conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`Left conversation: ${conversationId}`);
    });

    // Handle read receipts
    socket.on('mark_read', (data) => {
      const { conversationId, userId } = data;
      io.to(`conversation:${conversationId}`).emit('messages_read', { 
        conversationId, 
        userId 
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Client-side socket instance
export const getSocketIO = () => io; 