import React, { useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import { AuthProvider } from './components/Context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { SocketProvider } from './components/Context/SocketContext';
import Navigation from './components/Navigation/Navigation';
import { NotificationContext, NotificationProvider } from './components/Context/NotificationContext';
import * as Notifications from 'expo-notifications';
import axios from 'axios';  // Ensure axios is imported

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  useEffect(() => {
    registerForPushNotificationsAsync();

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification Received: ', notification);
    });

    return () => subscription.remove();
  }, []);

  async function registerForPushNotificationsAsync() {
    let token;
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert('Failed to get push token for push notification!');
        return;
      }

      // Make sure the app is running on a physical device
      if (!Platform.isDevice) {
        // Alert.alert('Must use a physical device for push notifications');
        return;
      }

      // Add projectId when calling getExpoPushTokenAsync
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: '4d87a268-75a2-4c86-9068-3c5a158afec6',  // Replace with your actual projectId
      })).data;

      if (!token) {
        Alert.alert('Failed to retrieve Expo push token.');
      } else {
        console.log('Expo Push Token:', token);

        // Send the push token to your server
        sendPushTokenToServer(token);
      }
    } catch (error) {
      console.error('Error getting push token:', error);
    }

    return token;
  }

  async function sendPushTokenToServer(token) {
    try {
      const response = await axios.post(`${BASE_URL}/save-push-token`, { token });
      console.log('Push token sent to server successfully:', response.data);
    } catch (error) {
      console.error('Failed to send token to server:', error);
    }
  }

  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <SafeAreaProvider>
            <NavigationContainer style={{ flex: 1 }}>
              <Navigation />
            </NavigationContainer>
          </SafeAreaProvider>
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
