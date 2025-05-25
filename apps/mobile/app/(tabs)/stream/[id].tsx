import { Ionicons } from '@expo/vector-icons';
import type { Stream } from '@live-chat/types';
import { CameraView as ExpoCamera } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../src/store';
import {
  fetchStreamById,
  updateStreamStatus,
} from '../../../src/store/slices/streamSlice';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_HEIGHT = SCREEN_WIDTH * (9 / 16); // 16:9 aspect ratio

export default function StreamScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { currentStream, isLoading, error } = useSelector(
    (state: RootState) => state.stream,
  );
  const user = useSelector((state: RootState) => state.auth.user);
  const [isStreamer, setIsStreamer] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchStreamById(id as string));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (currentStream && user) {
      setIsStreamer(currentStream.userId === user.id);
    }
  }, [currentStream, user]);

  const handleEndStream = async () => {
    if (currentStream) {
      await dispatch(
        updateStreamStatus({
          streamId: currentStream.id,
          status: 'ended',
        }),
      );
      router.back();
    }
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      // TODO: Implement chat message sending
      setChatMessage('');
    }
  };

  const toggleChat = () => {
    setIsChatVisible(!isChatVisible);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#493d8a" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => dispatch(fetchStreamById(id as string))}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentStream) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Stream not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Video Container */}
      <View
        style={[
          styles.videoContainer,
          isFullscreen && styles.videoContainerFullscreen,
        ]}
      >
        {isStreamer ? (
          <ExpoCamera
            ref={cameraRef}
            style={styles.camera}
            facing="front"
            ratio="16:9"
          />
        ) : (
          <View style={styles.placeholderVideo}>
            <Text style={styles.placeholderText}>Live Stream</Text>
          </View>
        )}

        {/* Stream Controls Overlay */}
        <View style={styles.controlsOverlay}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.streamInfo}>
            <Text style={styles.streamTitle}>{currentStream.title}</Text>
            <Text style={styles.streamerName}>
              {currentStream.streamer?.displayName || 'Anonymous Streamer'}
            </Text>
          </View>

          <View style={styles.controlButtons}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleFullscreen}
            >
              <Ionicons
                name={isFullscreen ? 'contract' : 'expand'}
                size={24}
                color="#fff"
              />
            </TouchableOpacity>

            {isStreamer && (
              <TouchableOpacity
                style={[styles.controlButton, styles.endButton]}
                onPress={handleEndStream}
              >
                <Ionicons name="close-circle" size={24} color="#ff4d4d" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Chat Section */}
      {isChatVisible && (
        <View style={styles.chatContainer}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatTitle}>Live Chat</Text>
            <TouchableOpacity onPress={toggleChat}>
              <Ionicons name="chevron-down" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.chatMessages}>
            {/* TODO: Implement chat messages */}
          </ScrollView>

          <View style={styles.chatInputContainer}>
            <TextInput
              style={styles.chatInput}
              placeholder="Type a message..."
              value={chatMessage}
              onChangeText={setChatMessage}
              multiline
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
            >
              <Ionicons name="send" size={24} color="#493d8a" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Chat Toggle Button (when chat is hidden) */}
      {!isChatVisible && (
        <TouchableOpacity style={styles.chatToggleButton} onPress={toggleChat}>
          <Ionicons name="chatbubble" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  videoContainer: {
    width: '100%',
    height: VIDEO_HEIGHT,
    backgroundColor: '#000',
  },
  videoContainerFullscreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  camera: {
    flex: 1,
  },
  placeholderVideo: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streamInfo: {
    flex: 1,
    marginLeft: 16,
  },
  streamTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  streamerName: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
  },
  controlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  endButton: {
    backgroundColor: 'rgba(255, 77, 77, 0.2)',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  chatMessages: {
    flex: 1,
    padding: 16,
  },
  chatInputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatToggleButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#493d8a',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4d4d',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#493d8a',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
