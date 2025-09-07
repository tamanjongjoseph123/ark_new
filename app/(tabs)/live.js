import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import { getLiveStreamChannel } from '../services/api';

export default function LiveScreen() {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStreamUrl, setCurrentStreamUrl] = useState('');
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [connectionStable, setConnectionStable] = useState(false);
  const [lastErrorTime, setLastErrorTime] = useState(0);
  const webViewRef = useRef(null);
  const errorTimeoutRef = useRef(null);
  const stabilityTimeoutRef = useRef(null);

  // Keep screen awake when video is playing
  useEffect(() => {
    if (isPlaying && !error) {
      activateKeepAwake();
    } else {
      deactivateKeepAwake();
    }

    return () => {
      deactivateKeepAwake();
    };
  }, [isPlaying, error]);

  // Primary stream URL
  const PRIMARY_STREAM_URL = 'https://live20.bozztv.com/giatv/giatv-arkofgodtv/arkofgodtv/playlist.m3u8';

  // Optimized retry settings
  const MAX_RETRIES = 3;
  const ERROR_DEBOUNCE_TIME = 5000; // 5 seconds between error handling
  const STABILITY_CHECK_TIME = 10000; // 10 seconds to consider connection stable
  const RETRY_DELAY = 1000; // 1 second retry delay

  // Initialize with primary stream URL on component mount
  useEffect(() => {
    setCurrentStreamUrl(PRIMARY_STREAM_URL);
  }, []);

  // Generate optimized HTML content for faster loading and better stability
  const generateHtmlContent = (streamUrl) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta charset="utf-8">
        <style>
          body, html {
            margin: 0;
            padding: 0;
            background: #000;
            height: 100%;
            width: 100%;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          }
          video {
            width: 100%;
            height: 100%;
            object-fit: contain;
            background: #000;
          }
          .container {
            height: 100%;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
          }
          .loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            color: white;
            font-size: 16px;
            z-index: 10;
          }
          .hidden {
            display: none !important;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div id="loading" class="loading-overlay">
            <div>Loading stream...</div>
          </div>
          <video
            id="video"
            controls
            autoplay
            muted
            playsinline
            webkit-playsinline
            x5-playsinline
            x5-video-player-type="h5"
            x5-video-player-fullscreen="true"
            x5-video-orientation="portraint"
            preload="metadata"
            crossorigin="anonymous"
          >
            <source src="${streamUrl}" type="application/x-mpegURL">
            <source src="${streamUrl}" type="video/mp4">
          </video>
        </div>
        <script>
          const video = document.getElementById('video');
          const loading = document.getElementById('loading');
          let isPlaying = false;
          let hasStartedPlaying = false;
          let errorCount = 0;
          let lastErrorTime = 0;
          let stabilityTimer = null;

          // Hide loading overlay
          function hideLoading() {
            if (loading) {
              loading.classList.add('hidden');
            }
          }

          // Show loading overlay
          function showLoading() {
            if (loading) {
              loading.classList.remove('hidden');
            }
          }

          // Optimized event handlers
          video.addEventListener('loadstart', function() {
            console.log('Video load started');
            showLoading();
            window.ReactNativeWebView.postMessage('loadstart');
          });

          video.addEventListener('loadedmetadata', function() {
            console.log('Video metadata loaded');
            window.ReactNativeWebView.postMessage('loadedmetadata');
          });

          video.addEventListener('loadeddata', function() {
            console.log('Video data loaded');
            hideLoading();
            window.ReactNativeWebView.postMessage('loadeddata');
          });

          video.addEventListener('canplay', function() {
            console.log('Video can play');
            hideLoading();
            window.ReactNativeWebView.postMessage('canplay');
          });

          video.addEventListener('canplaythrough', function() {
            console.log('Video can play through');
            hideLoading();
            window.ReactNativeWebView.postMessage('canplaythrough');
          });

          video.addEventListener('playing', function() {
            console.log('Video is playing');
            isPlaying = true;
            hasStartedPlaying = true;
            hideLoading();
            errorCount = 0; // Reset error count on successful play

            // Set stability timer
            if (stabilityTimer) clearTimeout(stabilityTimer);
            stabilityTimer = setTimeout(() => {
              window.ReactNativeWebView.postMessage('stable');
            }, 10000); // 10 seconds of stable playback

            window.ReactNativeWebView.postMessage('playing');
          });

          video.addEventListener('pause', function() {
            console.log('Video paused');
            isPlaying = false;
            if (stabilityTimer) clearTimeout(stabilityTimer);
          });

          video.addEventListener('waiting', function() {
            console.log('Video waiting/buffering');
            if (hasStartedPlaying) {
              showLoading();
            }
            window.ReactNativeWebView.postMessage('waiting');
          });

          video.addEventListener('stalled', function() {
            console.log('Video stalled');
            if (hasStartedPlaying) {
              showLoading();
            }
            window.ReactNativeWebView.postMessage('stalled');
          });

          video.addEventListener('progress', function() {
            // Video is downloading/buffering
            if (video.buffered.length > 0) {
              const bufferedEnd = video.buffered.end(video.buffered.length - 1);
              const duration = video.duration;
              if (duration > 0) {
                const bufferedPercent = (bufferedEnd / duration) * 100;
                console.log('Buffered:', bufferedPercent + '%');
              }
            }
          });

          video.addEventListener('error', function(e) {
            const now = Date.now();
            const timeSinceLastError = now - lastErrorTime;

            console.error('Video error:', e.target.error);
            errorCount++;
            lastErrorTime = now;

            // Only report error if it's been more than 5 seconds since last error
            // This prevents spam of error messages during connection issues
            if (timeSinceLastError > 5000 || errorCount === 1) {
              const errorCode = e.target.error ? e.target.error.code : 'unknown';
              window.ReactNativeWebView.postMessage('error:' + errorCode + ':' + errorCount);

              // Auto-retry on network errors (for live streams) - only once per error
              if (hasStartedPlaying && e.target.error && e.target.error.code === 2 && errorCount <= 2) {
                setTimeout(() => {
                  console.log('Attempting to recover from network error...');
                  video.load();
                  attemptPlay();
                }, 2000);
              }
            }
          });

          // Enhanced play attempt with better error handling
          function attemptPlay() {
            if (video.readyState >= 2) { // HAVE_CURRENT_DATA
              video.play().then(() => {
                console.log('Video play succeeded');
              }).catch(function(error) {
                console.error('Play failed:', error);
                // Only report play errors if we haven't started playing yet
                if (!hasStartedPlaying) {
                  window.ReactNativeWebView.postMessage('playError:' + error.message);
                }
              });
            } else {
              // Wait for enough data to be loaded
              video.addEventListener('canplay', attemptPlay, { once: true });
            }
          }

          // Start playing when ready
          if (video.readyState >= 2) {
            attemptPlay();
          } else {
            video.addEventListener('loadeddata', attemptPlay, { once: true });
          }
        </script>
      </body>
    </html>
  `;

  // Function to get fallback stream URL from API
  const getFallbackStreamUrl = async () => {
    try {
      console.log('Fetching fallback stream URL from API...');
      const response = await getLiveStreamChannel();
      if (response.success && response.data && response.data.stream_url) {
        console.log('Fallback stream URL obtained:', response.data.stream_url);
        return response.data.stream_url;
      } else {
        console.log('API response did not contain valid stream URL:', response);
        return null;
      }
    } catch (error) {
      console.error('Error fetching fallback stream URL:', error);
      return null;
    }
  };

  // Function to switch to fallback stream
  const switchToFallback = async () => {
    if (isUsingFallback) {
      console.log('Already using fallback, cannot switch further');
      return false;
    }

    console.log('Switching to fallback stream...');
    const fallbackUrl = await getFallbackStreamUrl();

    if (fallbackUrl) {
      setCurrentStreamUrl(fallbackUrl);
      setIsUsingFallback(true);
      setRetryCount(0);
      console.log('Successfully switched to fallback stream:', fallbackUrl);
      return true;
    } else {
      console.log('Failed to get fallback stream URL');
      return false;
    }
  };



  // Cleanup function for timeouts
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      if (stabilityTimeoutRef.current) {
        clearTimeout(stabilityTimeoutRef.current);
      }
    };
  }, []);

  const handleWebViewMessage = async (event) => {
    const message = event.nativeEvent.data;
    const now = Date.now();

    console.log('WebView message:', message, 'Current URL:', currentStreamUrl, 'Using fallback:', isUsingFallback, 'Retry count:', retryCount);

    // Handle different message types
    if (message === 'loadstart') {
      setIsLoading(true);
      setError(null);
      setConnectionStable(false);

    } else if (message === 'loadedmetadata' || message === 'loadeddata') {
      // Metadata loaded - stream is starting to work
      setError(null);

    } else if (message === 'canplay' || message === 'canplaythrough') {
      setIsLoading(false);
      setError(null);
      setRetryCount(0); // Reset retry count on successful load

    } else if (message === 'playing') {
      setIsLoading(false);
      setError(null);
      setIsPlaying(true);
      setRetryCount(0); // Reset retry count on successful playback
      activateKeepAwake();

      // Clear any existing stability timeout
      if (stabilityTimeoutRef.current) {
        clearTimeout(stabilityTimeoutRef.current);
      }

      // Set new stability timeout
      stabilityTimeoutRef.current = setTimeout(() => {
        setConnectionStable(true);
        console.log('Connection marked as stable');
      }, STABILITY_CHECK_TIME);

    } else if (message === 'stable') {
      setConnectionStable(true);
      console.log('Stream connection is stable');

    } else if (message === 'waiting' || message === 'stalled') {
      // Show loading during buffering, but don't reset connection stability
      setIsLoading(true);
      setIsPlaying(false);
      deactivateKeepAwake();
      // Don't show error for normal buffering

    } else if (message.startsWith('error:') || message.startsWith('playError:')) {
      // Debounce error handling to prevent spam
      const timeSinceLastError = now - lastErrorTime;

      if (timeSinceLastError < ERROR_DEBOUNCE_TIME && connectionStable) {
        console.log('Ignoring error - too soon after last error and connection was stable');
        return;
      }

      setLastErrorTime(now);
      console.log('Stream error detected, attempting recovery...');
      setIsLoading(false);
      setIsPlaying(false);
      setConnectionStable(false);
      deactivateKeepAwake();

      // Clear any existing error timeout
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }

      // Only proceed with error handling if we haven't had a stable connection
      // or if this is a critical error
      const isCriticalError = message.includes('playError:') || !connectionStable;

      if (isCriticalError) {
        // Try to switch to fallback if we haven't already and haven't exceeded retries
        if (!isUsingFallback && retryCount < MAX_RETRIES) {
          console.log(`Retrying with primary stream (attempt ${retryCount + 1}/${MAX_RETRIES})`);
          setRetryCount(prev => prev + 1);

          // Wait before retrying
          errorTimeoutRef.current = setTimeout(() => {
            if (webViewRef.current) {
              webViewRef.current.reload();
            }
          }, RETRY_DELAY);

        } else if (!isUsingFallback && retryCount >= MAX_RETRIES) {
          console.log('Max retries reached, switching to fallback stream...');
          const fallbackSuccess = await switchToFallback();

          if (fallbackSuccess) {
            setError('Switching to backup stream...');
            // Reload WebView with new URL after a short delay
            errorTimeoutRef.current = setTimeout(() => {
              if (webViewRef.current) {
                webViewRef.current.reload();
              }
              // Clear the switching message after reload
              setTimeout(() => setError(null), 2000);
            }, RETRY_DELAY);
          } else {
            setError('Stream is currently unavailable. Please try again later.');
          }

        } else if (isUsingFallback && !connectionStable) {
          // Already using fallback and it failed without establishing stable connection
          setError('Stream is currently unavailable. Please try again later.');
        }
        // If using fallback and had stable connection, ignore minor errors
      }
    }
  };

  const handleRetry = () => {
    console.log('Retry button pressed - resetting to primary stream');

    // Clear all timeouts
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    if (stabilityTimeoutRef.current) {
      clearTimeout(stabilityTimeoutRef.current);
    }

    // Reset all state
    setError(null);
    setIsLoading(true);
    setRetryCount(0);
    setIsUsingFallback(false);
    setIsPlaying(false);
    setConnectionStable(false);
    setLastErrorTime(0);
    setCurrentStreamUrl(PRIMARY_STREAM_URL);

    // Reload WebView after a short delay to ensure state is updated
    setTimeout(() => {
      if (webViewRef.current) {
        webViewRef.current.reload();
      }
    }, 500);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <WebView
        ref={webViewRef}
        source={{ html: generateHtmlContent(currentStreamUrl) }}
        style={styles.webview}
        key={currentStreamUrl} // Force re-render when URL changes
        onMessage={handleWebViewMessage}
        allowsFullscreenVideo={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false} // We handle loading ourselves
        cacheEnabled={true}
        allowsBackForwardNavigationGestures={false}
        bounces={false}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        mixedContentMode="compatibility"
        originWhitelist={['*']}
        onLoadStart={() => console.log('WebView load started')}
        onLoadEnd={() => console.log('WebView load ended')}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
          // Don't immediately set error - let our message handler deal with it
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView HTTP error:', nativeEvent);
        }}
      />
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          {isUsingFallback && (
            <Text style={styles.streamInfoText}>Using backup stream</Text>
          )}
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Show stream status when loading */}
      {isLoading && currentStreamUrl && !error && (
        <View style={styles.streamStatusContainer}>
          <Text style={styles.streamStatusText}>
            {connectionStable
              ? 'Reconnecting...'
              : (isUsingFallback ? 'Loading backup stream...' : 'Loading live stream...')
            }
          </Text>
        </View>
      )}

      {/* Show connection status when stable */}
      {connectionStable && isPlaying && !error && (
        <View style={styles.connectionStatusContainer}>
          <Text style={styles.connectionStatusText}>
            ● LIVE
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  streamInfoText: {
    color: '#FFD700',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  streamStatusContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  streamStatusText: {
    color: '#fff',
    fontSize: 14,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    textAlign: 'center',
  },

  connectionStatusContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    alignItems: 'center',
  },
  connectionStatusText: {
    color: '#00FF00',
    fontSize: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});