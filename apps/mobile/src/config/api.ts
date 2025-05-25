import Constants from 'expo-constants';

// Get the API URL from environment variables or use a default
const API_URL = Constants.expoConfig?.extra?.API_URL || 'http://localhost:3000/api';
const WS_URL = Constants.expoConfig?.extra?.WS_URL || 'ws://localhost:3000';

export const endpoints = {
  auth: {
    register: `${API_URL}/auth/register`,
    login: `${API_URL}/auth/login`,
    me: `${API_URL}/auth/me`,
  },
  streams: {
    list: `${API_URL}/streams`,
    create: `${API_URL}/streams`,
    getById: (id: string) => `${API_URL}/streams/${id}`,
    updateStatus: (id: string) => `${API_URL}/streams/${id}/status`,
  },
  products: {
    list: `${API_URL}/products`,
    create: `${API_URL}/products`,
    getById: (id: string) => `${API_URL}/products/${id}`,
    update: (id: string) => `${API_URL}/products/${id}`,
    delete: (id: string) => `${API_URL}/products/${id}`,
  },
  orders: {
    list: `${API_URL}/orders`,
    create: `${API_URL}/orders`,
    getById: (id: string) => `${API_URL}/orders/${id}`,
    update: (id: string) => `${API_URL}/orders/${id}`,
    updateStatus: (id: string) => `${API_URL}/orders/${id}/status`,
  },
  chat: {
    send: (streamId: string) => `${API_URL}/chat/${streamId}/messages`,
    history: (streamId: string) => `${API_URL}/chat/${streamId}/messages`,
    delete: (streamId: string, messageId: string) => `${API_URL}/chat/${streamId}/messages/${messageId}`,
  },
  ws: WS_URL,
  webrtc: {
    signal: `${API_URL}/webrtc/signal`,
  },
};

export default endpoints; 