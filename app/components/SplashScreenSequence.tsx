import React, { useEffect, useState } from 'react';
import { View, Image, Text, StyleSheet, Dimensions } from 'react-native';
import { getVideos, getQuotes, getEvents, getProjects } from '../services/api';

const SPLASH_DURATION = 3000; // 3 seconds per screen

interface SplashScreenSequenceProps {
  onComplete: () => void;
  onDataLoaded: (data: any) => void;
}

export default function SplashScreenSequence({ onComplete, onDataLoaded }: SplashScreenSequenceProps) {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Create an array of promises with error handling for each
        const promises = [
          getVideos('prophecy').catch(err => {
            console.error('Error fetching prophecies:', err);
            return [];
          }),
          getVideos('crusades').catch(err => {
            console.error('Error fetching crusades:', err);
            return [];
          }),
          getVideos('testimonies').catch(err => {
            console.error('Error fetching testimonies:', err);
            return [];
          }),
          getVideos('healings').catch(err => {
            console.error('Error fetching healings:', err);
            return [];
          }),
          getVideos('prayers').catch(err => {
            console.error('Error fetching prayers:', err);
            return [];
          }),
          getVideos('mass_prayers').catch(err => {
            console.error('Error fetching mass_prayers:', err);
            return [];
          }),
          getVideos('deliverance').catch(err => {
            console.error('Error fetching deliverance:', err);
            return [];
          }),
          getVideos('charities').catch(err => {
            console.error('Error fetching charities:', err);
            return [];
          }),
          getQuotes().catch(err => {
            console.error('Error fetching quotes:', err);
            return [];
          }),
          getEvents().catch(err => {
            console.error('Error fetching events:', err);
            return [];
          }),
          getProjects().catch(err => {
            console.error('Error fetching projects:', err);
            return [];
          })
        ];

        // Wait for all promises to resolve, even if some fail
        const [
          prophecies,
          crusades,
          testimonies,
          healings,
          prayers,
          massPrayers,
          deliverance,
          charities,
          quotes,
          events,
          projects
        ] = await Promise.all(promises);

        // Safe sort function that handles potential null/undefined values
        const safeSortByDate = (a: any, b: any) => {
          if (!a || !a.created_at) return 1;
          if (!b || !b.created_at) return -1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        };

        // Safe slice function that handles potential null/undefined arrays
        const safeSlice = (arr: any[], count: number) => {
          if (!arr || !Array.isArray(arr)) return [];
          return arr.sort(safeSortByDate).slice(0, count);
        };

        const data = {
          prophecies: safeSlice(prophecies, 5),
          crusades: safeSlice(crusades, 5),
          testimonies: safeSlice(testimonies, 5),
          healings: safeSlice(healings, 5),
          prayers: safeSlice(prayers, 5),
          massPrayers: safeSlice(massPrayers, 5),
          deliverance: safeSlice(deliverance, 5),
          charities: safeSlice(charities, 2),
          quotes: safeSlice(quotes, 2),
          events: safeSlice(events, 2),
          projects: safeSlice(projects, 2)
        };

        onDataLoaded(data);
      } catch (error) {
        console.error('Error preloading data:', error);
        // Provide empty data to prevent app from crashing
        onDataLoaded({
          prophecies: [],
          crusades: [],
          testimonies: [],
          healings: [],
          prayers: [],
          massPrayers: [],
          deliverance: [],
          charities: [],
          quotes: [],
          events: [],
          projects: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentScreen === 0) {
        setCurrentScreen(1);
      } else {
        onComplete();
      }
    }, SPLASH_DURATION);

    return () => clearTimeout(timer);
  }, [currentScreen, onComplete]);

  if (currentScreen === 0) {
    return (
      <View style={styles.container}>
        <Image
          source={require('../../assets/images/ark-of-god.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.slogan}>Citizens of heaven</Text>
        <Text style={styles.slogan}>We know ourselves</Text>
        {isLoading && <Text style={styles.loadingText}>Loading content...</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/pastor.png')}
        style={styles.pastorImage}
        resizeMode="contain"
      />
      <Text style={styles.message}>Keep watching Ark of God TV</Text>
      {isLoading && <Text style={styles.loadingText}>Loading content...</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  logo: {
    width: Dimensions.get('window').width * 0.7,
    height: Dimensions.get('window').width * 0.7,
    marginBottom: 20,
  },
  pastorImage: {
    width: Dimensions.get('window').width * 0.95,
    height: Dimensions.get('window').height * 0.75,
    marginTop: -20,
  },
  slogan: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  message: {
    fontSize: 28,
    textAlign: 'center',
    color: '#333',
    padding: 20,
    fontWeight: 'bold',
    position: 'absolute',
    bottom: 40,
    width: '100%',
  },
  loadingText: {
    position: 'absolute',
    bottom: 20,
    fontSize: 16,
    color: '#666',
  },
});