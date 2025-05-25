import type { RTCSignal } from '@live-chat/types';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { io, Socket } from 'socket.io-client';
import endpoints from '../../config/api';
import api from '../../lib/api';

interface WebRTCState {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  peerConnection: RTCPeerConnection | null;
  socket: Socket | null;
  isConnected: boolean;
  isStreaming: boolean;
  error: string | null;
  streamQuality: 'low' | 'medium' | 'high';
}

const initialState: WebRTCState = {
  localStream: null,
  remoteStream: null,
  peerConnection: null,
  socket: null,
  isConnected: false,
  isStreaming: false,
  error: null,
  streamQuality: 'medium',
};

// TURN server configuration (commented out for development)
// const TURN_SERVERS = [
//   {
//     urls: process.env.TURN_SERVER_URL || 'turn:your-turn-server.com:3478',
//     username: process.env.TURN_SERVER_USERNAME || 'username',
//     credential: process.env.TURN_SERVER_PASSWORD || 'password',
//   },
// ];

// ICE servers configuration
const ICE_SERVERS = [
  {
    urls: ['stun:stun.l.google.com:19302'], // Free Google STUN server
  },
  // ...TURN_SERVERS, // Uncomment when TURN server is needed
];

// Stream quality settings
const QUALITY_SETTINGS = {
  low: {
    video: {
      width: { ideal: 640 },
      height: { ideal: 360 },
      frameRate: { ideal: 15 },
    },
    audio: {
      sampleRate: 22050,
      channelCount: 1,
    },
  },
  medium: {
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 30 },
    },
    audio: {
      sampleRate: 44100,
      channelCount: 2,
    },
  },
  high: {
    video: {
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      frameRate: { ideal: 60 },
    },
    audio: {
      sampleRate: 48000,
      channelCount: 2,
    },
  },
};

export const initializeStream = createAsyncThunk(
  'webrtc/initialize',
  async ({ streamId, token }: { streamId: string; token: string }) => {
    const socket = io(endpoints.ws, {
      auth: { token },
    });

    return new Promise<Socket>((resolve, reject) => {
      socket.on('connect', () => {
        socket.emit('join_stream', streamId);
        resolve(socket);
      });

      socket.on('connect_error', (error) => {
        reject(error);
      });
    });
  },
);

export const startStreaming = createAsyncThunk(
  'webrtc/startStreaming',
  async ({ streamId }: { streamId: string }, { getState }) => {
    const state = getState() as { webrtc: WebRTCState };
    const { streamQuality } = state.webrtc;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: QUALITY_SETTINGS[streamQuality].video,
        audio: QUALITY_SETTINGS[streamQuality].audio,
      });

      const peerConnection = new RTCPeerConnection({
        iceServers: ICE_SERVERS,
      });

      // Add local stream tracks to peer connection
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      // Create and send offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      if (state.webrtc.socket) {
        state.webrtc.socket.emit('webrtc_offer', {
          streamId,
          offer: peerConnection.localDescription,
        });
      }

      return { stream, peerConnection };
    } catch (error: any) {
      throw new Error(
        'Failed to start streaming: ' + (error.message || 'Unknown error'),
      );
    }
  },
);

export const changeStreamQuality = createAsyncThunk(
  'webrtc/changeQuality',
  async (quality: 'low' | 'medium' | 'high', { getState }) => {
    const state = getState() as { webrtc: WebRTCState };
    const { localStream } = state.webrtc;

    if (!localStream) {
      throw new Error('No active stream to change quality');
    }

    try {
      // Stop current tracks
      localStream.getTracks().forEach((track) => track.stop());

      // Get new stream with updated quality
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: QUALITY_SETTINGS[quality].video,
        audio: QUALITY_SETTINGS[quality].audio,
      });

      // Update tracks in peer connection
      if (state.webrtc.peerConnection) {
        const senders = state.webrtc.peerConnection.getSenders();
        senders.forEach((sender) => {
          const track = newStream
            .getTracks()
            .find((t) => t.kind === sender.track?.kind);
          if (track) {
            sender.replaceTrack(track);
          }
        });
      }

      return newStream;
    } catch (error: any) {
      throw new Error(
        'Failed to change stream quality: ' +
          (error.message || 'Unknown error'),
      );
    }
  },
);

