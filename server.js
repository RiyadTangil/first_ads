const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

// Prepare the Next.js app
const app = next({ dev, hostname, port, turbo: true });
const handle = app.getRequestHandler();

// Store the Socket.IO server instance globally
global._io = null;

app.prepare().then(() => {
  // Create HTTP server
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  // Initialize Socket.IO server if it hasn't been created yet
  if (!global._io) {
    const io = new Server(server, {
      path: '/api/socketio',
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'OPTIONS'],
        credentials: true,
      },
      allowEIO3: true,
      transports: ['polling', 'websocket'],
    });

    // Setup Socket.IO event handlers
    io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Handle joining user rooms
      socket.on('join', ({ userId, role }) => {
        console.log(`User ${userId} with role ${role} joined`);
        socket.join(userId);
        // If admin, join the admin room
        if (role === 'admin') {
          socket.join('admins');
        }
        socket.emit('joined', { userId, role });
      });

      // Handle joining conversation rooms
      socket.on('join_conversation', (conversationId) => {
        console.log(`Socket ${socket.id} joined conversation: ${conversationId}`);
        socket.join(conversationId);
      });

      // Handle leaving conversation rooms
      socket.on('leave_conversation', (conversationId) => {
        console.log(`Socket ${socket.id} left conversation: ${conversationId}`);
        socket.leave(conversationId);
      });

      // Handle new messages
      socket.on('new_message', ({ conversationId, message }) => {
        console.log(`New message in conversation ${conversationId}`);
        
        // Emit to all clients in the conversation room
        io.to(conversationId).emit('receive_message', message);
        
        // If message is from a user, notify admins
        if (message.senderType === 'user') {
          io.to('admins').emit('new_user_message', { 
            conversationId,
            message
          });
        }
      });

      // Handle marking messages as read
      socket.on('mark_read', ({ conversationId, userId }) => {
        console.log(`Messages marked as read in conversation ${conversationId} by user ${userId}`);
        io.to(conversationId).emit('messages_read', { conversationId, userId });
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        console.log(`Client disconnected: ${socket.id}. Reason: ${reason}`);
      });
    });

    // Store the Socket.IO server globally so we can access it from API routes
    global._io = io;
    console.log('Socket.IO server initialized successfully');
  }

  // Start the server
  server.listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
}); 