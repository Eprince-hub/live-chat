import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/lib/api';
import type { Stream } from '@live-chat/types';

export default function CategoryScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStreams = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/streams/category/${id}`);
      setStreams(response.data.data || []);
    } catch (err: any) {
      // Handle different types of errors
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (err.response.status === 401) {
          setError('Please sign in to view streams');
        } else if (err.response.status === 404) {
          // No streams found is not really an error
          setStreams([]);
        } else {
          setError('Unable to load streams at the moment');
        }
      } else if (err.request) {
        // The request was made but no response was received
        setError('Please check your internet connection');
      } else {
        // Something happened in setting up the request
        setError('Unable to load streams at the moment');
      }
      console.error('Error fetching streams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreams();
  }, [id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStreams();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: Stream }) => (
    <TouchableOpacity
      style={styles.streamCard}
      onPress={() => router.push(`/stream/${item.id}`)}
    >
      <Image
        source={{ uri: item.thumbnailUrl || 'https://picsum.photos/300/200' }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.streamInfo}>
        <Text style={styles.streamTitle}>{item.title}</Text>
        <Text style={styles.streamerName}>{item.streamer.displayName}</Text>
        <View style={styles.viewerInfo}>
          <View style={styles.viewerDot} />
          <Text style={styles.viewerCount}>{item.viewerCount} watching</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="videocam-outline" size={48} color="#666" />
      <Text style={styles.emptyText}>No streams in this category</Text>
      <Text style={styles.emptySubtext}>
        Be the first to start streaming in {name}!
      </Text>
      <TouchableOpacity
        style={styles.startStreamButton}
        onPress={() => router.push('/live')}
      >
        <Text style={styles.startStreamButtonText}>Start Streaming</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#493d8a" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="cloud-offline-outline" size={48} color="#666" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchStreams}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: name,
          headerTitleStyle: styles.headerTitle,
        }}
      />
      {streams.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={streams}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  streamCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnail: {
    height: 180,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  streamInfo: {
    padding: 12,
  },
  streamTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#1a1a1a',
  },
  streamerName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  viewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff4d4d',
    marginRight: 6,
  },
  viewerCount: {
    fontSize: 12,
    color: '#888',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  startStreamButton: {
    backgroundColor: '#493d8a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startStreamButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
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