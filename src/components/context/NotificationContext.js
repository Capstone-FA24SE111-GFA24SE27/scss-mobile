import React, {
  createContext,
  useEffect,
  useRef,
  useContext,
  useState,
} from "react";
import io from "socket.io-client";
import * as Notifications from 'expo-notifications';
import { AuthContext } from "./AuthContext";
import { SocketContext } from "./SocketContext";
import axiosJWT, { BASE_URL } from "../../config/Config";
import { AppState } from "react-native";
import Toast from 'react-native-toast-message';
import { navigationRef } from "./NavigationContext";

export const NotificationContext = createContext();

// export const navigationRef = createNavigationContainerRef();
// export function navigate = (name) => {
//   if (navigationRef.isReady()) {
//     navigationRef.navigate(name);
//   }
// };

export const NotificationProvider = ({ children }) => {
  const { userData } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const [notifications, setNotifications] = useState([]);
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const appStateListener = AppState.addEventListener("change", (nextAppState) => {
      setAppState(nextAppState);
    });

    return () => {
      appStateListener.remove();
    };
  }, []);

  console.log(appState)

  const markAsRead = async (notificationId, item) => {
    try {
      console.log(
        "Marking as read - Notification ID: ",
        notificationId,
        "Item:",
        item
      );
      const response = await axiosJWT.put(
        `${BASE_URL}/notification/read/${notificationId}`,
        {}
      );

      const result = response.data;

      if (result && result.status === 200) {
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification.notificationId === notificationId
              ? { ...notification, readStatus: true }
              : notification
          )
        );
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: result.message || "Failed to mark all notifications as read.",
          onPress: () => {
            Toast.hide();
          },
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "An error occurred while marking the notification as read.",
        onPress: () => {
          Toast.hide();
        },
      });
      console.error("Error marking notification as read:", error);
    }
  };

  useEffect(() => {
    if (userData?.id) {
      const fetchNotifications = async () => {
        try {
          const response = await axiosJWT.get(
            `${BASE_URL}/notification?SortDirection=DESC&sortBy=id`
          );
          console.log('API Response:', response.data);
          const result = response.data;

          if (result && result.status === 200) {
            setNotifications(result.content.data);
            result.content.data.forEach(notification => {
              if (appState === "background") {
                Notifications.scheduleNotificationAsync({
                  content: {
                    title: notification.title || 'New Notification',
                    body: notification.message || 'You have a new notification.',
                  },
                  trigger: null,
                });
              }
            });
          } else {
            console.log(result.message || 'Failed to fetch notifications');
          }
        } catch (err) {
          console.log(err.message || 'Failed to fetch notifications');
        }
      };

      fetchNotifications();

      if (socket) {
        socket.on(`/user/${userData?.id}/private/notification`, (data) => {
          try {
            setNotifications((prevNotifications) => [data, ...prevNotifications]);
            if (appState === "background") {
              Notifications.scheduleNotificationAsync({
                content: {
                  title: data.title || 'New Notification',
                  body: data.message || 'You have received a new notification.',
                },
                trigger: null,
              });
            }
            Toast.show({
              type: 'success',
              text1: data.title,
              text2: data.message,
              onPress: () => {
                Toast.hide();
                markAsRead(data.notificationId, data)
                navigationRef.current?.navigate("NotificationDetail", { notificationData: data, prevScreen: navigationRef.current?.getCurrentRoute().name });
              },
            });
          } catch (error) {
            console.error("Error parsing notification:", error);
          }
        });
      }
    }

    return () => {
      if (socket) {
        // socket.off(`/user/${userData?.id}/private/notification`); // Xóa lắng nghe thông báo từ socket
      }
    };
  }, [userData, socket, appState]);

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};









































































































