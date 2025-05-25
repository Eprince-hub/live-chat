import { StreamFormData, streamSchema } from '@/lib/validations/streams';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { type CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
import type { AppDispatch, RootState } from '../../src/store';
import {
  createStream,
  updateStreamStatus,
} from '../../src/store/slices/streamSlice';

export default function LiveScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [isStreaming, setIsStreaming] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error: streamError } = useSelector(
    (state: RootState) => state.stream,
  );

  const cameraRef = useRef<any>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<StreamFormData>({
    resolver: zodResolver(streamSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      isPrivate: false,
      enableChat: true,
    },
  });

  useEffect(() => {
    if (streamError) {
      Alert.alert('Error', streamError);
    }
  }, [streamError]);

  const onSubmit = async (data: StreamFormData) => {
    try {
      // Create stream using Redux action
      const resultAction = await dispatch(
        createStream({
          title: data.title,
          description: data.description,
          startTime: new Date(),
          products: [], // Add products if needed
          category: data.category,
          isPrivate: data.isPrivate,
          enableChat: data.enableChat,
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
          <CameraView
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
          </CameraView>
        )}
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Stream Title</Text>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                placeholder="Enter your stream title"
                value={value}
                onChangeText={onChange}
                editable={!isStreaming}
              />
            )}
          />
          {errors.title && (
            <Text style={styles.errorText}>{errors.title.message}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  errors.description && styles.inputError,
                ]}
                placeholder="Tell viewers about your stream"
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={4}
                editable={!isStreaming}
              />
            )}
          />
          {errors.description && (
            <Text style={styles.errorText}>{errors.description.message}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <Controller
            control={control}
            name="category"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.category && styles.inputError]}
                placeholder="Select a category"
                value={value}
                onChangeText={onChange}
                editable={!isStreaming}
              />
            )}
          />
          {errors.category && (
            <Text style={styles.errorText}>{errors.category.message}</Text>
          )}
        </View>

        <View style={styles.switchGroup}>
          <View style={styles.switchItem}>
            <Text style={styles.switchLabel}>Private Stream</Text>
            <Controller
              control={control}
              name="isPrivate"
              render={({ field: { onChange, value } }) => (
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: '#e5e5e5', true: '#493d8a' }}
                  thumbColor={value ? '#fff' : '#fff'}
                  disabled={isStreaming}
                />
              )}
            />
          </View>

          <View style={styles.switchItem}>
            <Text style={styles.switchLabel}>Enable Chat</Text>
            <Controller
              control={control}
              name="enableChat"
              render={({ field: { onChange, value } }) => (
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: '#e5e5e5', true: '#493d8a' }}
                  thumbColor={value ? '#fff' : '#fff'}
                  disabled={isStreaming}
                />
              )}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, isStreaming && styles.buttonDisabled]}
          onPress={handleSubmit(onSubmit)}
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
  inputError: {
    borderWidth: 1,
    borderColor: '#ff3b30',
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
    fontSize: 14,
    color: '#ff3b30',
    marginTop: 4,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