const webrtcSlice = createSlice({
  name: 'webrtc',
  initialState,
  reducers: {
    setLocalStream: (state, action) => {
      state.localStream = action.payload;
    },
    setRemoteStream: (state, action) => {
      state.remoteStream = action.payload;
    },
    setPeerConnection: (state, action) => {
      state.peerConnection = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    disconnect: (state) => {
      if (state.localStream) {
        state.localStream.getTracks().forEach((track) => track.stop());
      }
      if (state.peerConnection) {
        state.peerConnection.close();
      }
      if (state.socket) {
        state.socket.disconnect();
      }
      state.localStream = null;
      state.remoteStream = null;
      state.peerConnection = null;
      state.socket = null;
      state.isConnected = false;
      state.isStreaming = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeStream.fulfilled, (state, action) => {
        state.socket = action.payload as any;
        state.isConnected = true;
        state.error = null;

        // Set up WebRTC signaling handlers
        action.payload.on('webrtc_offer', async (data) => {
          if (state.peerConnection) {
            try {
              await state.peerConnection.setRemoteDescription(
                new RTCSessionDescription(data.offer),
              );
              const answer = await state.peerConnection.createAnswer();
              await state.peerConnection.setLocalDescription(answer);
              action.payload.emit('webrtc_answer', {
                streamId: data.streamId,
                answer: state.peerConnection.localDescription,
              });
            } catch (error: any) {
              state.error =
                'Failed to handle WebRTC offer: ' +
                (error.message || 'Unknown error');
            }
          }
        });

        action.payload.on('webrtc_answer', async (data) => {
          if (state.peerConnection) {
            try {
              await state.peerConnection.setRemoteDescription(
                new RTCSessionDescription(data.answer),
              );
            } catch (error: any) {
              state.error =
                'Failed to handle WebRTC answer: ' +
                (error.message || 'Unknown error');
            }
          }
        });

        action.payload.on('webrtc_ice_candidate', async (data) => {
          if (state.peerConnection) {
            try {
              await state.peerConnection.addIceCandidate(
                new RTCIceCandidate(data.candidate),
              );
            } catch (error: any) {
              state.error =
                'Failed to add ICE candidate: ' +
                (error.message || 'Unknown error');
            }
          }
        });
      })
      .addCase(initializeStream.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to initialize stream';
        state.isConnected = false;
      })
      .addCase(startStreaming.fulfilled, (state, action) => {
        state.localStream = action.payload.stream;
        state.peerConnection = action.payload.peerConnection;
        state.isStreaming = true;
        state.error = null;

        // Set up ICE candidate handling
        action.payload.peerConnection.onicecandidate = (event) => {
          if (event.candidate && state.socket) {
            const socket = state.socket as any;
            socket.emit('webrtc_ice_candidate', {
              streamId: socket.data?.streamId,
              candidate: event.candidate,
            });
          }
        };

        // Set up connection state monitoring
        action.payload.peerConnection.onconnectionstatechange = () => {
          console.log('Connection state:', action.payload.peerConnection?.connectionState);
        };

        action.payload.peerConnection.oniceconnectionstatechange = () => {
          console.log('ICE connection state:', action.payload.peerConnection?.iceConnectionState);
        };

        // Set up remote stream handling
        action.payload.peerConnection.ontrack = (event) => {
          console.log('Received remote track:', event.track.kind);
          state.remoteStream = event.streams[0];
        };
      })
      .addCase(startStreaming.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to start streaming';
        state.isStreaming = false;
      })
      .addCase(changeStreamQuality.fulfilled, (state, action) => {
        state.localStream = action.payload;
        state.streamQuality = action.meta.arg;
        state.error = null;
      })
      .addCase(changeStreamQuality.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to change stream quality';
      });
  },
});

export const {
  setLocalStream,
  setRemoteStream,
  setPeerConnection,
  setError,
  disconnect,
} = webrtcSlice.actions;

export default webrtcSlice.reducer;
