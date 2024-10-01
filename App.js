import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { AuthProvider } from './components/Context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { SocketProvider } from './components/Context/SocketContext';
import Navigation from './components/Navigation/Navigation';
import { NotificationContext, NotificationProvider } from './components/Context/NotificationContext';
import * as Notifications from 'expo-notifications';



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

    // Lắng nghe khi nhận thông báo
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification Received: ', notification);
    });

    return () => subscription.remove();
  }, []);

  async function registerForPushNotificationsAsync() {
    let token;
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Expo Push Token:', token);

    // Gửi push token lên server
    sendPushTokenToServer(token);

    return token;
  }

  async function sendPushTokenToServer(token) {
    try {
      await axios.post(`${BASE_URL}/save-push-token`, { token });
      console.log('Push token sent to server successfully');
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});