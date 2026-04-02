import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, ActivityIndicator, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import WebView from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';
import { Linking, Alert, useWindowDimensions } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';
import { BASE_URL } from './base_url';

export default function VideoDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { videoId, title, youtubeUrl } = params;

  // Determine video type — this screen handles general (non-course) videos
  const videoType = 'video';
  const translationVideoId = videoId;

  // Extract YouTube ID from a full URL
  const extractYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : url;
  };

  const originalVideoId = videoId || extractYouTubeId(youtubeUrl);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('Original');
  const [currentVideoId, setCurrentVideoId] = useState(originalVideoId);
  const [translations, setTranslations] = useState([]);
  const [translationsLoading, setTranslationsLoading] = useState(false);
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

  // Reset to original when the video changes
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setCurrentVideoId(originalVideoId);
    setSelectedLanguage('Original');
  }, [videoId, youtubeUrl]);

  // Fetch available translations from the backend
  useEffect(() => {
    if (!translationVideoId) return;
    let mounted = true;
    const fetchTranslations = async () => {
      setTranslationsLoading(true);
      try {
        const res = await fetch(
          `${BASE_URL}/api/video-translations/by_video/?video_type=${videoType}&video_id=${translationVideoId}`
        );
        if (!res.ok) throw new Error('Failed to fetch translations');
        const data = await res.json();
        if (mounted && Array.isArray(data)) {
          setTranslations(data);
        }
      } catch (e) {
        console.error('Error fetching translations:', e);
      } finally {
        if (mounted) setTranslationsLoading(false);
      }
    };
    fetchTranslations();
    return () => { mounted = false; };
  }, [translationVideoId]);

  // Language options: Original + all fetched translations
  const languageOptions = [
    { name: 'Original', code: 'original', videoId: originalVideoId },
    ...translations.map((t) => ({
      name: t.language_display || t.language,
      code: t.language,
      videoId: extractYouTubeId(t.translated_video_url) || t.translated_video_url,
    })),
  ];

  const handleLanguageSelect = (option) => {
    setSelectedLanguage(option.name);
    setCurrentVideoId(option.videoId);
    setIsLoading(true);
    setError(null);
    setShowLanguageModal(false);
  };

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
              videoId: '${currentVideoId}',
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
            iframe.src = 'https://www.youtube.com/embed/${currentVideoId}?' + params;
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
        {/* Language Switcher Button */}
        <TouchableOpacity
          style={styles.languageButton}
          onPress={() => setShowLanguageModal(true)}
        >
          <Ionicons name="language" size={16} color="#FFF" />
          <Text style={styles.languageButtonText}>{selectedLanguage}</Text>
          <Ionicons name="chevron-down" size={14} color="#FFF" />
        </TouchableOpacity>

        <WebView
          key={(currentVideoId || videoId || youtubeUrl || '').toString() + selectedLanguage}
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

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLanguageModal(false)}
        >
          <View style={styles.languageModal}>
            <View style={styles.languageModalHeader}>
              <Ionicons name="language" size={22} color="#3498DB" />
              <Text style={styles.languageModalTitle}>Select Language</Text>
            </View>

            {translationsLoading ? (
              <View style={styles.translationsLoadingContainer}>
                <ActivityIndicator size="small" color="#3498DB" />
                <Text style={styles.translationsLoadingText}>Loading languages...</Text>
              </View>
            ) : languageOptions.length <= 1 ? (
              <View style={styles.noTranslationsContainer}>
                <Ionicons name="information-circle-outline" size={32} color="#ccc" />
                <Text style={styles.noTranslationsText}>No translations available for this video.</Text>
                <TouchableOpacity
                  style={[styles.languageOption, selectedLanguage === 'Original' && styles.languageOptionSelected, { marginTop: 10, width: '100%' }]}
                  onPress={() => handleLanguageSelect(languageOptions[0])}
                >
                  <Text style={[styles.languageOptionText, selectedLanguage === 'Original' && styles.languageOptionTextSelected]}>
                    Original
                  </Text>
                  {selectedLanguage === 'Original' && (
                    <Ionicons name="checkmark" size={20} color="#3498DB" />
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              languageOptions.map((option) => (
                <TouchableOpacity
                  key={option.code}
                  style={[
                    styles.languageOption,
                    selectedLanguage === option.name && styles.languageOptionSelected
                  ]}
                  onPress={() => handleLanguageSelect(option)}
                >
                  <View style={styles.languageOptionLeft}>
                    <Text style={styles.languageOptionCode}>{option.code === 'original' ? '🌐' : option.code.toUpperCase()}</Text>
                    <Text style={[
                      styles.languageOptionText,
                      selectedLanguage === option.name && styles.languageOptionTextSelected
                    ]}>
                      {option.name}
                    </Text>
                  </View>
                  {selectedLanguage === option.name && (
                    <Ionicons name="checkmark-circle" size={22} color="#3498DB" />
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        </TouchableOpacity>
      </Modal>

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
    marginTop: -0,
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
  // Language Button (overlaid on video)
  languageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  languageButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Language Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageModal: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 20,
    width: '85%',
    maxWidth: 340,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  languageModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 18,
  },
  languageModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  translationsLoadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  translationsLoadingText: {
    color: '#888',
    fontSize: 14,
  },
  noTranslationsContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  noTranslationsText: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 4,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F5F7FA',
  },
  languageOptionSelected: {
    backgroundColor: '#EBF3FD',
    borderWidth: 1.5,
    borderColor: '#3498DB',
  },
  languageOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  languageOptionCode: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3498DB',
    width: 30,
  },
  languageOptionText: {
    fontSize: 15,
    color: '#2C3E50',
    fontWeight: '500',
  },
  languageOptionTextSelected: {
    color: '#3498DB',
    fontWeight: '700',
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