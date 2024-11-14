import React, { useEffect } from "react";
import { StyleSheet, Platform, Alert } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./src/components/context/AuthContext";
import { SocketProvider } from "./src/components/context/SocketContext";
import Navigation from "./src/components/routes/Navigation";
import * as Notifications from "expo-notifications";
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
import {
  NotificationContext,
  NotificationProvider,
} from "./src/components/context/NotificationContext";
import Toast, { BaseToast, InfoToast, ErrorToast } from "react-native-toast-message";
import axiosJWT, { BASE_URL } from "./src/config/Config";
import axios from "axios"; // Ensure axios is imported
import { ChatProvider } from "./src/components/context/ChatContext";
import { navigationRef } from "./src/components/context/NavigationContext";
import { CounselingProfileProvider } from "./src/components/context/CounselingProfileContext";
export default function App() {
  const toastConfig = {
    success: (props) => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: "#07bc0c",
          borderLeftWidth: 12,
          backgroundColor: "white",
          borderRadius: 10,
          width: "90%",
          height: 90,
        }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
        text1Style={{ fontSize: 20, color: "#07bc0c", fontWeight: "bold" }}
        text2Style={{
          fontSize: 16,
          fontWeight: "600",
          color: "#333",
          opacity: 0.85,
        }}
        text2NumberOfLines={2}
        onPress={() => Toast.hide()}
      />
    ),

    info: (props) => (
      <InfoToast
        {...props}
        style={{
          borderLeftColor: "#3498db",
          borderLeftWidth: 12,
          backgroundColor: "white",
          borderRadius: 10,
          width: "90%",
          height: 90,
        }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
        text1Style={{ fontSize: 20, color: "#3498db", fontWeight: "bold" }}
        text2Style={{
          fontSize: 16,
          fontWeight: "600",
          color: "#333",
          opacity: 0.85,
        }}
        text2NumberOfLines={2}
        onPress={() => Toast.hide()}
      />
    ),

    error: (props) => (
      <ErrorToast
        {...props}
        style={{
          borderLeftColor: "#e74c3c",
          borderLeftWidth: 12,
          backgroundColor: "white",
          borderRadius: 10,
          width: "90%",
          height: 90,
        }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
        text1Style={{ fontSize: 20, color: "#e74c3c", fontWeight: "bold" }}
        text2Style={{
          fontSize: 16,
          fontWeight: "600",
          color: "#333",
          opacity: 0.85,
        }}
        text2NumberOfLines={2}
        onPress={() => Toast.hide()}
      />
    ),
  };

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  useEffect(() => {
    registerForPushNotificationsAsync();

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    // Lắng nghe khi nhận thông báo
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification Received: ", notification);
      }
    );

    return () => subscription.remove();
  }, []);

  async function registerForPushNotificationsAsync() {
    let token;
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        Alert.alert("Failed to get push token for push notification!");
        return;
      }
      // Make sure the app is running on a physical device
      if (!Platform.isDevice) {
        // Alert.alert('Must use a physical device for push notifications');
        return;
      }
      // Add projectId when calling getExpoPushTokenAsync
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: "4d87a268-75a2-4c86-9068-3c5a158afec6", // Replace with your actual projectId
        })
      ).data;
      if (!token) {
        Alert.alert("Failed to retrieve Expo push token.");
      } else {
        console.log("Expo Push Token:", token);
        // Send the push token to your server
        sendPushTokenToServer(token);
      }
    } catch (error) {
      console.error("Error getting push token:", error);
    }
    return token;
  }

  async function sendPushTokenToServer(token) {
    try {
      const response = await axios.post(`${BASE_URL}/save-push-token`, {
        token,
      });
      console.log("Push token sent to server successfully:", response.data);
    } catch (error) {
      console.error("Failed to send token to server:", error);
    }
  }

  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <CounselingProfileProvider>
          <ChatProvider>
            <SafeAreaProvider>
              <NavigationContainer ref={navigationRef} style={{ flex: 1 }}>
                <Navigation />
                <Toast config={toastConfig} />
              </NavigationContainer>
            </SafeAreaProvider>
          </ChatProvider>
          </CounselingProfileProvider>
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
