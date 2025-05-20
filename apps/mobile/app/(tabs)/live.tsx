import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LiveScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [enableChat, setEnableChat] = useState(true);

  const handleStartStream = () => {
    // Handle stream start logic
    console.log('Starting stream with:', {
      title,
      description,
      category,
      isPrivate,
      enableChat,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="radio" size={48} color="#493d8a" />
        <Text style={styles.headerTitle}>Go Live</Text>
        <Text style={styles.headerSubtitle}>
          Set up your stream and connect with your audience
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Stream Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your stream title"
            value={title}
            onChangeText={setTitle}
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
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            placeholder="Select a category"
            value={category}
            onChangeText={setCategory}
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
            />
          </View>

          <View style={styles.switchItem}>
            <Text style={styles.switchLabel}>Enable Chat</Text>
            <Switch
              value={enableChat}
              onValueChange={setEnableChat}
              trackColor={{ false: '#e5e5e5', true: '#493d8a' }}
              thumbColor={enableChat ? '#fff' : '#fff'}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleStartStream}>
          <Text style={styles.buttonText}>Start Streaming</Text>
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
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 