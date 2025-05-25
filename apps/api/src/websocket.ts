import { ChatMessage, StreamEvent } from '@live-chat/types';
import { Server, Socket } from 'socket.io';
import { verifyToken } from './lib/auth';
import prisma from './lib/prisma';

interface SocketData {
  userId?: string;
  streamId?: string;
}

interface WebRTCSignal {
  streamId: string;
  offer?: {
    type: 'offer';
    sdp: string;
  };
  answer?: {
    type: 'answer';
    sdp: string;
  };
  candidate?: {
    candidate: string;
    sdpMid: string;
    sdpMLineIndex: number;
  };
}

export const setupWebSocketHandlers = (io: Server) => {
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = await verifyToken(token);
      if (!decoded || !decoded.userId) {
        return next(new Error('Authentication error: Invalid token'));
      }

      // Set user data in socket
      socket.data.userId = decoded.userId;
      next();
    } catch (error) {
      console.error('WebSocket authentication error:', error);
      next(new Error('Authentication error: Token verification failed'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    // Join stream room
    socket.on('join_stream', async (streamId: string) => {
      try {
        // Verify stream exists
        const stream = await prisma.stream.findUnique({
          where: { id: streamId },
        });

        if (!stream) {
          socket.emit('error', { message: 'Stream not found' });
          return;
        }

        socket.data.streamId = streamId;
        socket.join(`stream:${streamId}`);
        console.log(`Client ${socket.id} joined stream ${streamId}`);

        // Load recent chat messages with reactions
        const messages = await prisma.chatMessage.findMany({
          where: { streamId },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
            reactions: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        });

        // Send recent messages to the client
        socket.emit('chat_history', messages.reverse());

        // Notify others that someone joined
        socket.to(`stream:${streamId}`).emit('user_joined', {
          userId: socket.data.userId,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Error joining stream:', error);
        socket.emit('error', { message: 'Failed to join stream' });
      }
    });

    // Leave stream room
    socket.on('leave_stream', () => {
      if (socket.data.streamId) {
        socket.leave(`stream:${socket.data.streamId}`);
        console.log(`Client ${socket.id} left stream ${socket.data.streamId}`);

        // Notify others that someone left
        socket.to(`stream:${socket.data.streamId}`).emit('user_left', {
          userId: socket.data.userId,
          timestamp: new Date(),
        });

        socket.data.streamId = undefined;
      }
    });

    // Handle chat messages
    socket.on(
      'chat_message',
      async (message: Omit<ChatMessage, 'id' | 'createdAt'>) => {
        if (!socket.data.streamId || !socket.data.userId) {
          return;
        }

        try {
          // Save message to database
          const savedMessage = await prisma.chatMessage.create({
            data: {
              userId: socket.data.userId,
              streamId: socket.data.streamId,
              content: message.content,
            },
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatarUrl: true,
                },
              },
              reactions: {
                include: {
                  user: {
                    select: {
                      id: true,
                      username: true,
                    },
                  },
                },
              },
            },
          });

          // Broadcast message to all clients in the stream room
          io.to(`stream:${socket.data.streamId}`).emit(
            'chat_message',
            savedMessage,
          );
        } catch (error) {
          console.error('Error saving chat message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      },
    );

    // Handle typing indicators
    socket.on(
      'typing',
      ({ streamId, isTyping }: { streamId: string; isTyping: boolean }) => {
        if (!socket.data.userId) return;
        socket.to(`stream:${streamId}`).emit('typing', {
          userId: socket.data.userId,
          isTyping,
        });
      },
    );

    // Handle message reactions
    socket.on(
      'reaction',
      async ({
        messageId,
        reaction,
      }: {
        messageId: string;
        reaction: string;
      }) => {
        if (!socket.data.streamId || !socket.data.userId) return;

        try {
          // Save reaction to database
          const savedReaction = await prisma.messageReaction.create({
            data: {
              messageId,
              userId: socket.data.userId,
              reaction,
            },
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                },
              },
            },
          });

          // Broadcast reaction to all clients in the stream room
          io.to(`stream:${socket.data.streamId}`).emit(
            'message_reaction',
            savedReaction,
          );
        } catch (error) {
          console.error('Error saving reaction:', error);
          socket.emit('error', { message: 'Failed to send reaction' });
        }
      },
    );

    // Handle WebRTC signaling
    socket.on('webrtc_signal', (data: WebRTCSignal) => {
      if (!socket.data.userId) return;

      if (data.offer) {
        socket.to(`stream:${data.streamId}`).emit('webrtc_offer', {
          userId: socket.data.userId,
          offer: data.offer,
        });
      } else if (data.answer) {
        socket.to(`stream:${data.streamId}`).emit('webrtc_answer', {
          userId: socket.data.userId,
          answer: data.answer,
        });
      } else if (data.candidate) {
        socket.to(`stream:${data.streamId}`).emit('webrtc_ice_candidate', {
          userId: socket.data.userId,
          candidate: data.candidate,
        });
      }
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
          timestamp: new Date(),
        });
      }
    });
  });
};
