import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../Context/AuthContext"; // Adjust the path as necessary
import io from "socket.io-client"; // Import Socket.IO client

export default function Notification() {
  const navigation = useNavigation();
  const { isLogin, userData, session } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socket = useRef(null);

  useEffect(() => {
    if (!isLogin || !userData || !session) {
      navigation.navigate("Login");
      return;
    }

    const connectSocketIO = () => {
      // Replace the WebSocket URL with your Socket.IO server URL
      socket.current = io(`ws://192.168.0.150:8080/ws`, {
        transports: ['websocket'],
      });

      socket.current.on("connect", () => {
        console.log("Socket.IO connection established");
        setLoading(false);

        // Subscribe to the user's private notification topic
        socket.current.emit("subscribe", {
          topic: `/user/${userData.accountId}/private/notification`,
        });
      });

      socket.current.on("notification", (data) => {
        try {
          const notification = JSON.parse(data);

          // Update the notifications array with the new notification
          setNotifications((prevNotifications) => [
            notification,
            ...prevNotifications,
          ]);
        } catch (error) {
          console.error("Error parsing notification:", error);
          setError("Failed to parse notification");
        }
      });

      socket.current.on("connect_error", (err) => {
        console.error("Socket.IO connection error:", err.message);
        setError(`Socket.IO connection error: ${err.message}`);
      });

      socket.current.on("disconnect", (reason) => {
        console.log("Socket.IO disconnected:", reason);
        setError("Socket.IO connection closed unexpectedly.");
        // Attempt to reconnect
        setTimeout(connectSocketIO, 3000);
      });
    };

    connectSocketIO();

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [isLogin, userData, session, navigation]);

  const renderItem = React.useCallback(({ item }) => {
    if (!item) {
      return (
        <View style={styles.notificationItem}>
          <Text>No notification data available.</Text>
        </View>
      );
    }
    try {
      return (
        <TouchableOpacity
          style={{
            flexDirection: "row",
            paddingVertical: 12,
            paddingHorizontal: 16,
            backgroundColor: item.unread ? "#ffe4ec" : "transparent",
          }}
        >
          <Image
            source={{ uri: item.avatar }}
            style={{ width: 50, height: 50, borderRadius: 30, marginRight: 16 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>{item.name}</Text>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 16,
                color: item.unread ? "black" : "gray",
                marginTop: 4,
              }}
            >
              {item.message}
            </Text>
          </View>
          <Text style={{ fontSize: 14, color: "gray" }}>{item.time}</Text>
        </TouchableOpacity>
      );
    } catch (error) {
      console.error("Error rendering notification:", error);
      return (
        <View style={styles.notificationItem}>
          <Text>Error displaying notification.</Text>
        </View>
      );
    }
  }, []);

  const markAllAsRead = () => {
    // Implement functionality to mark all notifications as read
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#F39300" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => navigation.navigate("Home")}>
            <Ionicons name="return-up-back" size={36} />
          </Pressable>
        </View>
        <View style={styles.headerCenter} />
        <View style={styles.headerRight} />
      </View>
      <View style={styles.titleBar}>
        <Text style={styles.title}>Notification</Text>
        <TouchableOpacity onPress={markAllAsRead}>
          <Text style={styles.markAllRead}>Mark all as read</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.tabBar}>
        <Text style={styles.tabActive}>All</Text>
        <Text style={styles.tab}>Unread</Text>
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#f5f7fd", flex: 1 },
  header: {
    flexDirection: "row",
    paddingHorizontal: 30,
    paddingTop: 25,
    paddingVertical: 10,
  },
  headerLeft: { flex: 1, alignItems: "flex-start" },
  headerCenter: { flex: 2, alignItems: "center" },
  headerRight: { flex: 1 },
  titleBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 25,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e3e3e3",
  },
  title: { color: "black", fontWeight: "bold", fontSize: 20 },
  markAllRead: { color: "#F39300", fontWeight: "600", fontSize: 18 },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e3e3e3",
  },
  tabActive: {
    fontSize: 18,
    color: "white",
    paddingVertical: 4,
    paddingHorizontal: 20,
    fontWeight: "600",
    backgroundColor: "#F39300",
    borderRadius: 10,
  },
  tab: { fontSize: 18, color: "gray", paddingVertical: 4, paddingHorizontal: 12 },
  notificationItem: {
    padding: 10,
    backgroundColor: "#f5f7fd",
  },
  centeredContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
