import React, { useEffect, useState } from 'react';
import { Alert, View, Text, TouchableOpacity, ScrollView, Image, Linking } from 'react-native';
import { getVideos, getQuotes, getEvents, getProjects } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const useData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({
    prophecies: [],
    crusades: [],
    testimonies: [],
    healings: [],
    prayers: [],
    massPrayers: [],
    deliverance: [],
    charities: [],
    quotes: [],
    events: [],
    projects: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Check if we have preloaded data
        if (global.__PRELOADED_DATA__) {
          setData(global.__PRELOADED_DATA__);
          setIsLoading(false);
          // Clear the preloaded data after using it
          global.__PRELOADED_DATA__ = null;
          return;
        }

        // If no preloaded data, fetch normally
        const [
          prophecies,
          crusades,
          testimonies,
          healings,
          prayers,
          massPrayers,
          deliverance,
          charities,
          quotes,
          events,
          projects
        ] = await Promise.all([
          getVideos('prophecy'),
          getVideos('crusades'),
          getVideos('testimonies'),
          getVideos('healings'),
          getVideos('prayers'),
          getVideos('mass_prayers'),
          getVideos('deliverance'),
          getVideos('charities'),
          getQuotes(),
          getEvents(),
          getProjects()
        ]);

        // Sort and get the two most recent items for each category
        const sortByDate = (a, b) => new Date(b.created_at) - new Date(a.created_at);
        
        setData({
          prophecies: prophecies.sort(sortByDate).slice(0, 5),
          crusades: crusades.sort(sortByDate).slice(0, 5),
          testimonies: testimonies.sort(sortByDate).slice(0, 5),
          healings: healings.sort(sortByDate).slice(0, 5),
          prayers: prayers.sort(sortByDate).slice(0, 5),
          massPrayers: massPrayers.sort(sortByDate).slice(0, 5),
          deliverance: deliverance.sort(sortByDate).slice(0, 5),
          charities: charities.sort(sortByDate).slice(0, 2),
          quotes: quotes.sort(sortByDate).slice(0, 2),
          events: events.sort(sortByDate).slice(0, 2),
          projects: projects.sort(sortByDate).slice(0, 2)
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'Failed to load content. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { isLoading, data };
};

const renderVideoSection = (title, data, category) => {
  console.log(`\n=== Rendering ${title} Section ===`);
  console.log('Category:', category);
  console.log('Number of videos:', data.length);
  console.log('Video data:', JSON.stringify(data, null, 2));

  const extractVideoId = (url) => {
    if (!url) return null;
    
    // Regular YouTube URL (youtube.com/watch?v=...)
    if (url.includes('youtube.com/watch?v=')) {
      const match = url.match(/[?&]v=([^&]+)/);
      return match ? match[1] : null;
    }
    
    // Short YouTube URL (youtu.be/...)
    if (url.includes('youtu.be/')) {
      const match = url.match(/youtu\.be\/([^?]+)/);
      return match ? match[1] : null;
    }
    
    // YouTube embed URL (youtube.com/embed/...)
    if (url.includes('youtube.com/embed/')) {
      const match = url.match(/embed\/([^?]+)/);
      return match ? match[1] : null;
    }
    
    // YouTube shorts URL (youtube.com/shorts/...)
    if (url.includes('youtube.com/shorts/')) {
      const match = url.match(/shorts\/([^?]+)/);
      return match ? match[1] : null;
    }
    
    console.log('Unrecognized YouTube URL format:', url);
    return null;
  };

  return (
    <View style={styles.sermonsContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity 
          onPress={() => router.push(`/${category}`)} 
          style={styles.viewAllButton}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="arrow-forward" size={16} color="#D8C9AE" />
        </TouchableOpacity>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sermonsScroll}>
        {data.map((item) => {
          console.log(`\nProcessing video: ${item.title}`);
          console.log('Original YouTube URL:', item.youtube_url);

          const videoId = extractVideoId(item.youtube_url);
          console.log('Extracted video ID:', videoId);

          // Generate thumbnail URL with fallback options
          let thumbnailUrl = null;
          if (videoId) {
            const qualities = ['maxresdefault', 'hqdefault', 'mqdefault', 'default'];
            thumbnailUrl = `https://img.youtube.com/vi/${videoId}/${qualities[0]}.jpg`;
            console.log('Generated thumbnail URL:', thumbnailUrl);
          }

          return (
            <TouchableOpacity 
              key={item.id} 
              style={styles.sermonCard}
              onPress={() => handleVideoPress(item)}
            >
              <View style={styles.thumbnailContainer}>
                <Image
                  source={{ 
                    uri: thumbnailUrl || 'https://via.placeholder.com/300x169',
                    cache: 'force-cache'
                  }}
                  style={styles.sermonThumbnail}
                  resizeMode="cover"
                  onLoadStart={() => console.log(`Starting to load thumbnail for: ${item.title}`)}
                  onLoad={() => console.log(`Successfully loaded thumbnail for: ${item.title}`)}
                  onError={(e) => {
                    console.error(`Error loading thumbnail for: ${item.title}`);
                    console.error('Error details:', e.nativeEvent.error);
                    console.error('Failed URL:', thumbnailUrl);
                    
                    // Try next quality if available
                    if (videoId) {
                      const qualities = ['hqdefault', 'mqdefault', 'default'];
                      const currentQuality = thumbnailUrl?.split('/').pop()?.split('.')[0];
                      const nextQuality = qualities[qualities.indexOf(currentQuality) + 1];
                      if (nextQuality) {
                        const newThumbnailUrl = `https://img.youtube.com/vi/${videoId}/${nextQuality}.jpg`;
                        console.log(`Trying fallback thumbnail quality: ${nextQuality}`);
                        console.log('New thumbnail URL:', newThumbnailUrl);
                        thumbnailUrl = newThumbnailUrl;
                      } else {
                        console.log('No more fallback qualities available');
                      }
                    }
                  }}
                />
                <LinearGradient
                  colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
                  style={styles.thumbnailOverlay}
                >
                  <View style={styles.playButton}>
                    <Ionicons name="play-circle" size={50} color="#FFF" />
                  </View>
                </LinearGradient>
              </View>
              <View style={styles.sermonInfo}>
                <Text style={styles.sermonTitle}>{item.title}</Text>
                <TouchableOpacity onPress={() => Linking.openURL(item.youtube_url)}>
                  <Text style={styles.watchFullVideo}>Click here to Watch Full Video</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default useData; 