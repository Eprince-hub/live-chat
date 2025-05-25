import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Stream } from '@live-chat/types';
import api from '../../lib/api';
import endpoints from '../../config/api';

interface StreamState {
  streams: Stream[];
  currentStream: Stream | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: StreamState = {
  streams: [],
  currentStream: null,
  isLoading: false,
  error: null,
};

export const createStream = createAsyncThunk(
  'stream/create',
  async (streamData: {
    title: string;
    description: string;
    startTime: string;
    products: any[];
    category: string;
    isPrivate: boolean;
    enableChat: boolean;
  }) => {
    const response = await api.post(endpoints.streams.create, streamData);
    return response.data.data;
  },
);

export const fetchStreams = createAsyncThunk('stream/fetchAll', async () => {
  const response = await api.get(endpoints.streams.list);
  return response.data.data;
});

export const fetchStreamById = createAsyncThunk(
  'stream/fetchById',
  async (id: string) => {
    const response = await api.get(endpoints.streams.getById(id));
    return response.data.data;
  },
);

export const updateStreamStatus = createAsyncThunk(
  'stream/updateStatus',
  async ({ streamId, status }: { streamId: string; status: string }) => {
    const response = await api.patch(endpoints.streams.updateStatus(streamId), { status });
    return response.data.data;
  },
);

const streamSlice = createSlice({
  name: 'stream',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createStream.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createStream.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentStream = action.payload;
        state.streams = [action.payload, ...state.streams];
      })
      .addCase(createStream.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create stream';
      })
      .addCase(fetchStreams.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStreams.fulfilled, (state, action) => {
        state.isLoading = false;
        state.streams = action.payload;
      })
      .addCase(fetchStreams.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch streams';
      })
      .addCase(fetchStreamById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStreamById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentStream = action.payload;
      })
      .addCase(fetchStreamById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch stream';
      })
      .addCase(updateStreamStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateStreamStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentStream?.id === action.payload.id) {
          state.currentStream = action.payload;
        }
        state.streams = state.streams.map((stream) =>
          stream.id === action.payload.id ? action.payload : stream
        );
      })
      .addCase(updateStreamStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update stream status';
      });
  },
});

export default streamSlice.reducer; 