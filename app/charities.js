import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BASE_URL } from "./base_url";
import createVideoPressHandler from "./utils/videoNavigation";

export default function Deliverance() {
  const router = useRouter();
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const handleVideoPress = createVideoPressHandler(router);

  useEffect(() => {
    fetchVideos();
  }, []);
  const getYouTubeId = (url) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };
  const fetchVideos = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/videos/by_category/?category=charities`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch videos");
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
    Linking.openURL(url).catch((err) => {
      console.error("Error opening YouTube link:", err);
      Alert.alert("Error", "Something went wrong while opening the video");
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
        <TouchableOpacity style={styles.retryButton} onPress={fetchVideos}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {videos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No videos available at the moment.
            </Text>
          </View>
        ) : (
          <View style={styles.videosGrid}>
            {videos.map((video) => {
              const videoId = getYouTubeId(video.youtube_url);
              const thumbnailUrl = videoId
                ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                : null;

              return (
                <TouchableOpacity
                  key={video.id}
                  style={styles.videoCard}
                  // onPress={() => handleOpenURL(video.youtube_url)}
                  onPress={() => handleVideoPress(video)}
                >
                  <View style={styles.thumbnailContainer}>
                    {thumbnailUrl ? (
                      <Image
                        source={{ uri: thumbnailUrl }}
                        style={styles.videoThumbnail}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.placeholderContainer}>
                        <Ionicons
                          name="videocam-outline"
                          size={40}
                          color="#999"
                        />
                        <Text style={styles.placeholderText}>
                          No Thumbnail Available
                        </Text>
                      </View>
                    )}
                    <LinearGradient
                      colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.7)"]}
                      style={styles.thumbnailOverlay}
                    >
                      <View style={styles.playButton}>
                        <Ionicons name="play-circle" size={50} color="#FFF" />
                      </View>
                    </LinearGradient>
                  </View>
                  <View style={styles.videoInfo}>
                    <Text style={styles.videoTitle}>{video.title}</Text>
                    <TouchableOpacity
                      style={styles.watchButton}
                      // onPress={() => handleOpenURL(video.youtube_url)}
                      onPress={() => handleVideoPress(video)}
                    >
                      <Text style={styles.watchButtonText}>Watch Video</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F8F8F8",
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: "#1e67cd",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginLeft: 16,
    color: "#FFF",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    minHeight: 200,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  videosGrid: {
    flexDirection: "column",
    gap: 16,
  },
  videoCard: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumbnailContainer: {
    position: "relative",
    height: 200,
  },
  videoThumbnail: {
    width: "100%",
    height: "100%",
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  placeholderText: {
    marginTop: 8,
    color: "#999",
    fontSize: 12,
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(216,201,174,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  videoInfo: {
    padding: 16,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  watchButton: {
    backgroundColor: "#1e67cd",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  watchButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});