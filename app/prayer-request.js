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

  // Fetch prayer room status with enhanced logging
  const fetchPrayerRoom = async () => {
    console.log('🔍 Fetching prayer room status...');
    try {
      const response = await fetch(`${BASE_URL}/api/prayer-room/`);
      console.log('📡 Prayer room response status:', response.status);
      const data = await response.json();
      console.log('📋 Prayer room data:', data);
      setPrayerRoom(data);
      
      // Log video URL and extracted ID
      if (data?.youtube_url) {
        const videoId = extractYouTubeId(data.youtube_url);
        console.log('🎥 YouTube URL:', data.youtube_url);
        console.log('🆔 Extracted Video ID:', videoId);
      } else {
        console.warn('⚠️ No YouTube URL found in prayer room data');
      }
    } catch (error) {
      console.error('❌ Error fetching prayer room:', error);
    } finally {
      setIsLoadingPrayerRoom(false);
    }
  };

  // Initial fetch and set up polling
  useEffect(() => {
    console.log('🚀 Initializing prayer room component');
    fetchPrayerRoom();
    
    const interval = setInterval(() => {
      console.log('🔄 Polling for prayer room updates...');
      fetchPrayerRoom();
    }, 30000); // Poll every 30 seconds
    
    return () => {
      console.log('🧹 Cleaning up prayer room component');
      clearInterval(interval);
    };
  }, []);

  // Extract YouTube video ID from URL - matches livestreaming.tsx implementation
  const extractYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7]?.length === 11) ? match[7] : null;
  };

  // HTML template for YouTube player - matches livestreaming.tsx implementation
  const getPlayerHtml = (videoId) => {
    console.log('🛠️ Generating player HTML for video ID:', videoId);
    if (!videoId) {
      console.error('❌ No video ID provided for player');
      return '';
    }
    
    return `
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
                'iv_load_policy': 3,
                'enablejsapi': 1,
                'origin': window.location.origin
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
            event.target.playVideo();
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage('player_ready');
            }
          }

          function onPlayerStateChange(event) {
            if (event.data === YT.PlayerState.PLAYING) {
              console.log('Player started playing');
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage('player_playing');
              }
            }
        function onPlayerStateChange(event) {
          if (event.data === YT.PlayerState.PLAYING && window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage('player_playing');
          }
        }
      </script>
    </body>
    </html>
  `;
  };

  // Handle WebView messages with enhanced logging
  const handleWebViewMessage = (event) => {
    const message = event.nativeEvent.data;
    console.log('📩 WebView message:', message);
    
    switch(message) {
      case 'player_ready':
        console.log('✅ YouTube Player is ready');
        break;
      case 'player_playing':
        console.log('▶️ YouTube Player started playing');
        break;
      default:
        console.log('ℹ️ Unknown WebView message:', message);
    }
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

  const handlePrayerRoomPress = () => {
    if (prayerRoom?.is_active) {
      router.push({
        pathname: '/prayer-videostream',
        params: { prayerRoom: JSON.stringify(prayerRoom) }
      });
    }
  };

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
          <TouchableOpacity 
            style={styles.prayerCallBox}
            activeOpacity={0.8}
            onPress={handlePrayerRoomPress}
          >
            <View style={styles.callHeader}>
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE NOW</Text>
              </View>
              <Text style={styles.durationText}>
                {prayerRoom.started_at ? `Started ${new Date(prayerRoom.started_at).toLocaleTimeString()}` : 'Live'}
              </Text>
            </View>

            {/* Video Player */}
            <View style={styles.videoContainer}>
              <WebView
                ref={webViewRef}
                source={{ 
                  html: getPlayerHtml(extractYouTubeId(prayerRoom.youtube_url)),
                  baseUrl: 'https://www.youtube.com' 
                }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                allowsFullscreenVideo={true}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                onMessage={handleWebViewMessage}
                scrollEnabled={false}
                style={styles.videoPlayer}
                onLoadStart={() => console.log('🌐 WebView loading started')}
                onLoadEnd={() => console.log('✅ WebView loading finished')}
                onLoad={() => console.log('🚀 WebView loaded successfully')}
                onError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  console.error('❌ WebView error: ', nativeEvent);
                }}
                onHttpError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  console.error('❌ WebView HTTP error: ', nativeEvent);
                }}
                onContentProcessDidTerminate={() => 
                  console.warn('⚠️ WebView content process terminated')
                }
                onShouldStartLoadWithRequest={(request) => {
                  console.log('🔗 WebView loading URL:', request.url);
                  return true;
                }}
              />
            </View>

            <View style={styles.callContent}>
              <Text style={styles.callTitle}>{prayerRoom.title || 'Prayer Room'}</Text>
              
              {prayerRoom.current_topic && (
                <View style={styles.topicContainer}>
                  <Text style={styles.topicLabel}>Current Prayer Topic:</Text>
                  <Text style={styles.prayerTopic}>"{prayerRoom.current_topic}"</Text>
                </View>
              )}
              
              {prayerRoom.description && (
                <Text style={styles.prayerDescription}>{prayerRoom.description}</Text>
              )}
              
              {/* Audio controls for background playback */}
              <View style={styles.audioControls}>
                <Text style={styles.audioLabel}>Background Audio:</Text>
                <View style={styles.audioWave}>
                  {[8, 16, 12, 20, 6, 14, 18, 10].map((height, index) => (
                    <View 
                      key={`wave-${index}`}
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
            </View>
          </TouchableOpacity>
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
    color: '#555',
    lineHeight: 22,
    marginTop: 8,
    fontFamily: 'Inter-Regular',
  },
  prayerTopic: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Inter-SemiBold',
    lineHeight: 22,
  },
  callHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  durationText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Inter-Medium',
  },
  callTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e67cd',
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
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
