import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import streamReducer from './slices/streamSlice';
import productReducer from './slices/productSlice';
import orderReducer from './slices/orderSlice';
import chatReducer from './slices/chatSlice';
import webrtcReducer from './slices/webrtcSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    stream: streamReducer,
    product: productReducer,
    order: orderReducer,
    chat: chatReducer,
    webrtc: webrtcReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          'chat/connect/fulfilled',
          'webrtc/initialize/fulfilled',
          'auth/register/pending',
          'auth/register/fulfilled',
          'auth/register/rejected',
          'auth/login/pending',
          'auth/login/fulfilled',
          'auth/login/rejected',
        ],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.socket', 'payload.stream'],
        // Ignore these paths in the state
        ignoredPaths: [
          'chat.socket',
          'webrtc.socket',
          'webrtc.peerConnection',
          'webrtc.localStream',
          'webrtc.remoteStream',
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 