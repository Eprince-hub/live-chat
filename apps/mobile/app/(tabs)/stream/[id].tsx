import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ChatMessage } from '@live-chat/types';
import { Button } from '@live-chat/ui';
import { CameraView as ExpoCamera, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
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
import { z } from 'zod';
import type { AppDispatch, RootState } from '../../../src/store';
import {
  connectToStream,
  disconnect as disconnectChat,
  loadMoreMessages,
  sendMessage,
  sendReaction,
  sendTypingIndicator,
} from '../../../src/store/slices/chatSlice';
import {
  fetchStreamById,
  updateStreamStatus,
} from '../../../src/store/slices/streamSlice';
import {
  disconnect as disconnectWebRTC,
  initializeStream,
  setLocalStream,
  startStreaming,
} from '../../../src/store/slices/webrtcSlice';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_HEIGHT = SCREEN_WIDTH * (9 / 16); // 16:9 aspect ratio

// Form validation schema
const chatMessageSchema = z.object({
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(500, 'Message is too long'),
});

type ChatMessageFormData = z.infer<typeof chatMessageSchema>;

export default function StreamScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { currentStream, isLoading, error } = useSelector(
    (state: RootState) => state.stream,
  );
  const {
    messages,
    isConnected: isChatConnected,
    isLoadingMore,
    hasMore,
    typingUsers,
  } = useSelector((state: RootState) => state.chat);
  const {
    localStream,
    remoteStream,
    isConnected: isWebRTCConnected,
    isStreaming,
  } = useSelector((state: RootState) => state.webrtc);
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [isStreamer, setIsStreamer] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const cameraRef = useRef<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [streamQuality, setStreamQuality] = useState<'low' | 'medium' | 'high'>(
    'medium',
  );
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChatMessageFormData>({
    resolver: zodResolver(chatMessageSchema),
    defaultValues: {
      message: '',
    },
  });

  useEffect(() => {
    if (id) {
      if (!token) {
        Alert.alert(
          'Authentication Required',
          'Please log in to view this stream',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/auth/login'),
            },
          ],
        );
        return;
      }
      dispatch(fetchStreamById(id as string));
    }
  }, [id, dispatch, token, router]);

  useEffect(() => {
    if (currentStream && user) {
      const isUserStreamer = currentStream.userId === user.id;
      setIsStreamer(isUserStreamer);

      if (token) {
        // Initialize WebRTC
        dispatch(
          initializeStream({
            streamId: currentStream.id,
            token,
          }),
        );

        // Connect to chat
        dispatch(
          connectToStream({
            streamId: currentStream.id,
            token,
          }),
        );
      }
    }

    return () => {
      dispatch(disconnectChat());
      dispatch(disconnectWebRTC());
    };
  }, [currentStream, user, token, dispatch]);

  useEffect(() => {
    if (isStreamer && cameraRef.current) {
      const startCamera = async () => {
        try {
          if (!permission?.granted) {
            const { granted } = await requestPermission();
            if (!granted) {
              console.error('Camera permission not granted');
              return;
            }
          }

          const stream = await cameraRef.current.getStreamAsync();
          dispatch(setLocalStream(stream));
          dispatch(startStreaming({ streamId: currentStream?.id || '' }));
        } catch (error) {
          console.error('Failed to start camera:', error);
        }
      };

      startCamera();
    }
  }, [isStreamer, permission, requestPermission, dispatch, currentStream]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const handleEndStream = async () => {
    if (currentStream) {
      try {
        await dispatch(
          updateStreamStatus({
            streamId: currentStream.id,
            status: 'ended',
          }),
        );
        router.back();
      } catch (error) {
        Alert.alert('Error', 'Failed to end stream');
      }
    }
  };

  const handleSendMessage = async (data: ChatMessageFormData) => {
    if (!currentStream || !token) return;
    dispatch(
      sendMessage({ streamId: currentStream.id, content: data.message }),
    );
    reset();
  };

  const handleReaction = (messageId: string, reaction: string) => {
    if (!currentStream || !token) return;
    dispatch(sendReaction({ messageId, reaction }));
  };

  const handleTyping = () => {
    if (!currentStream || !token) return;
    dispatch(
      sendTypingIndicator({ streamId: currentStream.id, isTyping: true }),
    );
  };

  const toggleChat = () => {
    setIsChatVisible(!isChatVisible);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleLoadMore = async () => {
    if (!currentStream || isLoadingMore || !hasMore || messages.length === 0)
      return;
    const oldestMessage = messages[0];
    await dispatch(
      loadMoreMessages({
        streamId: currentStream.id,
        beforeId: oldestMessage.id,
      }),
    );
  };

  const handleStartStreaming = async () => {
    if (!currentStream) return;
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert(
          'Error',
          'Camera permission is required to start streaming',
        );
        return;
      }
    }

    try {
      await dispatch(startStreaming({ streamId: currentStream.id }));
    } catch (error) {
      Alert.alert('Error', 'Failed to start streaming');
    }
  };

  const handleQualityChange = (quality: 'low' | 'medium' | 'high') => {
    setStreamQuality(quality);
    // TODO: Implement quality change logic
  };

  const renderStreamControls = () => (
    <View style={styles.controls}>
      <Button
        onPress={() => handleQualityChange('low')}
        variant={streamQuality === 'low' ? 'primary' : 'secondary'}
        label="Low"
        size="small"
      />
      <Button
        onPress={() => handleQualityChange('medium')}
        variant={streamQuality === 'medium' ? 'primary' : 'secondary'}
        label="Medium"
        size="small"
      />
      <Button
        onPress={() => handleQualityChange('high')}
        variant={streamQuality === 'high' ? 'primary' : 'secondary'}
        label="High"
        size="small"
      />
    </View>
  );

  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;
    const typingUsersList = Array.from(typingUsers);
    return (
      <Text style={styles.typingIndicator}>
        {typingUsersList.length === 1
          ? `${typingUsersList[0]} is typing...`
          : `${typingUsersList.length} people are typing...`}
      </Text>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#493d8a" />
      </View>
    );
  }

  if (!currentStream) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="videocam-off" size={48} color="#666" />
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
        {isStreaming ? (
          <View style={styles.cameraContainer}>
            <ExpoCamera
              ref={cameraRef}
              style={styles.camera}
              facing="front"
              ratio="16:9"
            />
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
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>Stream not started</Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartStreaming}
            >
              <Text style={styles.startButtonText}>Start Streaming</Text>
            </TouchableOpacity>
          </View>
        )}

        {renderStreamControls()}
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

          <ScrollView
            ref={scrollViewRef}
            style={styles.chatMessages}
            contentContainerStyle={styles.chatMessagesContent}
            onScroll={({ nativeEvent }) => {
              if (nativeEvent.contentOffset.y === 0) {
                handleLoadMore();
              }
            }}
            scrollEventThrottle={400}
          >
            {isLoadingMore && <ActivityIndicator style={styles.loadingMore} />}
            {messages.map((message: ChatMessage) => (
              <View
                key={message.id}
                style={[
                  styles.messageContainer,
                  message.userId === user?.id && styles.ownMessage,
                ]}
              >
                <Text style={styles.messageSender}>
                  {message.userId === user?.id ? 'You' : 'User'}
                </Text>
                <Text style={styles.messageContent}>{message.content}</Text>
                <Text style={styles.messageTime}>
                  {new Date(message.createdAt).toLocaleTimeString()}
                </Text>
              </View>
            ))}
          </ScrollView>

          {renderTypingIndicator()}

          <View style={styles.chatInputContainer}>
            <Controller
              control={control}
              name="message"
              render={({ field: { onChange, value, onBlur } }) => (
                <TextInput
                  value={value}
                  onChangeText={(text) => {
                    onChange(text);
                    handleTyping();
                  }}
                  onBlur={onBlur}
                  placeholder="Type a message..."
                  style={styles.chatInput}
                />
              )}
            />
            <Button
              onPress={handleSubmit(handleSendMessage)}
              disabled={!isChatConnected}
              label="Send"
              variant="primary"
              size="small"
            />
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
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
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
  },
  chatMessagesContent: {
    padding: 16,
  },
  messageContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    maxWidth: '80%',
  },
  ownMessage: {
    backgroundColor: '#493d8a',
    alignSelf: 'flex-end',
  },
  messageSender: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  messageContent: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  messageTime: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    alignSelf: 'flex-end',
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
  sendButtonDisabled: {
    opacity: 0.5,
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
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loadingMore: {
    padding: 10,
  },
  typingIndicator: {
    padding: 10,
    fontStyle: 'italic',
    color: '#666',
  },
  startButton: {
    backgroundColor: '#493d8a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
