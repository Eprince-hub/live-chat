// User types
export interface User {
  id: string;
  email: string;
  username: string;
  password?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password'>;
}

// Stream types
export interface Stream {
  id: string;
  title: string;
  description?: string;
  userId: string;
  isLive: boolean;
  startedAt?: Date;
  endedAt?: Date;
  thumbnailUrl?: string;
  viewerCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Product types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  userId: string;
  streamId?: string;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

// Order types
export interface Order {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

// WebSocket types
export interface ChatMessage {
  id: string;
  userId: string;
  streamId: string;
  content: string;
  createdAt: Date;
}

export interface StreamEvent {
  type: 'VIEW_COUNT_UPDATE' | 'STREAM_STATUS_UPDATE' | 'CHAT_MESSAGE';
  payload: any;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// WebRTC types
export interface RTCSignal {
  type: 'offer' | 'answer' | 'ice-candidate';
  payload: any;
  from: string;
  to: string;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: 'live_started' | 'order_update' | 'chat_mention' | 'follow';
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
} 