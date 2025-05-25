import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { ChatMessage } from '@live-chat/types';
import { io, Socket } from 'socket.io-client';
import endpoints from '../../config/api';
import api from '../../lib/api';

interface ChatState {
  messages: ChatMessage[];
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  typingUsers: string[];
  reconnectAttempts: number;
  lastMessageId: string | null;
}

const initialState: ChatState = {
  messages: [],
  socket: null,
  isConnected: false,
  error: null,
  isLoading: false,
  isLoadingMore: false,
  hasMore: true,
  typingUsers: [],
  reconnectAttempts: 0,
  lastMessageId: null,
};

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;

export const connectToStream = createAsyncThunk(
  'chat/connect',
  async ({ streamId, token }: { streamId: string; token: string }, { getState }) => {
    const state = getState() as { chat: ChatState };
    const socket = io(endpoints.ws, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: RECONNECT_DELAY,
    });

    return new Promise<Socket>((resolve, reject) => {
      socket.on('connect', () => {
        socket.emit('join_stream', streamId);
        resolve(socket);
      });

      socket.on('connect_error', (error) => {
        reject(error);
      });

      socket.on('error', (error) => {
        reject(new Error(error.message));
      });
    });
  }
);

export const loadMoreMessages = createAsyncThunk(
  'chat/loadMore',
  async ({ streamId, beforeId }: { streamId: string; beforeId: string }) => {
    const response = await api.get(endpoints.chat.history(streamId), {
      params: { before: beforeId, limit: 20 },
    });
    return response.data.data;
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ content, streamId }: { content: string; streamId: string }) => {
    const response = await api.post(endpoints.chat.send(streamId), { content });
    return response.data.data;
  }
);

export const deleteMessage = createAsyncThunk(
  'chat/deleteMessage',
  async ({ messageId, streamId }: { messageId: string; streamId: string }) => {
    await api.delete(endpoints.chat.delete(streamId, messageId));
    return messageId;
  }
);

export const sendTypingIndicator = createAsyncThunk(
  'chat/sendTyping',
  async ({ streamId, isTyping }: { streamId: string; isTyping: boolean }, { getState }) => {
    const state = getState() as { chat: ChatState };
    const socket = state.chat.socket;
    if (socket) {
      socket.emit('typing', { streamId, isTyping });
    }
  }
);

export const sendReaction = createAsyncThunk(
  'chat/sendReaction',
  async ({ messageId, reaction }: { messageId: string; reaction: string }, { getState }) => {
    const state = getState() as { chat: ChatState };
    const socket = state.chat.socket;
    if (socket) {
      socket.emit('reaction', { messageId, reaction });
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
      state.lastMessageId = action.payload.id;
    },
    clearMessages: (state) => {
      state.messages = [];
      state.lastMessageId = null;
    },
    disconnect: (state) => {
      if (state.socket) {
        state.socket.disconnect();
        state.socket = null;
        state.isConnected = false;
      }
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    addTypingUser: (state, action) => {
      if (!state.typingUsers.includes(action.payload)) {
        state.typingUsers.push(action.payload);
      }
    },
    removeTypingUser: (state, action) => {
      state.typingUsers = state.typingUsers.filter(id => id !== action.payload);
    },
    incrementReconnectAttempts: (state) => {
      state.reconnectAttempts += 1;
    },
    resetReconnectAttempts: (state) => {
      state.reconnectAttempts = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectToStream.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(connectToStream.fulfilled, (state, action) => {
        state.socket = action.payload as any;
        state.isConnected = true;
        state.isLoading = false;
        state.reconnectAttempts = 0;

        // Set up socket event listeners
        action.payload.on('chat_message', (message: ChatMessage) => {
          state.messages.push(message);
          state.lastMessageId = message.id;
        });

        action.payload.on('chat_history', (messages: ChatMessage[]) => {
          state.messages = messages;
          if (messages.length > 0) {
            state.lastMessageId = messages[messages.length - 1].id;
          }
        });

        action.payload.on('typing', ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
          if (isTyping) {
            if (!state.typingUsers.includes(userId)) {
              state.typingUsers.push(userId);
            }
          } else {
            state.typingUsers = state.typingUsers.filter(id => id !== userId);
          }
        });

        action.payload.on('message_deleted', (messageId: string) => {
          state.messages = state.messages.filter(msg => msg.id !== messageId);
        });

        action.payload.on('error', (error: { message: string }) => {
          state.error = error.message;
        });

        action.payload.on('disconnect', () => {
          state.isConnected = false;
          state.error = 'Disconnected from chat server';
        });

        action.payload.on('reconnect_attempt', () => {
          state.reconnectAttempts += 1;
        });

        action.payload.on('reconnect', () => {
          state.isConnected = true;
          state.error = null;
          state.reconnectAttempts = 0;
        });
      })
      .addCase(connectToStream.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to connect to stream';
        state.isConnected = false;
        state.isLoading = false;
      })
      .addCase(loadMoreMessages.pending, (state) => {
        state.isLoadingMore = true;
      })
      .addCase(loadMoreMessages.fulfilled, (state, action) => {
        state.messages = [...action.payload, ...state.messages];
        state.isLoadingMore = false;
        state.hasMore = action.payload.length === 20;
      })
      .addCase(loadMoreMessages.rejected, (state) => {
        state.isLoadingMore = false;
        state.error = 'Failed to load more messages';
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
        state.lastMessageId = action.payload.id;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to send message';
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.messages = state.messages.filter(msg => msg.id !== action.payload);
      });
  },
});

export const {
  addMessage,
  clearMessages,
  disconnect,
  setError,
  addTypingUser,
  removeTypingUser,
  incrementReconnectAttempts,
  resetReconnectAttempts,
} = chatSlice.actions;

export default chatSlice.reducer; 