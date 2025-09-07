import { React, useState, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Ionicons from '@expo/vector-icons/Ionicons';
import SplashScreenSequence from '../components/SplashScreenSequence';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [preloadedData, setPreloadedData] = useState(null);

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  // Show splash screen sequence first
  if (showSplash) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <SplashScreenSequence
          onComplete={() => setShowSplash(false)}
          onDataLoaded={(data) => {
            setPreloadedData(data);
            // Use AsyncStorage instead of global variable
            try {
              // @ts-ignore - We're using the global variable as a temporary solution
              global.__PRELOADED_DATA__ = data;
            } catch (error) {
              console.error("Error setting preloaded data:", error);
            }
          }}
        />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#FFD700',
          tabBarInactiveTintColor: '#FFD700',
          tabBarStyle: {
            backgroundColor: '#000000',
            paddingBottom: 5,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            headerShown: false,
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={25} />
            ),
          }}
        />
        <Tabs.Screen
          name="sons"
          options={{
            headerShown: false,
            title: 'Sons of John Chi',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'people' : 'people-outline'} color={color} size={25} />
            ),
          }}
        />
        <Tabs.Screen
          name="live"
          options={{
            headerShown: false,
            title: ' live',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'play-circle' : 'play-circle-outline'} color={color} size={30} />
            ),
          }}
        />
        <Tabs.Screen
          name="devotions"
          options={{
            headerShown: false,
            title: 'Devotions',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'book' : 'book-outline'} color={color} size={30} />
            ),
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}
