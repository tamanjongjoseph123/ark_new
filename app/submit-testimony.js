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
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setVideoUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick video');
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

      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'Please login to submit a testimony');
        router.push('/login');
        return;
      }

      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('testimony_text', testimonyText.trim());
      
      if (videoUri) {
        const videoFile = {
          uri: videoUri,
          type: 'video/mp4',
          name: 'testimony_video.mp4'
        };
        formData.append('testimony_video', videoFile);
      }

      console.log('Form Data:', {
        name: name.trim(),
        testimony_text: testimonyText.trim(),
        has_video: !!videoUri,
        video_uri: videoUri
      });

      const response = await fetch(`${BASE_URL}/api/testimonies/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      console.log('Response Status:', response.status);

      const responseData = await response.json();
      console.log('Response Data:', responseData);
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to submit testimony');
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
    >
      <LinearGradient
        colors={['#1E3A8A', '#2563EB']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Share Your Testimony</Text>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
                <Ionicons name="cloud-upload" size={40} color="#1E3A8A" />
                <Text style={styles.uploadText}>
                  {videoUri ? 'Change Video' : 'Upload Video'}
                </Text>
              </TouchableOpacity>
              {videoUri && (
                <Text style={styles.videoSelected}>Video selected successfully</Text>
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
  videoSelected: {
    color: '#008000',
    marginTop: 10,
    fontSize: 16,
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
    marginTop: 10,
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