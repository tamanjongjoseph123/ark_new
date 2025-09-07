import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Linking, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function VideoCategory({ category, title }) {
  const router = useRouter();
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, [category]);

  const fetchVideos = async () => {
    try {
      const response = await fetch(`http://192.168.56.169:8000/api/videos/by_category/?category=${category}`);
      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }
      const data = await response.json();
      setVideos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenURL = (url) => {
    Linking.openURL(url)
      .catch(err => {
        console.error('Error opening YouTube link:', err);
        Alert.alert('Error', 'Something went wrong while opening the video');
      });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e67cd" />
        <Text style={styles.loadingText}>Loading videos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchVideos}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1e67cd', '#1e67cd']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
      </LinearGradient>

      <ScrollView style={styles.scrollView}>
        {videos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No videos available at the moment.</Text>
          </View>
        ) : (
          <View style={styles.videosGrid}>
            {videos.map((video) => (
              <TouchableOpacity 
                key={video.id} 
                style={styles.videoCard}
                onPress={() => handleOpenURL(video.youtube_url)}
              >
                <Image
                  source={{ uri: `https://img.youtube.com/vi/${video.youtube_url.split('v=')[1]}/maxresdefault.jpg` }}
                  style={styles.videoThumbnail}
                  resizeMode="cover"
                />
                <View style={styles.videoInfo}>
                  <Text style={styles.videoTitle}>{video.title}</Text>
                  <TouchableOpacity 
                    style={styles.watchButton}
                    onPress={() => handleOpenURL(video.youtube_url)}
                  >
                    <Text style={styles.watchButtonText}>Watch Video</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F8F8',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#1e67cd',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginLeft: 16,
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  videosGrid: {
    flexDirection: 'column',
    gap: 16,
  },
  videoCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  videoThumbnail: {
    width: '100%',
    height: 200,
  },
  videoInfo: {
    padding: 16,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  watchButton: {
    backgroundColor: '#1e67cd',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  watchButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 