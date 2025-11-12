import { Stack } from 'expo-router';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';
import { NewDevotionProvider } from './context/NewDevotionContext';
import { AuthProvider } from './Contexts/AuthContext';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen after a short delay to ensure proper initialization
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <NewDevotionProvider>
        <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false, // This will hide the header for all screens by default
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
          <Stack.Screen name="addItem" options={{ headerShown: false }} />
          <Stack.Screen name="addFeature" options={{ headerShown: false }} />
          <Stack.Screen name="Profile" options={{ headerShown: false }} />
          <Stack.Screen name="ItemDetail/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="DetailScreen/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="Archive" options={{ headerShown: false }} />
          <Stack.Screen name="Projects" options={{ headerShown: false }} />
          <Stack.Screen name="soon" options={{ headerShown: false }} />
          <Stack.Screen name="chat" options={{ headerShown: false }} />
          <Stack.Screen name="hymns" options={{ headerTitle: 'Hymns' }} />
          <Stack.Screen name="Archives" options={{ headerShown: true }} />
          <Stack.Screen name="prayer-request" options={{ headerShown: true }} />
          <Stack.Screen name="sermons" options={{ headerShown: true }} />
          <Stack.Screen name="events" options={{ headerShown: true }} />
          <Stack.Screen name="hymn-details" options={{ headerShown: true }} />
          <Stack.Screen name="praise-and-worship" options={{ headerShown: false }} />
          <Stack.Screen name="testimonies" options={{ headerShown: true }} />
          <Stack.Screen name="prophecy" options={{ headerShown: true }} />
          <Stack.Screen name="crusades" options={{ headerShown: true }} />
          <Stack.Screen name="lounge" options={{ headerTitle: "Partner's Portal" }} />
          <Stack.Screen name="quotes" options={{ headerTitle: "Inspirational quotes" }} />
          <Stack.Screen name="video-details" options={{ headerTitle: "Video Details" }} />
          <Stack.Screen name="mentorcourses" options={{ headerTitle: "MentorShip Courses" }} />
          <Stack.Screen name="video-details-two" options={{ headerTitle: "Course Details" }} />
        </Stack>
        </View>
      </NewDevotionProvider>
    </AuthProvider>
  );
}
