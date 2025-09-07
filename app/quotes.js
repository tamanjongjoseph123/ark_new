import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BASE_URL } from './base_url';



export default function QuotesScreen() {
  const router = useRouter();
  const [quotes, setQuotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      console.log('Starting to fetch quotes...');
      const url = `${BASE_URL}/api/inspiration-quotes/`.replace('//api', '/api');
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        console.error('Response not ok:', response.status, response.statusText);
        throw new Error(`Failed to fetch quotes: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Successfully fetched quotes:', data);
      setQuotes(data);
    } catch (err) {
      console.error('Error in fetchQuotes:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e67cd" />
        <Text style={styles.loadingText}>Loading quotes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchQuotes}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
   

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {quotes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No quotes available at the moment.</Text>
          </View>
        ) : (
          <View style={styles.quotesGrid}>
            {quotes.map((quote) => (
              <View key={quote.id} style={styles.quoteWrapper}>
                <LinearGradient
                  colors={['#1e67cd', '#1e67cd']}
                  style={styles.quoteCard}
                >
                  <View style={styles.quoteIconContainer}>
                    <Image 
                      source={require('../assets/images/pastorr.jpg')}
                      style={styles.pastorImage}
                    />
                  </View>
                  
                  <Text style={styles.quoteText}>"{quote.quote}"</Text>
                  
                  <View style={styles.quoteFooter}>
                    <Text style={styles.authorName}>- Apostle John Chi</Text>
                    <Text style={styles.quoteDate}>
                      {new Date(quote.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long'
                      })}
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginLeft: 16,
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
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
  quotesGrid: {
    flexDirection: 'column',
    gap: 16,
  },
  quoteWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  quoteCard: {
    padding: 24,
    borderRadius: 16,
  },
  quoteIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
    marginBottom: 16,
  },
  pastorImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  quoteText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#FFF',
    fontWeight: '600',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  quoteFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 16,
    marginTop: 'auto',
  },
  authorName: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '700',
    marginBottom: 4,
  },
  quoteDate: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
});