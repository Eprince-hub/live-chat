import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import api from '../../src/lib/api';
import type { Stream } from '@live-chat/types';

type Category = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const categories: Category[] = [
  { id: '1', name: 'Gaming', icon: 'game-controller' },
  { id: '2', name: 'Music', icon: 'musical-notes' },
  { id: '3', name: 'Cooking', icon: 'restaurant' },
  { id: '4', name: 'Art', icon: 'brush' },
  { id: '5', name: 'Education', icon: 'school' },
  { id: '6', name: 'Sports', icon: 'basketball' },
  { id: '7', name: 'Technology', icon: 'laptop' },
  { id: '8', name: 'Travel', icon: 'airplane' },
];

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredStreams, setFeaturedStreams] = useState<Stream[]>([]);
  const [recommendedStreams, setRecommendedStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStreams = async () => {
    try {
      setLoading(true);
      setError(null);
      const [featuredResponse, recommendedResponse] = await Promise.all([
        api.get('/streams/featured'),
        api.get('/streams/recommended'),
      ]);
      setFeaturedStreams(featuredResponse.data.data || []);
      setRecommendedStreams(recommendedResponse.data.data || []);
    } catch (err: any) {
      // Handle different types of errors
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (err.response.status === 401) {
          setError('Please sign in to view streams');
        } else if (err.response.status === 404) {
          // No streams found is not really an error
          setFeaturedStreams([]);
          setRecommendedStreams([]);
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
  }, []);

  const handleCategoryPress = (category: Category) => {
    router.push({
      pathname: '/category/[id]',
      params: { id: category.id, name: category.name }
    });
  };

  const renderStreamItem = ({ item }: { item: Stream }) => (
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

  const renderEmptyState = (message: string, subMessage?: string) => (
    <View style={styles.emptyContainer}>
      <Ionicons name="videocam-outline" size={48} color="#666" />
      <Text style={styles.emptyText}>{message}</Text>
      {subMessage && <Text style={styles.emptySubtext}>{subMessage}</Text>}
    </View>
  );

  const renderStreamSection = (title: string, streams: Stream[]) => {
    if (streams.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <FlatList
          data={streams}
          renderItem={renderStreamItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>
    );
  };

  if (loading) {
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

  const hasNoContent = featuredStreams.length === 0 && recommendedStreams.length === 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search streams..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <Text style={styles.sectionTitle}>Categories</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryCard}
            onPress={() => handleCategoryPress(category)}
          >
            <Ionicons
              name={category.icon}
              size={32}
              color="#493d8a"
            />
            <Text style={styles.categoryName}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {hasNoContent ? (
        renderEmptyState(
          'No streams available',
          'Be the first to start streaming!'
        )
      ) : (
        <>
          {renderStreamSection('Featured Streams', featuredStreams)}
          {renderStreamSection('Recommended for You', recommendedStreams)}
        </>
      )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    margin: 16,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#1a1a1a',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    marginHorizontal: 16,
    color: '#1a1a1a',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    width: 100,
    height: 100,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryName: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  streamCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
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
    marginTop: 40,
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