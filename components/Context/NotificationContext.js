import React, {
  createContext,
  useEffect,
  useRef,
  useContext,
  useState,
} from "react";
import io from "socket.io-client";
import * as Notifications from 'expo-notifications';
import { AuthContext } from "./AuthContext"; // Sử dụng AuthContext để lấy thông tin người dùng
import { SocketContext } from "./SocketContext";
import axiosJWT, { BASE_URL } from "../../config/Config";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { userData, session } = useContext(AuthContext); // Lấy thông tin người dùng từ AuthContext
  const socket = useContext(SocketContext);
  const [notifications, setNotifications] = useState([]);



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
            // Trigger local notification for each new item fetched from the API
            result.content.data.forEach(notification => {
              Notifications.scheduleNotificationAsync({
                content: {
                  title: notification.title || 'New Notification',
                  body: notification.message || 'You have a new notification.',
                },
                trigger: null, // Show notification immediately
              });
            });
          } else {
            console.log(result.message || 'Failed to fetch notifications');
          }
        } catch (err) {
          console.log(err.message || 'Failed to fetch notifications');
        }
      };

      fetchNotifications();

      console.log(
        "///////////////////////NotificationContext" + userData?.id
      );

      if (socket) {
        console.log(
          "///////////////////////NotificationContext" + userData?.id
        );
        console.log(`/user/${userData?.id}/private/notification`)
        socket.on(`/user/${userData?.id}/private/notification`, (data) => {
          try {
            setNotifications((prevNotifications) => [data, ...prevNotifications]);

            // Trigger a local notification for the new socket data
            Notifications.scheduleNotificationAsync({
              content: {
                title: data.title || 'New Notification',
                body: data.message || 'You have received a new notification.',
              },
              trigger: null, // Show notification immediately
            });
          } catch (error) {
            console.error("Error parsing notification:", error);
            setError("Failed to parse notification");
          }
        });
      }
    }

    return () => {
      if (socket) {
        socket.off(`/user/${userData?.id}/private/notification`); // Xóa lắng nghe thông báo từ socket
      }
    };
  }, [userData, socket]);

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

































