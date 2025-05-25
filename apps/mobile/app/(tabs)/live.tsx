import { Ionicons } from '@expo/vector-icons';
import type { Stream } from '@live-chat/types';
import {
  type CameraType,
  CameraView as ExpoCamera,
  useCameraPermissions,
} from 'expo-camera';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../src/lib/api';
import type { AppDispatch, RootState } from '../../src/store';
import {
  createStream,
  updateStreamStatus,
} from '../../src/store/slices/streamSlice';

export default function LiveScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [enableChat, setEnableChat] = useState(true);

  const dispatch = useDispatch<AppDispatch>();
  const { isLoading: isStreamLoading, error: streamError } = useSelector(
    (state: RootState) => state.stream,
  );

  const cameraRef = useRef<any>(null);

  useEffect(() => {
    if (streamError) {
      Alert.alert('Error', streamError);
    }
  }, [streamError]);

  const handleStartStream = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a stream title');
      return;
    }

    if (!category.trim()) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    try {
      setIsLoading(true);

      // Create stream using Redux action
      const resultAction = await dispatch(
        createStream({
          title,
          description,
          startTime: new Date(),
          products: [], // Add products if needed
        }),
      );

      if (createStream.fulfilled.match(resultAction)) {
        const stream = resultAction.payload;

        // Update stream status to live
        await dispatch(
          updateStreamStatus({
            streamId: stream.id,
            status: 'live',
          }),
        );

        setIsStreaming(true);
        router.push(`/stream/${stream.id}`);
      }
    } catch (error: any) {
      console.error('Error starting stream:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message ||
          'Failed to start stream. Please try again.',
      );
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#493d8a" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="videocam-off" size={48} color="#666" />
        <Text style={styles.errorText}>No access to camera</Text>
        <Text style={styles.errorSubtext}>
          Please enable camera access in your device settings
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="radio" size={48} color="#493d8a" />
        <Text style={styles.headerTitle}>Go Live</Text>
        <Text style={styles.headerSubtitle}>
          Set up your stream and connect with your audience
        </Text>
      </View>

      <View style={styles.cameraContainer}>
        {permission && (
          <ExpoCamera
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            ratio="16:9"
          >
            <View style={styles.cameraControls}>
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={toggleCameraFacing}
              >
                <Ionicons name="camera-reverse" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </ExpoCamera>
        )}
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Stream Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your stream title"
            value={title}
            onChangeText={setTitle}
            editable={!isStreaming}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell viewers about your stream"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            editable={!isStreaming}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            placeholder="Select a category"
            value={category}
            onChangeText={setCategory}
            editable={!isStreaming}
          />
        </View>

        <View style={styles.switchGroup}>
          <View style={styles.switchItem}>
            <Text style={styles.switchLabel}>Private Stream</Text>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              trackColor={{ false: '#e5e5e5', true: '#493d8a' }}
              thumbColor={isPrivate ? '#fff' : '#fff'}
              disabled={isStreaming}
            />
          </View>

          <View style={styles.switchItem}>
            <Text style={styles.switchLabel}>Enable Chat</Text>
            <Switch
              value={enableChat}
              onValueChange={setEnableChat}
              trackColor={{ false: '#e5e5e5', true: '#493d8a' }}
              thumbColor={enableChat ? '#fff' : '#fff'}
              disabled={isStreaming}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, isStreaming && styles.buttonDisabled]}
          onPress={handleStartStream}
          disabled={isStreaming || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isStreaming ? 'Streaming...' : 'Start Streaming'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  cameraContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
  },
  cameraButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  switchGroup: {
    marginBottom: 24,
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  button: {
    backgroundColor: '#493d8a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
