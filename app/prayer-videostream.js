import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ActivityIndicator, 
  Dimensions,
  TouchableWithoutFeedback,
  Platform,
  StatusBar
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { WebView } from 'react-native-webview';
import { Ionicons } from "@expo/vector-icons";
import { BASE_URL } from "./base_url";

const { width } = Dimensions.get("window");

export default function PrayerVideoStream() {
  const router = useRouter();
  const [prayerRoom, setPrayerRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStreamPlaying, setIsStreamPlaying] = useState(false);
  const webViewRef = useRef(null);
  
  // Get prayer room data from params if navigated from prayer-request
  const params = useLocalSearchParams();
  const initialPrayerRoom = params.prayerRoom ? JSON.parse(params.prayerRoom) : null;

  // Extract YouTube video ID from URL
  const extractVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7]?.length === 11) ? match[7] : null;
  };

  // Generate HTML for YouTube player
  const createHtmlContent = (videoId) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            margin: 0; 
            background-color: black;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
          #player {
            width: 100%;
            height: 100%;
          }
          .error-message {
            color: white;
            text-align: center;
            padding: 20px;
            font-family: Arial, sans-serif;
          }
        </style>
      </head>
      <body>
        <div id="player"></div>
        <script>
          var tag = document.createElement('script');
          tag.src = "https://www.youtube.com/iframe_api";
          var firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

          var player;
          var currentHost = 'https://www.youtube-nocookie.com';
          var triedAlternateHost = false;
          var usedFallbackEmbed = false;

          function createPlayer() {
            if (player && player.destroy) {
              try { player.destroy(); } catch (e) {}
            }
            var container = document.getElementById('player');
            container.innerHTML = '';
            player = new YT.Player('player', {
              height: '100%',
              width: '100%',
              videoId: '${videoId}',
              host: currentHost,
              playerVars: {
                'autoplay': 1,
                'playsinline': 1,
                'modestbranding': 1,
                'rel': 0,
                'showinfo': 0,
                'controls': 0,
                'disablekb': 1,
                'fs': 0,
                'iv_load_policy': 3,
                'origin': 'https://app.local',
                'playlist': '${videoId}',
                'enablejsapi': 1,
                'cc_load_policy': 0,
                'color': 'white',
                'widget_referrer': window.location.href,
                'wmode': 'opaque',
                'playsinline': 1,
                'origin': window.location.origin,
                'enablejsapi': 1,
                'widgetid': 1
              },
              events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange,
                'onError': onPlayerError
              }
            });
          }

          function onYouTubeIframeAPIReady() {
            createPlayer();
          }

          function renderFallbackEmbed() {
            if (usedFallbackEmbed) return;
            usedFallbackEmbed = true;
            var container = document.getElementById('player');
            var iframe = document.createElement('iframe');
            var params = 'autoplay=1&playsinline=1&modestbranding=1&rel=0&controls=0&disablekb=1&fs=0&iv_load_policy=3';
            iframe.src = 'https://www.youtube.com/embed/${videoId}?' + params;
            iframe.allow = 'autoplay; encrypted-media';
            iframe.setAttribute('allowfullscreen', 'false');
            iframe.setAttribute('webkitallowfullscreen', 'false');
            iframe.setAttribute('mozallowfullscreen', 'false');
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('scrolling', 'no');
            iframe.setAttribute('allow', 'autoplay');
            iframe.setAttribute('allowtransparency', 'true');
            iframe.style.pointerEvents = 'none';
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = '0';
            container.innerHTML = '';
            container.appendChild(iframe);
            try { window.ReactNativeWebView.postMessage('fallback_embed'); } catch (e) {}
          }

          function onPlayerReady(event) {
            console.log('Player is ready');
            window.ReactNativeWebView.postMessage('player_ready');
            try {
              event.target.mute();
              event.target.playVideo();
            } catch (e) {
              console.error('Autoplay attempt failed', e);
            }
          }

          function onPlayerStateChange(event) {
            console.log('Player state changed:', event.data);
            window.ReactNativeWebView.postMessage('player_state:' + event.data);
            
            if (event.data === YT.PlayerState.PLAYING) {
              try { 
                event.target.unMute();
                window.ReactNativeWebView.postMessage('player_playing');
              } catch (e) {}
            }
          }

          function onPlayerError(event) {
            var code = event && event.data;
            console.error('Player error:', code);
            if ((code === 101 || code === 150 || code === 152 || code === 153) && !triedAlternateHost) {
              triedAlternateHost = true;
              currentHost = (currentHost === 'https://www.youtube-nocookie.com')
                ? 'https://www.youtube.com'
                : 'https://www.youtube-nocookie.com';
              try { createPlayer(); } catch (e) {
                window.ReactNativeWebView.postMessage('player_error:' + code);
              }
              return;
            }
            if ((code === 101 || code === 150 || code === 152 || code === 153) && !usedFallbackEmbed) {
              renderFallbackEmbed();
              return;
            }
            window.ReactNativeWebView.postMessage('player_error:' + code);
          }
        </script>
      </body>
    </html>
  `;

  // Handle WebView messages
  const handleWebViewMessage = (event) => {
    const message = event.nativeEvent.data;
    console.log('WebView message:', message);
    
    if (message.startsWith('player_error')) {
      const errorCode = message.split(':')[1];
      console.error('YouTube Player Error:', errorCode);
      setIsStreamPlaying(false);
      setError('Failed to load the video. Please try again later.');
    } else if (message === 'player_playing') {
      setIsStreamPlaying(true);
      setIsLoading(false);
    } else if (message === 'player_ready') {
      console.log('Player is ready');
    }
  };

  // Fetch prayer room data if not passed via params
  useEffect(() => {
    const fetchPrayerRoom = async () => {
      // If we have initial prayer room data from params, use it
      if (initialPrayerRoom) {
        setPrayerRoom(initialPrayerRoom);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`${BASE_URL}/api/prayer-room/`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || 'Failed to fetch prayer room');
        }
        
        const data = await response.json();
        console.log('Prayer room data:', data);
        
        if (!data.is_active) {
          throw new Error('No active prayer session at the moment');
        }
        
        setPrayerRoom(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching prayer room:', err);
        setError(err.message || 'Failed to load prayer room. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrayerRoom();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498DB" />
        <Text style={styles.loadingText}>Loading prayer room...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="sad-outline" size={60} color="#666" />
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorSubtext}>Please check back later for the next prayer session.</Text>
      </View>
    );
  }

  const videoId = extractVideoId(prayerRoom?.youtube_url);
  
  if (!videoId) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning-outline" size={60} color="#666" />
        <Text style={styles.errorText}>Invalid video URL provided</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Prayer Room</Text>
      </View>

      {/* Video Player */}
      <View style={styles.videoContainer}>
        <TouchableWithoutFeedback>
          <View style={styles.touchBlock}>
            <WebView
              ref={webViewRef}
              style={styles.video}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              source={{
                html: createHtmlContent(videoId),
                baseUrl: 'https://app.local'
              }}
              allowsFullscreenVideo={true}
              allowsInlineMediaPlayback={true}
              startInLoadingState={true}
              mediaPlaybackRequiresUserAction={false}
              mixedContentMode="always"
              onMessage={handleWebViewMessage}
              renderLoading={() => (
                <View style={styles.loadingVideo}>
                  <ActivityIndicator size="large" color="#3498DB" />
                  <Text style={styles.loadingText}>Loading stream...</Text>
                </View>
              )}
            />
          </View>
        </TouchableWithoutFeedback>
      </View>

      {/* Stream Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.streamTitle}>{prayerRoom.title || 'Prayer Room'}</Text>
        
        {prayerRoom.current_topic && (
          <View style={styles.topicContainer}>
            <Text style={styles.topicLabel}>Current Prayer Topic:</Text>
            <Text style={styles.topicText}>"{prayerRoom.current_topic}"</Text>
          </View>
        )}
        
        {prayerRoom.description && (
          <Text style={styles.streamDescription}>
            {prayerRoom.description}
          </Text>
        )}
        
        <View style={styles.statsContainer}>
          {prayerRoom.started_at && (
            <View style={styles.statItem}>
              <Ionicons name="time" size={20} color="#666" />
              <Text style={styles.statText}>
                {new Date(prayerRoom.started_at).toLocaleString()}
              </Text>
            </View>
          )}
          
          <View style={[styles.statItem, { backgroundColor: '#1e67cd' }]}>
            <Ionicons name="radio" size={16} color="white" />
            <Text style={[styles.statText, { color: 'white' }]}>
              Live Now
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingVideo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
    textAlign: 'center',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
    textAlign: "center",
  },
  touchBlock: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  videoContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#000',
    marginBottom: 15,
    overflow: 'hidden',
    position: 'relative',
    zIndex: 0,
  },
  video: {
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    backgroundColor: '#000',
    zIndex: 1
  },
  infoContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
  },
  streamTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 8,
  },
  streamDescription: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: 'wrap',
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  statText: {
    fontSize: 14,
    color: "#666666",
    marginLeft: 6,
  },
  topicContainer: {
    marginBottom: 12,
  },
  topicLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  topicText: {
    fontSize: 16,
    color: '#1e67cd',
    fontStyle: 'italic',
  },
});
