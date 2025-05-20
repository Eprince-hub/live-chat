import { Server, Socket } from 'socket.io';
import { ChatMessage, StreamEvent } from '@live-chat/types';

interface SocketData {
  userId?: string;
  streamId?: string;
}

export const setupWebSocketHandlers = (io: Server) => {
  // Middleware to authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    // TODO: Verify token and set user data
    // For now, we'll use a mock user ID
    socket.data.userId = 'mock-user-id';
    next();
  });

  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    // Join stream room
    socket.on('join_stream', (streamId: string) => {
      socket.data.streamId = streamId;
      socket.join(`stream:${streamId}`);
      console.log(`Client ${socket.id} joined stream ${streamId}`);

      // Notify others that someone joined
      socket.to(`stream:${streamId}`).emit('user_joined', {
        userId: socket.data.userId,
      });
    });

    // Leave stream room
    socket.on('leave_stream', () => {
      if (socket.data.streamId) {
        socket.leave(`stream:${socket.data.streamId}`);
        console.log(`Client ${socket.id} left stream ${socket.data.streamId}`);

        // Notify others that someone left
        socket.to(`stream:${socket.data.streamId}`).emit('user_left', {
          userId: socket.data.userId,
        });

        socket.data.streamId = undefined;
      }
    });

    // Handle chat messages
    socket.on('chat_message', (message: Omit<ChatMessage, 'id' | 'createdAt'>) => {
      if (!socket.data.streamId || !socket.data.userId) {
        return;
      }

      const chatMessage: ChatMessage = {
        id: Date.now().toString(),
        userId: socket.data.userId,
        streamId: socket.data.streamId,
        content: message.content,
        createdAt: new Date(),
      };

      // Broadcast message to all clients in the stream room
      io.to(`stream:${socket.data.streamId}`).emit('chat_message', chatMessage);
    });

    // Handle stream events
    socket.on('stream_event', (event: StreamEvent) => {
      if (!socket.data.streamId || !socket.data.userId) {
        return;
      }

      // Broadcast event to all clients in the stream room
      io.to(`stream:${socket.data.streamId}`).emit('stream_event', {
        ...event,
        userId: socket.data.userId,
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);

      // Notify others if user was in a stream
      if (socket.data.streamId) {
        socket.to(`stream:${socket.data.streamId}`).emit('user_left', {
          userId: socket.data.userId,
        });
      }
    });
  });
}; 