import { Server, Socket } from 'socket.io';
import { RTCSignal } from '@live-chat/types';

interface SocketUser {
  userId: string;
  socketId: string;
  streamId?: string;
}

const connectedUsers = new Map<string, SocketUser>();

export const setupWebSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    // Handle user authentication
    socket.on('authenticate', ({ userId }: { userId: string }) => {
      connectedUsers.set(socket.id, { userId, socketId: socket.id });
      socket.join(`user:${userId}`);
      console.log(`User ${userId} authenticated`);
    });

    // Handle joining a stream
    socket.on('join_stream', ({ streamId }: { streamId: string }) => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        user.streamId = streamId;
        socket.join(`stream:${streamId}`);
        io.to(`stream:${streamId}`).emit('user_joined', {
          userId: user.userId,
          timestamp: new Date(),
        });
      }
    });

    // Handle leaving a stream
    socket.on('leave_stream', () => {
      const user = connectedUsers.get(socket.id);
      if (user?.streamId) {
        const streamId = user.streamId;
        socket.leave(`stream:${streamId}`);
        delete user.streamId;
        io.to(`stream:${streamId}`).emit('user_left', {
          userId: user.userId,
          timestamp: new Date(),
        });
      }
    });

    // Handle chat messages
    socket.on('chat_message', ({ streamId, message }: { streamId: string; message: string }) => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        io.to(`stream:${streamId}`).emit('chat_message', {
          userId: user.userId,
          message,
          timestamp: new Date(),
        });
      }
    });

    // Handle WebRTC signaling
    socket.on('rtc_signal', (signal: RTCSignal) => {
      io.to(`user:${signal.to}`).emit('rtc_signal', {
        ...signal,
        from: connectedUsers.get(socket.id)?.userId,
      });
    });

    // Handle reactions
    socket.on('reaction', ({ streamId, type }: { streamId: string; type: string }) => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        io.to(`stream:${streamId}`).emit('reaction', {
          userId: user.userId,
          type,
          timestamp: new Date(),
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      const user = connectedUsers.get(socket.id);
      if (user?.streamId) {
        io.to(`stream:${user.streamId}`).emit('user_left', {
          userId: user.userId,
          timestamp: new Date(),
        });
      }
      connectedUsers.delete(socket.id);
      console.log('Client disconnected:', socket.id);
    });
  });
}; 