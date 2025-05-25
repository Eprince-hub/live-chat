import type { AuthResponse, LoginCredentials, User } from '@live-chat/types';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import endpoints from '../../config/api';
import api from '../../lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await api.post(endpoints.auth.login, { email, password });
    await SecureStore.setItemAsync('token', response.data.data.token);
    return response.data.data;
  },
);

export const register = createAsyncThunk(
  'auth/register',
  async ({
    email,
    password,
    username,
    displayName,
    isSeller = false,
  }: {
    email: string;
    password: string;
    username: string;
    displayName: string;
    isSeller?: boolean;
  }) => {
    const response = await api.post(endpoints.auth.register, {
      email,
      password,
      username,
      displayName,
      isSeller,
    });
    await SecureStore.setItemAsync('token', response.data.data.token);
    return response.data.data;
  },
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    await SecureStore.deleteItemAsync('token');
    dispatch(clearAuth());
  },
);

export const getCurrentUser = createAsyncThunk('auth/getCurrentUser', async () => {
  const response = await api.get(endpoints.auth.me);
  return response.data.data;
});

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { dispatch }) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        dispatch(setToken(token));
        await dispatch(getCurrentUser());
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Registration failed';
      })
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to get current user';
      });
  },
});

export const { clearAuth, setError, setToken } = authSlice.actions;
export default authSlice.reducer;
