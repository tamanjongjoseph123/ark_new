import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  Button,
  TouchableOpacity,
  Dimensions
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { StatusBar } from "expo-status-bar";
import { useIsFocused } from "@react-navigation/native";
import { activateKeepAwakeAsync, deactivateKeepAwakeAsync } from "expo-keep-awake";
import { getLiveStreamChannel } from "./services/api";
import { Ionicons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';

export default function LiveStream() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [streamUrl, setStreamUrl] = useState("");
  const [isLoadingStream, setIsLoadingStream] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isStreamOffline, setIsStreamOffline] = useState(false);
  const [backgroundRetryCount, setBackgroundRetryCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef(null);
  const isFocused = useIsFocused();
  const maxRetries = 3;
  const backgroundRetryInterval = useRef(null);
  const { width, height } = Dimensions.get('window');
  const isPortrait = height > width;

  // Handle screen orientation changes
  useEffect(() => {
    let subscription;

    const updateOrientation = async () => {
      try {
        const orientation = await ScreenOrientation.getOrientationAsync();
        const isLandscape = orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT || 
                          orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;
        setIsFullscreen(isLandscape);
      } catch (error) {
        console.error('Error getting orientation:', error);
      }
    };

    // Initial orientation check
    updateOrientation();

    // Subscribe to orientation changes
    subscription = ScreenOrientation.addOrientationChangeListener(updateOrientation);

    return () => {
      if (subscription) {
        ScreenOrientation.removeOrientationChangeListener(subscription);
      }
      // Reset to portrait when component unmounts
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  // Toggle between portrait and landscape
  const toggleFullscreen = async () => {
    try {
      if (isFullscreen) {
        // Return to portrait
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      } else {
        // Go to landscape
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      }
      // Update state after a small delay to ensure smooth transition
      setTimeout(() => {
        setIsFullscreen(!isFullscreen);
      }, 100);
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  // Keep screen awake when video is playing
  useEffect(() => {
    let mounted = true;

    const updateKeepAwake = async () => {
      if (isFocused && isVideoReady && !isStreamOffline && !isLoading) {
        await activateKeepAwakeAsync();
      } else {
        await deactivateKeepAwakeAsync();
      }
    };

    if (mounted) {
      updateKeepAwake().catch(console.error);
    }

    return () => {
      mounted = false;
      deactivateKeepAwakeAsync().catch(console.error);
    };
  }, [isFocused, isVideoReady, isStreamOffline, isLoading]);

  // Background retry for offline streams
  useEffect(() => {
    if (isStreamOffline) {
      backgroundRetryInterval.current = setInterval(() => {
        setBackgroundRetryCount(prev => prev + 1);
        // Silently retry fetching stream URL
        getLiveStreamChannel().then(response => {
          if (response.success && response.data && response.data.stream_url) {
            setStreamUrl(response.data.stream_url);
            setIsStreamOffline(false);
            setError(null);
            setRetryCount(0);
            setBackgroundRetryCount(0);
            clearInterval(backgroundRetryInterval.current);
          }
        }).catch(err => {
          console.log("Background retry failed:", err);
        });
      }, 30000); // Retry every 30 seconds
    } else {
      if (backgroundRetryInterval.current) {
        clearInterval(backgroundRetryInterval.current);
      }
    }

    return () => {
      if (backgroundRetryInterval.current) {
        clearInterval(backgroundRetryInterval.current);
      }
    };
  }, [isStreamOffline]);

  // Fetch stream URL from API
  useEffect(() => {
    const fetchStreamUrl = async () => {
      try {
        setIsLoadingStream(true);
        setError(null);
        const response = await getLiveStreamChannel();
        
        if (response.success && response.data && response.data.stream_url) {
          setStreamUrl(response.data.stream_url);
          setRetryCount(0); // Reset retry count on successful fetch
          setIsStreamOffline(false);
        } else {
          throw new Error("Stream URL not available");
        }
      } catch (err) {
        console.error("Error fetching stream URL:", err);
        if (retryCount < maxRetries) {
          // Auto-retry fetching stream URL
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 2000);
        } else {
          setIsStreamOffline(true);
          setError("The live stream is currently offline. Please try again later.");
        }
      } finally {
        setIsLoadingStream(false);
      }
    };

    fetchStreamUrl();
  }, [retryCount]);

  // Handle screen focus changes
  useEffect(() => {
    if (videoRef.current && isVideoReady) {
      if (isFocused) {
        videoRef.current.playAsync().catch(console.error);
      } else {
        videoRef.current.pauseAsync().catch(console.error);
      }
    }
  }, [isFocused, isVideoReady]);

  // Monitor playback status
  const handlePlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setIsLoading(false);
      setIsVideoReady(true);
      
      if (status.error) {
        console.error("Playback error:", status.error);
        setIsStreamOffline(true);
        setError("The live stream is currently offline. Please try again later.");
deactivateKeepAwakeAsync().catch(console.error);
      } else if (status.isPlaying) {
        setError(null);
        setIsStreamOffline(false);
activateKeepAwakeAsync().catch(console.error);
      } else if (status.didJustFinish || !status.isPlaying) {
deactivateKeepAwakeAsync().catch(console.error);
      }
    }
  };

  // Handle video load success
  const handleVideoLoad = () => {
    setIsLoading(false);
    setIsVideoReady(true);
    setError(null);
    setIsStreamOffline(false);
  };

  // Handle video errors
  const handleVideoError = (err) => {
    console.error("Video error:", err);
    setIsLoading(false);
    setIsVideoReady(false);
    deactivateKeepAwake();
    
    // Set stream as offline and show appropriate message
    setIsStreamOffline(true);
    setError("The live stream is currently offline. Please try again later.");
  };

  // Manual retry function
  const retryLoading = () => {
    setIsLoading(true);
    setError(null);
    setIsVideoReady(false);
    setRetryCount(0);
    setIsStreamOffline(false);
    deactivateKeepAwake();
    
    // Force re-fetch stream URL
    setTimeout(() => {
      setRetryCount(1);
    }, 500);
  };

  // Don't render video if no stream URL
  if (isLoadingStream || !streamUrl) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>
            {retryCount > 0 ? `Connecting... (${retryCount}/${maxRetries})` : "Loading stream..."}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Rotation Button */}
      <TouchableOpacity 
        style={styles.rotateButton}
        onPress={toggleFullscreen}
        activeOpacity={0.7}
      >
        <Ionicons 
          name={isFullscreen ? 'phone-portrait' : 'phone-landscape'} 
          size={24} 
          color="#fff" 
        />
      </TouchableOpacity>
      
      {isLoading && !isStreamOffline && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Starting stream...</Text>
        </View>
      )}

      <Video
        ref={videoRef}
        source={{ 
          uri: streamUrl, 
          overrideFileExtensionAndroid: "m3u8" 
        }}
        rate={1.0}
        volume={1.0}
        isMuted={false}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay={isFocused && !isStreamOffline}
        isLooping={false}
        style={styles.video}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        onLoad={handleVideoLoad}
        onError={handleVideoError}
        useNativeControls
      />

      {error && isStreamOffline && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.retryText}>
            Retrying automatically in the background...
          </Text>
          <View style={styles.buttonContainer}>
            <Button title="Try Again Now" onPress={retryLoading} color="#4a90e2" />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: "100%",
    height: "100%",
    backgroundColor: '#000',
  },
  rotateButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  loadingContainer: {
    position: "absolute",
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#ffffff",
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    position: "absolute",
    zIndex: 10,
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.8)",
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  errorText: {
    color: "#ff5252",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  retryText: {
    color: "#ffffff",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    opacity: 0.8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
});