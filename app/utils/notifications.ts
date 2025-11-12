import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configure how notifications are handled when the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications() {
  try {
    console.log('Checking notification permissions...');
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      console.log('Requesting notification permissions...');
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log('Permission request result:', status);
    } else {
      console.log('Notification permission already granted');
    }
    
    if (finalStatus !== 'granted') {
      console.error('Failed to get push token: Permission not granted');
      return null;
    }
    
    console.log('Fetching Expo push token...');
    // Using hardcoded project ID for reliability
    const expoPushToken = await Notifications.getExpoPushTokenAsync({
      projectId: '340de50d-477f-40d8-b8a7-a6a1a0dd33f6',
    });
    
    const token = expoPushToken.data;
    console.log('Successfully obtained push token:', token);
    return token;
  } catch (error) {
    console.error('Error in registerForPushNotifications:', error);
    return null;
  }
}

import { BASE_URL } from '../base_url';

export async function registerDeviceToken(token: string) {
  if (!token) {
    console.error('No token provided to registerDeviceToken');
    throw new Error('No device token provided');
  }

  const url = `${BASE_URL}/api/notifications/register-device/`;
  console.log('Registering device token at URL:', url);
  console.log('Token to register:', token);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
    
    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      console.error('Failed to parse JSON response:', responseText);
      throw new Error(`Invalid JSON response: ${responseText}`);
    }
    
    if (!response.ok) {
      console.error('Failed to register device token:', {
        status: response.status,
        statusText: response.statusText,
        response: responseData,
      });
      throw new Error(`Failed to register device token: ${response.status} ${response.statusText}`);
    }
    
    console.log('Device token registration successful:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error in registerDeviceToken:', error);
    throw error;
  }
}

export function setupNotificationListeners(navigation: any) {
  console.log('Setting up notification listeners...');
  
  // This listener is called when a notification is received while the app is in the foreground
  const notificationListener = Notifications.addNotificationReceivedListener(notification => {
    const { title, body, data } = notification.request.content;
    
    console.log('=== NOTIFICATION RECEIVED ===');
    console.log('Title:', title);
    console.log('Body:', body);
    console.log('Data:', JSON.stringify(data, null, 2));
    console.log('Notification object:', JSON.stringify(notification, null, 2));
    
    // Handle navigation based on notification data
    if (data?.type === 'new_devotion') {
      console.log('New devotion notification detected, navigating to Devotions...');
      navigation.navigate('Devotions');
    } else {
      console.log('Notification is not a devotion notification or missing type');
    }
  });

  // This listener is called when a user taps on a notification
  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    const { data } = response.notification.request.content;
    
    console.log('=== NOTIFICATION TAPPED ===');
    console.log('Notification data:', JSON.stringify(data, null, 2));
    
    if (data?.type === 'new_devotion') {
      console.log('Tapped devotion notification, navigating to Devotions...');
      navigation.navigate('Devotions');
    } else {
      console.log('Tapped notification is not a devotion notification');
    }
  });
  
  console.log('Notification listeners successfully set up');

  return () => {
    Notifications.removeNotificationSubscription(notificationListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
}
