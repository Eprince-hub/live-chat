import React from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useCallback, useState } from 'react';

type Stream = {
  id: string;
  title: string;
  streamer: string;
  viewers: number;
  thumbnail: string;
};

const mockStreams: Stream[] = [
  {
    id: '1',
    title: 'Gaming with Friends',
    streamer: 'JohnDoe',
    viewers: 1200,
    thumbnail: 'https://picsum.photos/300/200',
  },
  {
    id: '2',
    title: 'Cooking Show Live',
    streamer: 'ChefMary',
    viewers: 800,
    thumbnail: 'https://picsum.photos/300/200',
  },
  {
    id: '3',
    title: 'Music Session',
    streamer: 'BandLive',
    viewers: 2500,
    thumbnail: 'https://picsum.photos/300/200',
  },
];

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [streams, setStreams] = useState<Stream[]>(mockStreams);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate fetching new data
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const renderItem = ({ item }: { item: Stream }) => (
    <View style={styles.streamCard}>
      <View style={styles.thumbnailPlaceholder} />
      <View style={styles.streamInfo}>
        <Text style={styles.streamTitle}>{item.title}</Text>
        <Text style={styles.streamerName}>{item.streamer}</Text>
        <Text style={styles.viewerCount}>{item.viewers} viewers</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={streams}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  thumbnailPlaceholder: {
    height: 180,
    backgroundColor: '#f0f0f0',
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
  viewerCount: {
    fontSize: 12,
    color: '#888',
  },
}); 