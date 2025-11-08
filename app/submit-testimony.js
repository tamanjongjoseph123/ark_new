import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Alert,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './base_url';

export default function SubmitTestimony() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [testimonyText, setTestimonyText] = useState('');
  const [videoUri, setVideoUri] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const pickVideo = async () => {
    try {
      console.log('Launching video picker...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'videos',  // Updated to use string value instead of MediaTypeOptions
        allowsEditing: true,
        quality: 1,
        videoMaxDuration: 300, // 5 minutes max
        videoQuality: 0.7,
      });
      console.log('Video picker result:', result);

      if (!result.canceled) {
        const video = result.assets[0];
        console.log('Selected video:', {
          uri: video.uri,
          type: video.mimeType || 'video/mp4',
          name: video.fileName || `testimony_${Date.now()}.mp4`,
          size: video.fileSize
        });
        setVideoUri(video.uri);
      } else {
        console.log('User cancelled video selection');
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to pick video. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!testimonyText.trim()) {
      setError('Please enter your testimony');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // No authentication required for submitting testimonies

      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('testimony_text', testimonyText.trim());
      
      if (videoUri) {
        // Get file info for the video
        const filename = videoUri.split('/').pop();
        const match = /(\.\w+)(?:\?.*)?$/.exec(filename);
        const ext = match ? match[1] : '.mp4';
        const type = `video/${ext.replace('.', '')}`;
        
        const videoFile = {
          uri: videoUri,
          type: type,
          name: `testimony_${Date.now()}${ext}`
        };
        
        console.log('Appending video file:', videoFile);
        formData.append('testimony_video', videoFile);
      }

      console.log('Form Data:', {
        name: name.trim(),
        testimony_text: testimonyText.trim(),
        has_video: !!videoUri,
        video_uri: videoUri
      });

      console.log('Sending request to:', `${BASE_URL}/api/testimonies/`);
      console.log('Request headers:', {
        'Content-Type': 'multipart/form-data',
      });
      
      // Log form data for debugging
      for (let [key, value] of formData._parts) {
        console.log(`Form Data - ${key}:`, value);
      }

      // Don't set Content-Type header - let the browser set it with the correct boundary
      const response = await fetch(`${BASE_URL}/api/testimonies/`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData
      });

      console.log('Response Status:', response.status);
      const responseData = await response.json().catch(e => ({}));
      console.log('Response Data:', responseData);
      
      if (!response.ok) {
        let errorMsg = 'Failed to submit testimony';
        
        if (responseData) {
          if (typeof responseData === 'string') {
            errorMsg = responseData;
          } else if (responseData.detail) {
            errorMsg = responseData.detail;
          } else if (responseData.message) {
            errorMsg = responseData.message;
          } else if (responseData.testimony_video) {
            errorMsg = `Video error: ${responseData.testimony_video.join(', ')}`;
          } else if (typeof responseData === 'object') {
            errorMsg = Object.values(responseData).flat().join(', ');
          }
        }
        
        console.error('Submission error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorMsg,
          responseData: responseData
        });
        
        throw new Error(errorMsg);
      }

      Alert.alert(
        'Success',
        'Your testimony has been submitted successfully. We will review it shortly.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err) {
      console.error('Error submitting testimony:', err);
      setError(err.message || 'Failed to submit testimony. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <LinearGradient
        colors={['#1E3A8A', '#2563EB']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Share Your Testimony</Text>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Your Name *"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.textArea}
            placeholder="Share your testimony here... *"
            multiline
            numberOfLines={8}
            value={testimonyText}
            onChangeText={setTestimonyText}
          />

          <View style={styles.videoSection}>
            <Text style={styles.sectionTitle}>Add Video (Optional)</Text>
            <View style={styles.videoContainer}>
              <TouchableOpacity 
                style={styles.uploadButton}
                onPress={pickVideo}
              >
                <Ionicons 
                  name={videoUri ? "checkmark-circle" : "cloud-upload"} 
                  size={40} 
                  color={videoUri ? "#4CAF50" : "#1E3A8A"} 
                />
                <Text style={styles.uploadText}>
                  {videoUri ? 'Change Video' : 'Upload Video'}
                </Text>
              </TouchableOpacity>
              {videoUri && (
                <View style={styles.videoInfo}>
                  <Ionicons name="videocam" size={16} color="#4CAF50" />
                  <Text style={styles.videoSelected}>Video selected</Text>
                </View>
              )}
            </View>
          </View>

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <TouchableOpacity 
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Testimony</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  formContainer: {
    padding: 20,
    flex: 1,
  },
  input: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  textArea: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
    height: 200,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  videoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  videoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    padding: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#1E3A8A',
    borderStyle: 'dashed',
    width: '100%',
  },
  uploadText: {
    color: '#1E3A8A',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
  },
  videoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  videoSelected: {
    color: '#4CAF50',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#1E3A8A',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 