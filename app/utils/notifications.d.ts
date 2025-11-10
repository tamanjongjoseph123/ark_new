import { Subscription } from 'expo-modules-core';

declare function registerForPushNotifications(): Promise<string | null>;
declare function registerDeviceToken(token: string): Promise<any>;
declare function setupNotificationListeners(navigation: any): () => void;

export {
  registerForPushNotifications,
  registerDeviceToken,
  setupNotificationListeners
};
