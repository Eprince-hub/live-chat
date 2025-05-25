import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../src/store';
import { fetchStreams } from '../../src/store/slices/streamSlice';
import type { Stream } from '@live-chat/types';

const categories = [
  { id: 'all', name: 'All', icon: 'grid' },
  { id: 'gaming', name: 'Gaming', icon: 'game-controller' },
  { id: 'music', name: 'Music', icon: 'musical-notes' },
  { id: 'art', name: 'Art', icon: 'color-palette' },
  { id: 'tech', name: 'Tech', icon: 'hardware-chip' },
  { id: 'education', name: 'Education', icon: 'school' },
];

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const dispatch = useDispatch<AppDispatch>();
  const { streams, isLoading, error } = useSelector(
    (state: RootState) => state.stream,
  );

  useEffect(() => {
    dispatch(fetchStreams());
  }, [dispatch]);

  const filteredStreams = streams.filter((stream) => {
    const matchesSearch = stream.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    // For now, we'll show all streams since category is not in the Stream type
    return matchesSearch;
  });

  const renderCategoryItem = ({ item }: { item: typeof categories[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && styles.selectedCategory,
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Ionicons
        name={item.icon as any}
        size={24}
        color={selectedCategory === item.id ? '#fff' : '#666'}
      />
      <Text
        style={[
          styles.categoryName,
          selectedCategory === item.id && styles.selectedCategoryText,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderStreamItem = ({ item }: { item: Stream }) => (
    <TouchableOpacity
      style={styles.streamCard}
      onPress={() => router.push(`/(tabs)/stream/${item.id}`)}
    >
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

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#493d8a" />
      </View>
    );
  }

  if (error) {
    return renderEmptyState(
      'Unable to load streams',
      'Please check your connection and try again',
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search streams..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.content}>
        {/* Featured Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredContent}
          >
            {filteredStreams.slice(0, 3).map((stream) => (
              <TouchableOpacity
                key={stream.id}
                style={styles.featuredCard}
                onPress={() => router.push(`/(tabs)/stream/${stream.id}`)}
              >
                <Image
                  source={{ uri: stream.thumbnailUrl || 'https://picsum.photos/300/200' }}
                  style={styles.featuredThumbnail}
                  resizeMode="cover"
                />
                <View style={styles.featuredInfo}>
                  <Text style={styles.featuredTitle}>{stream.title}</Text>
                  <Text style={styles.featuredStreamer}>
                    {stream.streamer?.displayName || 'Anonymous Streamer'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Live Now Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live Now</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.liveContent}
          >
            {filteredStreams.slice(0, 5).map((stream) => (
              <TouchableOpacity
                key={stream.id}
                style={styles.liveCard}
                onPress={() => router.push(`/(tabs)/stream/${stream.id}`)}
              >
                <Image
                  source={{ uri: stream.thumbnailUrl || 'https://picsum.photos/300/200' }}
                  style={styles.liveThumbnail}
                  resizeMode="cover"
                />
                <View style={styles.liveInfo}>
                  <Text style={styles.liveTitle}>{stream.title}</Text>
                  <Text style={styles.liveStreamer}>
                    {stream.streamer?.displayName || 'Anonymous Streamer'}
                  </Text>
                  <View style={styles.viewerInfo}>
                    <View style={styles.viewerDot} />
                    <Text style={styles.viewerCount}>{stream.viewerCount} watching</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((category) => renderCategoryItem({ item: category }))}
          </ScrollView>
        </View>

        {/* All Streams Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Streams</Text>
          {filteredStreams.length === 0 ? (
            renderEmptyState(
              'No streams found',
              searchQuery
                ? 'Try adjusting your search'
                : 'Be the first to start streaming',
            )
          ) : (
            <FlatList
              data={filteredStreams}
              renderItem={renderStreamItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.streamList}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  featuredContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  featuredCard: {
    width: 280,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuredThumbnail: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  featuredInfo: {
    padding: 12,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  featuredStreamer: {
    fontSize: 14,
    color: '#666',
  },
  liveContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  liveCard: {
    width: 240,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  liveThumbnail: {
    width: '100%',
    height: 135,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  liveInfo: {
    padding: 12,
  },
  liveTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  liveStreamer: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  categoriesContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  selectedCategory: {
    backgroundColor: '#493d8a',
  },
  categoryName: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  streamList: {
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
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  streamInfo: {
    padding: 12,
  },
  streamTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  streamerName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
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
    marginRight: 4,
  },
  viewerCount: {
    fontSize: 12,
    color: '#666',
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
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
}); 