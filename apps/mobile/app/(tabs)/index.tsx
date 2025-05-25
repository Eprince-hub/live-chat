import type { Stream } from '@live-chat/types';
import React, { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../src/store';
import { fetchStreams } from '../../src/store/slices/streamSlice';

export default function HomeScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { streams, isLoading, error } = useSelector(
    (state: RootState) => state.stream,
  );
  const user = useSelector((state: RootState) => state.auth.user);

  const loadStreams = useCallback(async () => {
    try {
      await dispatch(fetchStreams());
    } catch (err) {
      console.error('Error fetching streams:', err);
    }
  }, [dispatch]);

  useEffect(() => {
    loadStreams();
  }, [loadStreams]);

  const onRefresh = useCallback(async () => {
    await loadStreams();
  }, [loadStreams]);

  const renderItem = ({ item }: { item: Stream }) => (
    <TouchableOpacity style={styles.streamCard}>
      <Image
        source={{ uri: item.thumbnailUrl || 'https://picsum.photos/300/200' }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.streamInfo}>
        <Text style={styles.streamTitle}>{item.title}</Text>
        <Text style={styles.streamerName}>
          {item.streamer?.displayName || 'Anonymous Streamer'}
        </Text>
        <View style={styles.viewerInfo}>
          <View style={styles.viewerDot} />
          <Text style={styles.viewerCount}>
            {item.viewerCount || 0} watching
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
        <TouchableOpacity style={styles.retryButton} onPress={loadStreams}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome back, {user?.displayName || 'User'}!
        </Text>
        <Text style={styles.sectionTitle}>Live Now</Text>
      </View>

      {streams.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No live streams at the moment</Text>
          <Text style={styles.emptySubtext}>
            Be the first to start streaming!
          </Text>
        </View>
      ) : (
        <FlatList
          data={streams}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
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
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
