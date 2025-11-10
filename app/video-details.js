import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import WebView from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';
import { Linking, Alert, useWindowDimensions } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';

export default function VideoDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { videoId, title, youtubeUrl } = params;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const webViewRef = useRef(null);
  const { width, height } = useWindowDimensions();
  const isPortrait = height > width;
  
  const toggleOrientation = async () => {
    if (isPortrait) {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } else {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    }
  };

  console.log('Video Details Params:', { videoId, title, youtubeUrl });

  const handleWatchFullVideo = () => {
    console.log('Opening YouTube URL:', youtubeUrl);
    Linking.openURL(youtubeUrl)
      .catch(err => {
        console.error('Error opening YouTube link:', err);
        Alert.alert('Error', 'Something went wrong while opening the video');
      });
  };

  const htmlContent = `
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
                'controls': 1,
                'enablejsapi': 1,
                'origin': 'https://app.local'
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
            var params = 'autoplay=1&playsinline=1&modestbranding=1&rel=0&controls=1';
            iframe.src = 'https://www.youtube.com/embed/${videoId}?' + params;
            iframe.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
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
            // When playback starts, unmute for normal audio
            if (event.data === YT.PlayerState.PLAYING) {
              try { event.target.unMute(); } catch (e) {}
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

  const handleWebViewError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView Error:', nativeEvent);
    setError('Failed to load video. Please try again.');
  };

  const handleWebViewLoad = () => {
    console.log('WebView loaded successfully');
    setIsLoading(false);
  };

  const handleMessage = (event) => {
    const message = event.nativeEvent.data;
    console.log('Received message from WebView:', message);
    
    if (message === 'player_ready') {
      setIsLoading(false);
    } else if (message.startsWith('player_error')) {
      const errorCode = message.split(':')[1];
      console.error('YouTube Player Error:', errorCode);
      
      // Show in-app error only; no external redirection
      setError('Failed to load video. Please try again.');
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, isPortrait ? null : styles.landscapeContainer]}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={2}>
          {title}
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Rotation Button */}
      <View style={styles.rotateButtonContainer}>
        <TouchableOpacity 
          style={styles.rotateButton}
          onPress={toggleOrientation}
        >
          <Ionicons 
            name={isPortrait ? 'phone-landscape-outline' : 'phone-portrait-outline'} 
            size={24} 
            color="#FFD700" 
          />
          <Text style={styles.rotateButtonText}>
            {isPortrait ? 'Rotate to Landscape' : 'Rotate to Portrait'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Video Player */}
      <View style={[styles.videoContainer, { marginTop: 20 }]}>
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF0000" />
            <Text style={styles.loadingText}>Loading video...</Text>
          </View>
        )}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                setError(null);
                setIsLoading(true);
                webViewRef.current?.reload();
              }}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
        <WebView
          ref={webViewRef}
          style={styles.video}
          javaScriptEnabled={true}
          originWhitelist={["https://*"]}
          source={{ html: htmlContent, baseUrl: 'https://app.local' }}
          allowsFullscreenVideo={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          mixedContentMode="always"
          userAgent="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36"
          onError={handleWebViewError}
          onLoad={handleWebViewLoad}
          onMessage={handleMessage}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView HTTP Error:', nativeEvent);
            setError('Network error. Please check your connection.');
          }}
        />
      </View>

      <TouchableOpacity 
        style={styles.watchFullButton}
        onPress={handleWatchFullVideo}
      >
        <Text style={styles.watchFullButtonText}>Watch Full Video on YouTube</Text>
        <Ionicons name="logo-youtube" size={24} color="#FF0000" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 1,
    justifyContent: 'center',
  },
  landscapeContainer: {
    paddingHorizontal: 0,
  },
  rotateButtonContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  rotateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: 'transparent',
    marginBottom: 2,
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  headerRight: {
    width: 40, // Same as back button for balance
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 14/9,
    backgroundColor: '#000',
    marginTop: -0,  // Move the video up by 50 units
    marginBottom: 30,
    overflow: 'hidden',
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    alignSelf: 'center',
  },
  video: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#FFF',
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  errorText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF0000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  rotateButtonText: {
    color: '#FFD700',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  watchFullButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    gap: 8,
  },
  watchFullButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});