import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { getPraiseVideos, getWorshipVideos } from "./services/api";
import createVideoPressHandler from "./utils/videoNavigation";

// Helper to extract a YouTube video ID from any common URL format
function getYouTubeId(url) {
  const regExp = /^.*(?:(?:youtu\.be\/)|(?:v=)|(?:\/embed\/))([^#&?]{11}).*/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

export default function Worship() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("praise");
  const [isLoading, setIsLoading] = useState(true);
  const [praiseVideos, setPraiseVideos] = useState([]);
  const [worshipVideos, setWorshipVideos] = useState([]);
  const [error, setError] = useState(null);

  const handleVideoPress = createVideoPressHandler(router);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        const [praise, worship] = await Promise.all([
          getPraiseVideos(),
          getWorshipVideos(),
        ]);
        setPraiseVideos(praise);
        setWorshipVideos(worship);
      } catch (err) {
        console.error("Error fetching videos:", err);
        setError("Failed to load videos. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handleOpenURL = (url) => {
    Linking.openURL(url).catch((err) => {
      console.error("Error opening YouTube link:", err);
      Alert.alert("Error", "Something went wrong while opening the video");
    });
  };

  const renderSongsList = (songs) => {
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
            onPress={() => {
              setError(null);
              setIsLoading(true);
              // re-fetch
              Promise.all([getPraiseVideos(), getWorshipVideos()])
                .then(([p, w]) => {
                  setPraiseVideos(p);
                  setWorshipVideos(w);
                })
                .catch((err) => {
                  setError("Failed to load videos. Please try again later.");
                })
                .finally(() => setIsLoading(false));
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!songs || songs.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No videos available at the moment.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.songsSection}>
        {songs.map((song) => {
          const videoId = getYouTubeId(song.youtube_url);
          const thumbnailUri = song.thumbnail
            ? song.thumbnail
            : videoId
            ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
            : null;

          return (
            <TouchableOpacity
              key={song.id}
              style={styles.songCard}
              onPress={() => handleVideoPress(song)}
            >
              {thumbnailUri ? (
                <Image
                  source={{ uri: thumbnailUri }}
                  style={styles.songThumbnail}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[styles.songThumbnail, styles.thumbnailPlaceholder]}
                >
                  <Ionicons name="videocam-outline" size={40} color="#999" />
                  <Text style={styles.placeholderText}>No Thumbnail</Text>
                </View>
              )}

              <View style={styles.songInfo}>
                <Text style={styles.songTitle}>{song.title}</Text>
                <TouchableOpacity
                  style={styles.watchFullButton}
                  // onPress={() => handleOpenURL(song.youtube_url)}
                  onPress={() => handleVideoPress(song)}
                >
                  <Text style={styles.watchFullText}>Click to Watch</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#1e67cd", "#1e67cd"]} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Praise & Worship</Text>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "praise" && styles.activeTab]}
          onPress={() => setActiveTab("praise")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "praise" && styles.activeTabText,
            ]}
          >
            Praise
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "worship" && styles.activeTab]}
          onPress={() => setActiveTab("worship")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "worship" && styles.activeTabText,
            ]}
          >
            Worship
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {activeTab === "praise"
          ? renderSongsList(praiseVideos)
          : renderSongsList(worshipVideos)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8" },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#FFF" },
  scrollView: { flex: 1 },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: { borderBottomColor: "#1e67cd" },
  tabText: { fontSize: 16, fontWeight: "600", color: "#666" },
  activeTabText: { color: "#1e67cd" },

  songsSection: { padding: 20 },
  songCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  songThumbnail: {
    width: 120,
    height: 90,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  thumbnailPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: { marginTop: 5, color: "#999", fontSize: 12 },

  songInfo: { flex: 1, marginLeft: 15, marginRight: 10 },
  songTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  watchFullButton: {
    backgroundColor: "#1e67cd",
    padding: 8,
    borderRadius: 5,
    marginTop: 8,
  },
  watchFullText: {
    color: "#FFF",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "600",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    minHeight: 200,
  },
  loadingText: { marginTop: 10, fontSize: 16, color: "#666" },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    minHeight: 200,
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
  retryButtonText: { color: "#FFF", fontSize: 16, fontWeight: "600" },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    minHeight: 200,
  },
  emptyText: { fontSize: 16, color: "#666", textAlign: "center" },
});