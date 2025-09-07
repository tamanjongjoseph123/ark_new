import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Linking, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BASE_URL } from './base_url';



export default function Projects() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/church-projects/`);
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSupportPress = (project) => {
    Linking.openURL('https://www.johnchi.org/donations')
      .catch(err => {
        console.error('Error opening donation link:', err);
        Alert.alert('Error', 'Something went wrong while opening the donation page');
      });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e67cd" />
        <Text style={styles.loadingText}>Loading projects...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchProjects}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#F8F8F8', '#E8E8E8']}
        style={styles.background}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Church Projects</Text>
          <Text style={styles.headerSubtitle}>Support Kingdom Expansion</Text>
        </View>

        {projects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No projects available at the moment.</Text>
          </View>
        ) : (
          projects.map((project) => (
            <View key={project.id} style={styles.projectCard}>
              <Image
                source={{ uri: project.image }}
                style={styles.projectImage}
              />
              <LinearGradient
                colors={['#D4AF37', '#B8860B']}
                style={styles.projectContent}
              >
                <View style={styles.statusContainer}>
                  <Text style={styles.statusText}>Ongoing</Text>
                  <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { width: '65%' }]} />
                  </View>
                  <Text style={styles.progressText}>65%</Text>
                </View>

                <Text style={styles.projectTitle}>{project.title}</Text>
                <Text style={styles.projectDescription}>{project.description}</Text>

                <TouchableOpacity
                  style={styles.supportButton}
                  onPress={() => handleSupportPress(project)}
                >
                  <Text style={styles.supportButtonText}>Support This Project</Text>
                  <Ionicons name="heart" size={20} color="#D4AF37" />
                </TouchableOpacity>
              </LinearGradient>
            </View>
          ))
        )}

        <View style={styles.infoContainer}>
          <Ionicons name="information-circle" size={24} color="#666" />
          <Text style={styles.infoText}>
            Your support helps us build God's kingdom and impact lives around the world.
          </Text>
        </View>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F8F8',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#1e67cd',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  background: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginVertical: 30,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#333',
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  projectCard: {
    marginBottom: 25,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    backgroundColor: '#FFF',
  },
  projectImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  projectContent: {
    padding: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 10,
  },
  progressContainer: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginRight: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 2,
  },
  progressText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  projectTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 10,
  },
  projectDescription: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.9,
    lineHeight: 24,
    marginBottom: 20,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  supportButtonText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 15,
    marginVertical: 20,
  },
  infoText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
});