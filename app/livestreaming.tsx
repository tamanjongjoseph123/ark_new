"use client"

import { useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  Platform,
  Linking,
  TouchableWithoutFeedback,
  StatusBar
} from "react-native"
import { WebView } from 'react-native-webview';
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { BASE_URL } from "./base_url"

const { width } = Dimensions.get("window")

interface Stream {
  id: number
  title: string
  description: string
  stream_type: 'live' | 'regular'
  youtube_url: string
  is_active: boolean
  start_time: string
}

const LiveStreamScreen = () => {
  const [stream, setStream] = useState<Stream | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isStreamPlaying, setIsStreamPlaying] = useState(false)

  useEffect(() => {
    fetchActiveStream()
    
    // Only set up refresh if we don't have an active stream yet
    if (!isStreamPlaying) {
      const interval = setInterval(() => {
        if (!isStreamPlaying) {
          fetchActiveStream()
        }
      }, 30000) // Check every 30 seconds, but only if not already playing
      
      return () => clearInterval(interval)
    }
  }, [isStreamPlaying])

  const fetchActiveStream = async () => {
    try {
      setLoading(true)
      
      // Try different possible endpoints
      const endpoints = [
        '/api/streams/active/',
        '/api/stream/active/',
        '/streams/active/'
      ]
      
      let response = null
      let lastError = null
      
      // Try each endpoint until one works
      for (const endpoint of endpoints) {
        const url = `${BASE_URL}${endpoint}`
        console.log('Trying endpoint:', url)
        
        try {
          const res = await fetch(url, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          })
          
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            response = res
            break
          }
        } catch (err) {
          lastError = err
          console.log(`Endpoint ${endpoint} failed:`, err.message)
          continue
        }
      }
      
      if (!response) {
        throw lastError || new Error('Failed to connect to any stream endpoints')
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response received from:', response.url);
        console.error('Response start:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response. Please check the API endpoint.');
      }
      
      const data = await response.json()
      console.log('Stream API response:', data)
      
      if (!response.ok) {
        throw new Error(data.detail || `HTTP error! status: ${response.status}`)
      }
      
      if (!data || !data.id) {
        throw new Error('Invalid stream data received')
      }
      
      if (!data.is_active) {
        throw new Error('The stream exists but is not marked as active')
      }
      
      setStream(data)
      setError(null)
    } catch (err) {
      console.error('Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      setError(err.message || 'No live stream is currently active. Please check the stream URL and try again.')
      setStream(null)
    } finally {
      setLoading(false)
    }
  }

  const extractVideoId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[7]?.length === 11) ? match[7] : null
  }

  const createHtmlContent = (videoId: string) => `
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
                'cc_load_policy': 0, // Hide closed captions button
                'color': 'white', // Hide the progress bar color
                'widget_referrer': window.location.href, // Prevent showing related videos
                'wmode': 'opaque', // Prevent flash of controls on some devices
                'playsinline': 1, // Force inline playback on iOS
                'origin': window.location.origin, // Prevent security errors
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
              // Autoplay policies on mobile often require muted start
              event.target.mute();
              event.target.playVideo();
            } catch (e) {
              console.error('Autoplay attempt failed', e);
            }
          }

          function onPlayerStateChange(event) {
            console.log('Player state changed:', event.data);
            window.ReactNativeWebView.postMessage('player_state:' + event.data);
            
            // When playback starts, unmute for normal audio and mark as playing
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
            // Retry with alternate host if embed-restriction errors occur
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
            // As a last resort, render a plain iframe embed to keep playback in-app
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498DB" />
        <Text style={styles.loadingText}>Loading stream...</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live Stream</Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="sad-outline" size={60} color="#666" />
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorSubtext}>Please check back later for upcoming streams.</Text>
        </View>
      ) : stream ? (
        <>
          {/* Video Player */}
          <View style={styles.videoContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.touchBlock}>
                <WebView
              style={styles.video}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              source={{
                html: createHtmlContent(extractVideoId(stream.youtube_url) || ''),
                baseUrl: 'https://app.local'
              }}
              allowsFullscreenVideo={true}
              allowsInlineMediaPlayback={true}
              startInLoadingState={true}
              mediaPlaybackRequiresUserAction={false}
              mixedContentMode="always"
              onMessage={(event) => {
                const message = event.nativeEvent.data;
                console.log('WebView message:', message);
                if (message.startsWith('player_error')) {
                  const errorCode = message.split(':')[1];
                  console.error('YouTube Player Error:', errorCode);
                  setIsStreamPlaying(false);
                } else if (message === 'player_playing') {
                  setIsStreamPlaying(true);
                }
              }}
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
            <Text style={styles.streamTitle}>{stream.title}</Text>
            <Text style={styles.streamDescription}>
              {stream.description || 'Join us for this live stream.'}
            </Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="time" size={20} color="#666" />
                <Text style={styles.statText}>
                  {new Date(stream.start_time).toLocaleString()}
                </Text>
              </View>
              <View style={[styles.statItem, { backgroundColor: '#FF3B30' }]} >
                <Ionicons name="radio" size={16} color="white" />
                <Text style={[styles.statText, { color: 'white' }]}>
                  {stream.stream_type === 'live' ? 'Live Now' : 'Video'}
                </Text>
              </View>
            </View>
          </View>
        </>
      ) : null}

    </SafeAreaView>
  )
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
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#EAEAEA",
    backgroundColor: "#FFFFFF",
  },
  footerText: {
    textAlign: 'center',
    color: '#666666',
    fontSize: 14,
  },
  linkText: {
    color: '#3498DB',
    textDecorationLine: 'underline',
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonActive: {
    backgroundColor: "#1e67cd",
  },
})

export default LiveStreamScreen
