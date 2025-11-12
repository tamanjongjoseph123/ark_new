import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform, FlatList, Alert as RNAlert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import WebView from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';
import { Linking, Alert } from 'react-native';
import React, { useState, useRef, useEffect, useContext } from 'react';
import { getCourseVideo, listComments, postComment, postReply, getReplies } from './services/api';
import { AuthContext } from './Contexts/AuthContext';

export default function VideoDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { videoId, title, youtubeUrl, courseVideoId } = params;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('keyTakeaways');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const webViewRef = useRef(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [keyTakeaways, setKeyTakeaways] = useState('');
  const [assignments, setAssignments] = useState('');
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loadingReplies, setLoadingReplies] = useState({});
  const { userToken, setUserToken, removeToken } = useContext(AuthContext);
  const [showLoginModal, setShowLoginModal] = useState(false);

  console.log('Video Details Params:', { videoId, title, youtubeUrl });

  // Reset player loading state when video changes
  useEffect(() => {
    setIsLoading(true);
    setError(null);
  }, [videoId, youtubeUrl]);

  // Load video details and comments
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!courseVideoId) return;
      setDetailsLoading(true);
      setCommentsLoading(true);
      try {
        const [video, cmts] = await Promise.all([
          getCourseVideo(courseVideoId).catch((e) => {
            setDetailsError('Failed to load details');
            return null;
          }),
          listComments(courseVideoId).catch(() => []),
        ]);
        if (!mounted) return;
        if (video) {
          setKeyTakeaways(video.key_takeaways || '');
          setAssignments(video.assignments || '');
        }
        setComments(Array.isArray(cmts) ? cmts : []);
      } finally {
        setDetailsLoading(false);
        setCommentsLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [courseVideoId]);

  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    
    if (!userToken) {
      setShowLoginModal(true);
      return;
    }

    try {
      setCommentsLoading(true);
      
      if (replyingTo) {
        // Handle reply
        await postReply({
          token: userToken,
          commentId: replyingTo.id,
          text: commentText.trim(),
          videoId: Number(courseVideoId)
        });
        setReplyingTo(null);
      } else {
        // Handle new comment
        await postComment({ 
          token: userToken, 
          video: Number(courseVideoId), 
          text: commentText.trim(), 
          parent: null 
        });
      }
      
      // Clear the input
      setCommentText('');
      
      // Force a refresh of the comments
      const refreshed = await listComments(courseVideoId);
      
      if (Array.isArray(refreshed)) {
        setComments(refreshed);
      } else {
        // If the response isn't an array, try to get comments again with the video ID as a string
        const retryRefreshed = await listComments(courseVideoId.toString());
        setComments(Array.isArray(retryRefreshed) ? retryRefreshed : []);
      }
      
      // Reset loading state
      setCommentsLoading(false);
    } catch (e) {
      console.error('Error posting comment:', e);
      if (e?.response?.status === 401) {
        removeToken();
        setShowLoginModal(true);
        RNAlert.alert('Session Expired', 'Please log in again to continue.');
      } else {
        RNAlert.alert('Error', `Failed to ${replyingTo ? 'post reply' : 'post comment'}. Please try again.`);
      }
    }
  };

  const handleLoadReplies = async (commentId) => {
    if (!userToken) {
      setShowLoginModal(true);
      return;
    }

    try {
      setLoadingReplies(prev => ({ ...prev, [commentId]: true }));
      const replies = await getReplies(commentId, userToken);
      
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, replies: replies, replies_loaded: true };
        }
        return comment;
      }));
    } catch (e) {
      console.error('Error loading replies:', e);
      if (e?.response?.status === 401) {
        removeToken();
        setShowLoginModal(true);
        RNAlert.alert('Session Expired', 'Please log in again to continue.');
      } else {
        RNAlert.alert('Error', 'Failed to load replies. Please try again.');
      }
    } finally {
      setLoadingReplies(prev => ({ ...prev, [commentId]: false }));
    }
  };

  const handleReply = (comment) => {
    if (!userToken) {
      setShowLoginModal(true);
      return;
    }
    setReplyingTo(comment);
    setCommentText(`@${comment.user?.username || 'User'} `);
    // Optionally scroll to the input
  };


  const handleLogin = () => {
    // This will trigger the AuthContext's login flow
    router.push('/login');
  };

  // Language options with their corresponding stream URLs
  const languages = [
    { name: 'English', code: 'en', streamUrl: 'https://www.youtube.com/embed/-VJKbieTmKA' },
    { name: 'French', code: 'fr', streamUrl: 'https://www.youtube.com/embed/-VJKbieTmKA' },
    { name: 'Chinese', code: 'zh', streamUrl: 'https://www.youtube.com/embed/-VJKbieTmKA' },
    { name: 'Spanish', code: 'es', streamUrl: 'https://www.youtube.com/embed/-VJKbieTmKA' },
    { name: 'German', code: 'de', streamUrl: 'https://www.youtube.com/embed/-VJKbieTmKA' }
  ];

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language.name);
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
            window.ReactNativeWebView.postMessage('player_ready');
            try {
              event.target.mute();
              event.target.playVideo();
            } catch (e) {}
          }

          function onPlayerStateChange(event) {
            window.ReactNativeWebView.postMessage('player_state:' + event.data);
            if (event.data === YT.PlayerState.PLAYING) {
              try { event.target.unMute(); } catch (e) {}
            }
          }

          function onPlayerError(event) {
            var code = event && event.data;
            if ((code === 101 || code === 150 || code === 152 || code === 153) && !triedAlternateHost) {
              triedAlternateHost = true;
              currentHost = (currentHost === 'https://www.youtube-nocookie.com') ? 'https://www.youtube.com' : 'https://www.youtube-nocookie.com';
              try { createPlayer(); } catch (e) { window.ReactNativeWebView.postMessage('player_error:' + code); }
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
      // Show in-app error only; no external redirection here
      setError('Failed to load video. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
     
        <Text style={styles.headerTitle} numberOfLines={2}>{title}</Text>
      </View>

      {/* Video Player */}
      <View style={styles.videoContainer}>
        {/* Language Translator Button */}
        <TouchableOpacity 
          style={styles.languageButton}
          onPress={() => setShowLanguageModal(true)}
        >
          <Ionicons name="language" size={16} color="#FFF" />
          <Text style={styles.languageButtonText}>{selectedLanguage}</Text>
          <Ionicons name="chevron-down" size={14} color="#FFF" />
        </TouchableOpacity>

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
            <TouchableOpacity 
              style={[styles.retryButton, { marginTop: 10, backgroundColor: '#4285F4' }]}
              onPress={handleWatchFullVideo}
            >
              <Text style={styles.retryButtonText}>Watch on YouTube</Text>
            </TouchableOpacity>
          </View>
        )}
        <WebView
          key={(videoId || youtubeUrl || '').toString()}
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

      {/* Tab Headers */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'keyTakeaways' && styles.activeTabButton]}
          onPress={() => setActiveTab('keyTakeaways')}
        >
          <Text style={[styles.tabText, activeTab === 'keyTakeaways' && styles.activeTabText]}>
            Key Takeaways
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'assignments' && styles.activeTabButton]}
          onPress={() => setActiveTab('assignments')}
        >
          <Text style={[styles.tabText, activeTab === 'assignments' && styles.activeTabText]}>
            Assignments
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'discussions' && styles.activeTabButton]}
          onPress={() => setActiveTab('discussions')}
        >
          <Text style={[styles.tabText, activeTab === 'discussions' && styles.activeTabText]}>
            Discussions
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === 'keyTakeaways' && (
          <View style={styles.tabSection}>
            <Text style={styles.tabSectionTitle}>Key Takeaways</Text>
            {detailsLoading ? (
              <ActivityIndicator />
            ) : keyTakeaways ? (
              keyTakeaways.split('\n').map((line, idx) => (
                <View key={idx} style={styles.keyPointItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#27AE60" />
                  <Text style={styles.keyPointText}>{line}</Text>
                </View>
              ))
            ) : (
              <Text style={{ color: '#666' }}>No key takeaways provided.</Text>
            )}
          </View>
        )}

        {activeTab === 'assignments' && (
          <View style={styles.tabSection}>
            <Text style={styles.tabSectionTitle}>Assignments</Text>
            {detailsLoading ? (
              <ActivityIndicator />
            ) : assignments ? (
              assignments.split('\n').map((line, idx) => (
                <View key={idx} style={styles.assignmentItem}>
                  <Ionicons name="document-text" size={20} color="#3498DB" />
                  <Text style={styles.assignmentText}>{line}</Text>
                </View>
              ))
            ) : (
              <Text style={{ color: '#666' }}>No assignments provided.</Text>
            )}
          </View>
        )}

        {activeTab === 'discussions' && (
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <View style={styles.tabSection}>
              <Text style={styles.tabSectionTitle}>Comments</Text>
              {commentsLoading ? (
                <ActivityIndicator />
              ) : (
                <FlatList
                  data={comments}
                  keyExtractor={(item) => String(item.id)}
                  renderItem={({ item }) => (
                    <View style={[styles.commentContainer, { marginBottom: 14 }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                        <Ionicons name="person-circle" size={22} color="#999" />
                        <Text style={{ marginLeft: 6, fontWeight: '600', color: '#2C3E50' }}>
                          {item.user?.username || 'User'}
                        </Text>
                        <Text style={{ marginLeft: 'auto', fontSize: 12, color: '#888' }}>
                          {new Date(item.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                      <Text style={{ color: '#2C3E50', marginBottom: 6 }}>{item.text}</Text>
                      
                      {/* Reply button */}
                      <TouchableOpacity 
                        onPress={() => handleReply(item)}
                        style={styles.replyButton}
                      >
                        <Ionicons name="arrow-undo" size={14} color="#666" />
                        <Text style={styles.replyButtonText}>Reply</Text>
                      </TouchableOpacity>
                      
                      {/* Replies section */}
                      {item.reply_count > 0 && (
                        <View>
                          {!item.replies_loaded ? (
                            <TouchableOpacity 
                              onPress={() => handleLoadReplies(item.id)}
                              style={styles.viewRepliesButton}
                            >
                              <Text style={styles.viewRepliesText}>
                                {loadingReplies[item.id] 
                                  ? 'Loading...' 
                                  : `View ${item.reply_count} ${item.reply_count === 1 ? 'reply' : 'replies'}`}
                              </Text>
                            </TouchableOpacity>
                          ) : (
                            <View style={styles.repliesContainer}>
                              {item.replies?.map((reply) => (
                                <View key={reply.id} style={styles.replyContainer}>
                                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                    <Ionicons name="arrow-forward" size={14} color="#bbb" />
                                    <Ionicons name="person" size={16} color="#999" style={{ marginLeft: 4 }} />
                                    <Text style={{ marginLeft: 4, fontWeight: '600', fontSize: 13, color: '#2C3E50' }}>
                                      {reply.user?.username || 'User'}
                                    </Text>
                                    <Text style={{ marginLeft: 'auto', fontSize: 11, color: '#888' }}>
                                      {new Date(reply.created_at).toLocaleDateString()}
                                    </Text>
                                  </View>
                                  <Text style={{ color: '#2C3E50', fontSize: 14, marginLeft: 24 }}>{reply.text}</Text>
                                </View>
                              ))}
                            </View>
                          )}
                        </View>
                      )}
                  </View>
                  )}
                  ListEmptyComponent={<Text style={{ color: '#666' }}>No comments yet.</Text>}
                />
              )}
            </View>
            {replyingTo && (
              <View style={styles.replyingToContainer}>
                <Text style={styles.replyingToText}>
                  Replying to @{replyingTo.user?.username || 'user'}
                </Text>
                <TouchableOpacity onPress={() => setReplyingTo(null)}>
                  <Ionicons name="close" size={18} color="#666" />
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.commentInputContainer}>
              <TextInput
                value={commentText}
                onChangeText={setCommentText}
                placeholder={replyingTo 
                  ? `Replying to @${replyingTo.user?.username || 'user'}...`
                  : userToken ? "Add a comment..." : "Sign in to comment..."
                }
                style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: '#F5F5F7', borderRadius: 20 }}
                onFocus={() => { if (!userToken) setShowLoginModal(true); }}
              />
              <TouchableOpacity onPress={handleSendComment} style={{ marginLeft: 10 }}>
                <Ionicons name="send" size={22} color="#3498DB" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}
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
            <Text style={styles.languageModalTitle}>Select Language</Text>
            {languages.map((language) => (
      <TouchableOpacity 
                key={language.code}
                style={[
                  styles.languageOption,
                  selectedLanguage === language.name && styles.languageOptionSelected
                ]}
                onPress={() => handleLanguageSelect(language)}
              >
                <Text style={[
                  styles.languageOptionText,
                  selectedLanguage === language.name && styles.languageOptionTextSelected
                ]}>
                  {language.name}
                </Text>
                {selectedLanguage === language.name && (
                  <Ionicons name="checkmark" size={20} color="#3498DB" />
                )}
              </TouchableOpacity>
            ))}
          </View>
      </TouchableOpacity>
      </Modal>

      {/* Login Modal for commenting */}
      {showLoginModal && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showLoginModal}
          onRequestClose={() => setShowLoginModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Sign In to Comment</Text>
              <Text style={styles.modalText}>You need to be signed in to post a comment.</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]} 
                  onPress={() => setShowLoginModal(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.loginButton]} 
                  onPress={() => navigation.navigate('Auth')}
                >
                  <Text style={styles.buttonText}>Go to Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  commentContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  replyButtonText: {
    color: '#666',
    fontSize: 13,
    marginLeft: 4,
  },
  viewRepliesButton: {
    marginTop: 8,
    padding: 4,
  },
  viewRepliesText: {
    color: '#3498DB',
    fontSize: 13,
    fontWeight: '500',
  },
  repliesContainer: {
    marginTop: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#e1e4e8',
    paddingLeft: 12,
  },
  replyContainer: {
    backgroundColor: '#f1f3f5',
    borderRadius: 6,
    padding: 8,
    marginTop: 6,
  },
  replyingToContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  replyingToText: {
    color: '#666',
    fontSize: 13,
    fontStyle: 'italic',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#FFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#000',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    marginLeft: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  videoContainer: {
    width: '100%',
    height: Dimensions.get('window').height * 0.4,
    backgroundColor: '#000',
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
  // Language Button Styles
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

  // Tab Styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#3498DB',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#3498DB',
    fontWeight: '600',
  },

  // Tab Content Styles
  tabContent: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 20,
  },
  tabSection: {
    flex: 1,
  },
  tabSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 20,
  },

  // Key Points Styles
  keyPointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 12,
  },
  keyPointText: {
    fontSize: 16,
    color: '#2C3E50',
    flex: 1,
    lineHeight: 22,
  },

  // Assignment Styles
  assignmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 12,
  },
  assignmentText: {
    fontSize: 16,
    color: '#2C3E50',
    flex: 1,
    lineHeight: 22,
  },

  // Discussion Styles
  discussionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 12,
  },
  discussionText: {
    fontSize: 16,
    color: '#2C3E50',
    flex: 1,
    lineHeight: 22,
  },

  // Language Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageModal: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    maxWidth: 300,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  languageModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#F8F9FA',
  },
  languageOptionSelected: {
    backgroundColor: '#EBF3FD',
    borderWidth: 1,
    borderColor: '#3498DB',
  },
  languageOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  languageOptionTextSelected: {
    color: '#3498DB',
    fontWeight: '600',
  },
});