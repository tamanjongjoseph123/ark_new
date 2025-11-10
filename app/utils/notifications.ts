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
    const expoPushToken = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
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
  // This listener is called when a notification is received while the app is in the foreground
  const notificationListener = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification received:', notification);
    const { title, body, data } = notification.request.content;
    
    // Handle navigation based on notification data
    if (data?.type === 'new_devotion') {
      navigation.navigate('Devotions');
    }
  });

  // This listener is called when a user taps on a notification
  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    const { data } = response.notification.request.content;
    
    if (data?.type === 'new_devotion') {
      navigation.navigate('Devotions');
    }
  });

  return () => {
    Notifications.removeNotificationSubscription(notificationListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
}
