"use client"

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  Modal,
} from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import WebView from "react-native-webview"
import { StatusBar } from "expo-status-bar"
import { Linking, Alert } from "react-native"
import { useState, useRef } from "react"

export default function VideoDetail() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const { videoId, title, youtubeUrl } = params
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const webViewRef = useRef(null)

  const [selectedLanguage, setSelectedLanguage] = useState("EN")
  const [showLanguageModal, setShowLanguageModal] = useState(false)

  const AVAILABLE_LANGUAGES = [
    { code: "EN", name: "English", flag: "🇺🇸" },
    { code: "ES", name: "Español", flag: "🇪🇸" },
    { code: "FR", name: "Français", flag: "🇫🇷" },
    { code: "DE", name: "Deutsch", flag: "🇩🇪" },
    { code: "IT", name: "Italiano", flag: "🇮🇹" },
    { code: "PT", name: "Português", flag: "🇵🇹" },
    { code: "RU", name: "Русский", flag: "🇷🇺" },
    { code: "ZH", name: "中文", flag: "🇨🇳" },
    { code: "JA", name: "日本語", flag: "🇯🇵" },
    { code: "KO", name: "한국어", flag: "🇰🇷" },
  ]

  console.log("Video Details Params:", { videoId, title, youtubeUrl })

  const handleWatchFullVideo = () => {
    console.log("Opening YouTube URL:", youtubeUrl)
    Linking.openURL(youtubeUrl).catch((err) => {
      console.error("Error opening YouTube link:", err)
      Alert.alert("Error", "Something went wrong while opening the video")
    })
  }

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
          function onYouTubeIframeAPIReady() {
            player = new YT.Player('player', {
              height: '100%',
              width: '100%',
              videoId: '${videoId}',
              playerVars: {
                'autoplay': 1,
                'playsinline': 1,
                'modestbranding': 1,
                'rel': 0,
                'showinfo': 0,
                'controls': 1,
                'cc_load_policy': 1,
                'cc_lang_pref': '${selectedLanguage}'
              },
              events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange,
                'onError': onPlayerError
              }
            });
          }

          function onPlayerReady(event) {
            console.log('Player is ready');
            window.ReactNativeWebView.postMessage('player_ready');
            event.target.playVideo();
          }

          function onPlayerStateChange(event) {
            console.log('Player state changed:', event.data);
            window.ReactNativeWebView.postMessage('player_state:' + event.data);
          }

          function onPlayerError(event) {
            console.error('Player error:', event.data);
            window.ReactNativeWebView.postMessage('player_error:' + event.data);
          }
        </script>
      </body>
    </html>
  `

  const handleWebViewError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent
    console.error("WebView Error:", nativeEvent)
    setError("Failed to load video. Please try again.")
  }

  const handleWebViewLoad = () => {
    console.log("WebView loaded successfully")
    setIsLoading(false)
  }

  const handleMessage = (event) => {
    const message = event.nativeEvent.data
    console.log("Received message from WebView:", message)

    if (message === "player_ready") {
      setIsLoading(false)
    } else if (message.startsWith("player_error")) {
      const errorCode = message.split(":")[1]
      console.error("YouTube Player Error:", errorCode)

      // Handle specific error codes
      if (errorCode === "150") {
        Alert.alert(
          "Video Not Available",
          "This video cannot be played in the app. Would you like to watch it on YouTube instead?",
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => router.back(),
            },
            {
              text: "Watch on YouTube",
              onPress: handleWatchFullVideo,
            },
          ],
        )
      } else {
        setError("Failed to load video. Please try again.")
      }
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle} numberOfLines={2}>
          {title}
        </Text>
      </View>

      {/* Video Player */}
      <View style={styles.videoContainer}>
        <View style={styles.languageOverlay}>
          <TouchableOpacity style={styles.languageButton} onPress={() => setShowLanguageModal(true)}>
            <Text style={styles.languageFlag}>
              {AVAILABLE_LANGUAGES.find((lang) => lang.code === selectedLanguage)?.flag}
            </Text>
            <Text style={styles.languageCode}>{selectedLanguage}</Text>
            <Ionicons name="chevron-down" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>

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
                setError(null)
                setIsLoading(true)
                webViewRef.current?.reload()
              }}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.retryButton, { marginTop: 10, backgroundColor: "#4285F4" }]}
              onPress={handleWatchFullVideo}
            >
              <Text style={styles.retryButtonText}>Watch on YouTube</Text>
            </TouchableOpacity>
          </View>
        )}
        <WebView
          ref={webViewRef}
          style={styles.video}
          javaScriptEnabled={true}
          source={{ html: htmlContent }}
          allowsFullscreenVideo={true}
          mediaPlaybackRequiresUserAction={false}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          mixedContentMode="always"
          onError={handleWebViewError}
          onLoad={handleWebViewLoad}
          onMessage={handleMessage}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent
            console.error("WebView HTTP Error:", nativeEvent)
            setError("Network error. Please check your connection.")
          }}
        />
      </View>

      {/* Watch Full Video Button */}
      <TouchableOpacity style={styles.watchFullButton} onPress={handleWatchFullVideo}>
        <Text style={styles.watchFullButtonText}>Watch Full Video on YouTube</Text>
        <Ionicons name="logo-youtube" size={24} color="#FF0000" />
      </TouchableOpacity>

      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Language</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.languageList}>
              {AVAILABLE_LANGUAGES.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  style={[styles.languageOption, selectedLanguage === language.code && styles.selectedLanguageOption]}
                  onPress={() => {
                    setSelectedLanguage(language.code)
                    setShowLanguageModal(false)
                  }}
                >
                  <Text style={styles.languageOptionFlag}>{language.flag}</Text>
                  <Text style={styles.languageOptionName}>{language.name}</Text>
                  <Text style={styles.languageOptionCode}>({language.code})</Text>
                  {selectedLanguage === language.code && (
                    <Ionicons name="checkmark" size={20} color="#1e67cd" style={styles.checkmark} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#000",
  },
  headerTitle: {
    flex: 1,
    marginLeft: 16,
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
  videoContainer: {
    width: "100%",
    height: Dimensions.get("window").height * 0.4,
    backgroundColor: "#000",
    position: "relative",
  },
  video: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  loadingText: {
    color: "#FFF",
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 20,
  },
  errorText: {
    color: "#FFF",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#FF0000",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  watchFullButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    padding: 16,
    margin: 16,
    borderRadius: 8,
    gap: 8,
  },
  watchFullButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  languageOverlay: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
  },
  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  languageFlag: {
    fontSize: 16,
  },
  languageCode: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    width: "85%",
    maxHeight: "70%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  languageList: {
    maxHeight: 400,
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  selectedLanguageOption: {
    backgroundColor: "#F8F9FF",
  },
  languageOptionFlag: {
    fontSize: 20,
    marginRight: 12,
  },
  languageOptionName: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  languageOptionCode: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
  checkmark: {
    marginLeft: 8,
  },
})
