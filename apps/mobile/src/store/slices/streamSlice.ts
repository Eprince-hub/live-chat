import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { LiveStream,  } from '@live-chat/types';

interface StreamState {
  streams: LiveStream[];
  currentStream: LiveStream | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: StreamState = {
  streams: [],
  currentStream: null,
  isLoading: false,
  error: null,
};

export const fetchStreams = createAsyncThunk('stream/fetchAll', async () => {
  const response = await axios.get('http://localhost:3000/api/streams');
  return response.data.data;
});

export const fetchStreamById = createAsyncThunk(
  'stream/fetchById',
  async (streamId: string) => {
    const response = await axios.get(`http://localhost:3000/api/streams/${streamId}`);
    return response.data.data;
  }
);

export const createStream = createAsyncThunk(
  'stream/create',
  async (data: {
    title: string;
    description?: string;
    startTime: Date;
    products: string[];
  }) => {
    const response = await axios.post('http://localhost:3000/api/streams', data);
    return response.data.data;
  }
);

export const updateStreamStatus = createAsyncThunk(
  'stream/updateStatus',
  async ({
    streamId,
    status,
  }: {
    streamId: string;
    status: 'scheduled' | 'live' | 'ended';
  }) => {
    const response = await axios.patch(
      `http://localhost:3000/api/streams/${streamId}/status`,
      { status }
    );
    return response.data.data;
  }
);

const streamSlice = createSlice({
  name: 'stream',
  initialState,
  reducers: {
    clearStreamError: (state) => {
      state.error = null;
    },
    updateViewerCount: (state, action) => {
      if (state.currentStream) {
        state.currentStream.viewerCount = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all streams
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
      // Fetch stream by ID
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
      // Create stream
      .addCase(createStream.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createStream.fulfilled, (state, action) => {
        state.isLoading = false;
        state.streams.unshift(action.payload);
        state.currentStream = action.payload;
      })
      .addCase(createStream.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create stream';
      })
      // Update stream status
      .addCase(updateStreamStatus.fulfilled, (state, action) => {
        const updatedStream = action.payload;
        state.streams = state.streams.map((stream) =>
          stream.id === updatedStream.id ? updatedStream : stream
        );
        if (state.currentStream?.id === updatedStream.id) {
          state.currentStream = updatedStream;
        }
      });
  },
});

export const { clearStreamError, updateViewerCount } = streamSlice.actions;
export default streamSlice.reducer; 