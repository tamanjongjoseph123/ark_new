"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  TouchableWithoutFeedback
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { submitPrayerRequest } from "./services/api"
import { WebView } from 'react-native-webview';
import { BASE_URL } from "./base_url";

export default function PrayerRequest() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [country, setCountry] = useState("")
  const [prayerRequest, setPrayerRequest] = useState("")
  const [isConfidential, setIsConfidential] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [prayerRoom, setPrayerRoom] = useState(null)
  const [isLoadingPrayerRoom, setIsLoadingPrayerRoom] = useState(true)
  const webViewRef = useRef(null)

  // Fetch prayer room status
  const fetchPrayerRoom = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/prayer-room/`);
      const data = await response.json();
      setPrayerRoom(data);
    } catch (error) {
      console.error('Error fetching prayer room:', error);
    } finally {
      setIsLoadingPrayerRoom(false);
    }
  };

  // Initial fetch and set up polling
  useEffect(() => {
    fetchPrayerRoom();
    const interval = setInterval(fetchPrayerRoom, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Extract YouTube video ID from URL
  const extractYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // HTML template for audio-only YouTube player
  const getAudioOnlyHtml = (videoId) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        body, html { 
          margin: 0; 
          padding: 0; 
          background-color: transparent;
          overflow: hidden;
          height: 100%;
          width: 100%;
        }
        #player {
          position: absolute;
          width: 1px;
          height: 1px;
          opacity: 0;
          pointer-events: none;
        }
        .audio-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 20px;
        }
        .audio-wave {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 60px;
          width: 100%;
          gap: 4px;
        }
        .wave-bar {
          width: 4px;
          background-color: #1e67cd;
          border-radius: 2px;
          animation: wave 1.5s ease-in-out infinite;
        }
        @keyframes wave {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1.5); }
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
            height: '1',
            width: '1',
            videoId: '${videoId}',
            playerVars: {
              'autoplay': 1,
              'controls': 0,
              'disablekb': 1,
              'fs': 0,
              'iv_load_policy': 3,
              'modestbranding': 1,
              'playsinline': 1,
              'rel': 0,
              'showinfo': 0,
              'enablejsapi': 1
            },
            events: {
              'onReady': onPlayerReady,
              'onStateChange': onPlayerStateChange
            }
          });
        }

        function onPlayerReady(event) {
          event.target.playVideo();
          event.target.mute(); // Start muted to avoid autoplay issues
          setTimeout(() => {
            event.target.unMute(); // Unmute after a short delay
          }, 1000);
          
          // Notify React Native that player is ready
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage('player_ready');
          }
        }

        function onPlayerStateChange(event) {
          if (event.data === YT.PlayerState.PLAYING) {
            // Player started playing
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage('player_playing');
            }
          }
        }
      </script>
    </body>
    </html>
  `;

  // Handle WebView messages
  const handleWebViewMessage = (event) => {
    const message = event.nativeEvent.data;
    console.log('WebView message:', message);
    // Handle any messages from the WebView if needed
  };

  const validateForm = () => {
    const newErrors = {}

    if (!name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required"
    }

    if (!country.trim()) {
      newErrors.country = "Country is required"
    }

    if (!prayerRequest.trim()) {
      newErrors.prayerRequest = "Prayer request is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("Error", "Please fill in all required fields correctly")
      return
    }

    try {
      setIsLoading(true)
      const requestData = {
        name,
        email,
        phone_number: phone,
        country,
        request: prayerRequest,
        is_confidential: isConfidential,
      }

      await submitPrayerRequest(requestData)

      Alert.alert("Thank You", "Your prayer request has been submitted. Our prayer team will be praying for you.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ])
    } catch (error) {
      console.error("Error submitting prayer request:", error)
      Alert.alert("Error", "Failed to submit your prayer request. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const renderError = (fieldName) => {
    if (errors[fieldName]) {
      return <Text style={styles.errorText}>{errors[fieldName]}</Text>
    }
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View>
          {isLoadingPrayerRoom ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1e67cd" />
            <Text style={styles.loadingText}>Loading prayer room...</Text>
          </View>
        ) : prayerRoom?.is_active ? (
          <View style={styles.prayerCallBox}>
            <View style={styles.callHeader}>
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>

            <View style={styles.callContent}>
              <Ionicons name="radio" size={24} color="#1e67cd" />
              <Text style={styles.callTitle}>{prayerRoom.title || 'Prayer Room'}</Text>
              {prayerRoom.current_topic && (
                <Text style={styles.prayerTopic}>Current Topic: "{prayerRoom.current_topic}"</Text>
              )}
              {prayerRoom.description && (
                <Text style={styles.prayerDescription}>{prayerRoom.description}</Text>
              )}
            </View>

            {/* Hidden WebView for audio playback */}
            <View style={{ width: 0, height: 0, overflow: 'hidden' }}>
              <WebView
                ref={webViewRef}
                source={{ 
                  html: getAudioOnlyHtml(extractYouTubeId(prayerRoom.youtube_url) || ''), 
                  baseUrl: 'https://www.youtube.com' 
                }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                allowsFullscreenVideo={false}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                onMessage={handleWebViewMessage}
                scrollEnabled={false}
                style={{ opacity: 0 }}
              />
            </View>

            {/* Visual audio wave animation */}
            <View style={styles.audioWave}>
              {[8, 16, 12, 20, 6, 14, 18, 10].map((height, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.waveBar, 
                    { 
                      height, 
                      animationDelay: `${index * 0.1}s`,
                      backgroundColor: prayerRoom ? '#1e67cd' : '#ccc'
                    }
                  ]} 
                />
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.inactivePrayerRoom}>
            <Ionicons name="radio" size={40} color="#999" />
            <Text style={styles.inactiveText}>No active prayer session at the moment</Text>
            <Text style={styles.inactiveSubtext}>Please check back later for the next prayer session</Text>
          </View>
        )}
        </View>

        <View style={styles.introSection}>
          <Ionicons name="create" size={40} color="#1e67cd" />
          <Text style={styles.introTitle}>Submit Your Prayer Request</Text>
          <Text style={styles.introText}>
            Share your prayer needs with our community. Your request will be included in our prayer sessions.
          </Text>
        </View>

        <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={name}
              onChangeText={(text) => {
                setName(text)
                setErrors({ ...errors, name: null })
              }}
              placeholder="Enter your name"
              placeholderTextColor="#999"
            />
            {renderError("name")}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Email <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={email}
              onChangeText={(text) => {
                setEmail(text)
                setErrors({ ...errors, email: null })
              }}
              placeholder="Enter your email"
              keyboardType="email-address"
              placeholderTextColor="#999"
              autoCapitalize="none"
            />
            {renderError("email")}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Phone <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              value={phone}
              onChangeText={(text) => {
                setPhone(text)
                setErrors({ ...errors, phone: null })
              }}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              placeholderTextColor="#999"
            />
            {renderError("phone")}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Country <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.country && styles.inputError]}
              value={country}
              onChangeText={(text) => {
                setCountry(text)
                setErrors({ ...errors, country: null })
              }}
              placeholder="Enter your country"
              placeholderTextColor="#999"
            />
            {renderError("country")}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Your Prayer Request <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.textArea, errors.prayerRequest && styles.inputError]}
              value={prayerRequest}
              onChangeText={(text) => {
                setPrayerRequest(text)
                setErrors({ ...errors, prayerRequest: null })
              }}
              placeholder="Share your prayer request here..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              placeholderTextColor="#999"
            />
            {renderError("prayerRequest")}
          </View>

          <TouchableOpacity style={styles.confidentialButton} onPress={() => setIsConfidential(!isConfidential)}>
            <View style={[styles.checkbox, isConfidential && styles.checkboxChecked]}>
              {isConfidential && <Ionicons name="checkmark" size={16} color="#FFF" />}
            </View>
            <Text style={styles.confidentialText}>Keep my request confidential</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Prayer Request</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            * Required fields. Your prayer request will be shared with our prayer team who will faithfully pray for your
            needs.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#1e67cd",
    padding: 20,
    paddingTop: 40,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  introSection: {
    alignItems: "center",
    padding: 30,
    backgroundColor: "#FFF",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e67cd",
    marginTop: 15,
    marginBottom: 10,
  },
  introText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#1e67cd",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  confidentialButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#1e67cd",
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#1e67cd",
    borderColor: "#1e67cd",
  },
  confidentialText: {
    fontSize: 16,
    color: "#1e67cd",
  },
  submitButton: {
    backgroundColor: "#1e67cd",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
  disclaimer: {
    marginTop: 20,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
  required: {
    color: "#FF3B30",
    fontSize: 16,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    marginTop: 5,
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  prayerCallBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  inactivePrayerRoom: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 24,
    margin: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
    borderStyle: 'dashed',
  },
  inactiveText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  inactiveSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  prayerDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  prayerTopic: {
    fontSize: 15,
    color: "#1e67cd",
    marginTop: 4,
    textAlign: "center",
    fontWeight: '500',
  },
  callHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  callTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginTop: 8,
    textAlign: "center",
    marginBottom: 4,
  },
  participantCount: {
    fontSize: 12,
    color: "#999999",
    marginTop: 4,
    textAlign: "center",
  },
  '@keyframes wave': {
    '0%, 100%': {
      transform: [{ scaleY: 0.5 }],
    },
    '50%': {
      transform: [{ scaleY: 1.5 }],
    },
  },
  audioWave: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    marginTop: 16,
    gap: 4,
    opacity: 0.8,
  },
  waveBar: {
    width: 3,
    backgroundColor: "#1e67cd",
    marginHorizontal: 1,
    borderRadius: 2,
    opacity: 0.7,
  },
})
