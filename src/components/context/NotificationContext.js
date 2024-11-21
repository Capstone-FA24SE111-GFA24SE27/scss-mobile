import React, {
  createContext,
  useEffect,
  useRef,
  useContext,
  useState,
} from "react";
import * as Notifications from "expo-notifications";
import { AuthContext } from "./AuthContext";
import { SocketContext } from "./SocketContext";
import axiosJWT, { BASE_URL } from "../../config/Config";
import { AppState } from "react-native";
import Toast from "react-native-toast-message";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const appStateListener = AppState.addEventListener(
      "change",
      (nextAppState) => {
        setAppState(nextAppState);
      }
    );

    return () => {
      appStateListener.remove();
    };
  }, []);

  // console.log(appState);
  const markAsRead = async (notificationId, item) => {
    try {
      console.log("Marking as read - Noti ID: ", notificationId, "Item:", item);
      const response = await axiosJWT.put(
        `${BASE_URL}/notification/read/${notificationId}`
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
          text2: result.message || "Failed to mark this notification as read.",
          onPress: () => {
            Toast.hide();
          },
        });
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to mark this notification as read.",
        onPress: () => {
          Toast.hide();
        },
      });
      console.log("Error marking this notification as read:", err);
    }
  };

  const fetchNotifications = async (page = 1) => {
    try {
      const notiRes = await axiosJWT.get(`${BASE_URL}/notification`, {
        params: {
          page: page,
        },
      });
      // console.log("Notification List: ", notiRes.data);
      const notiData = notiRes.data;
      if (notiData && notiData.status === 200) {
        // setNotifications(notiData.content.data);
        const newNotifications = notiData.content.data;
        setNotifications((prevNotifications) => {
          // Combine old and new notifications, filtering duplicates
          const uniqueNotifications = [
            ...prevNotifications,
            ...newNotifications.filter(
              (newItem) =>
                !prevNotifications.some(
                  (prevItem) =>
                    prevItem.notificationId === newItem.notificationId
                )
            ),
          ];
          return uniqueNotifications;
        });
        setTotalPages(notiData.content.totalPages);
        setCurrentPage(page);
        notiData.content.data.forEach((notification) => {
          if (appState === "background") {
            Notifications.scheduleNotificationAsync({
              content: {
                title: notification.title || "New Notification",
                body: notification.message || "You have a new notification.",
              },
              trigger: null,
            });
          }
        });
      } else {
        console.log(notiData.message || "Failed to fetch notifications");
      }
    } catch (err) {
      console.log(err.message || "Failed to fetch notifications");
    }
  };

  const loadMoreNotifications = async () => {
    if (currentPage < totalPages) {
      setLoading(true);
      await fetchNotifications(currentPage + 1);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData?.id) {
      setNotifications([]);
      setCurrentPage(1);
      setTotalPages(1);
      fetchNotifications();

      if (socket) {
        socket.on(
          `/user/${userData?.id}/private/notification`,
          async (data) => {
            try {
              // await fetchNotifications();
              setNotifications((prevNotifications) => {
                if (
                  !prevNotifications.some(
                    (item) => item.notificationId === data.notificationId
                  )
                ) {
                  return [data, ...prevNotifications];
                }
                return prevNotifications;
              });
              // setNotifications((prevNotifications) => [data, ...prevNotifications]);
              if (appState === "background") {
                Notifications.scheduleNotificationAsync({
                  content: {
                    title: data.title || "New Notification",
                    body:
                      data.message || "You have received a new notification.",
                  },
                  trigger: null,
                });
              }
              Toast.show({
                type: "success",
                text1: data.title,
                text2: data.message,
                onPress: () => {
                  Toast.hide();
                  markAsRead(data.notificationId, data);
                  navigationRef.current?.navigate("NotificationDetail", {
                    notificationData: data,
                    prevScreen: navigationRef.current?.getCurrentRoute().name,
                  });
                },
              });
            } catch (error) {
              console.error("Error parsing notification:", error);
            }
          }
        );
      }
    }

    return () => {
      if (socket) {
        // socket.off(`/user/${userData?.id}/private/notification`); // Xóa lắng nghe thông báo từ socket
      }
    };
  }, [userData, socket, appState]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        fetchNotifications,
        loadMoreNotifications,
        loading,
        currentPage,
        totalPages,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
