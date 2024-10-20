import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext"; // Import SocketContext
import { NotificationContext } from "../context/NotificationContext";
import axiosJWT, { BASE_URL } from "../../config/Config";
import Toast from "react-native-toast-message";

export default function Notification() {
  const navigation = useNavigation();
  const { isLogin, userData, session } = useContext(AuthContext);
  // const socket = useContext(SocketContext);
  // const [notifications, setNotifications] = useState([]);
  const { notifications, setNotifications } = useContext(NotificationContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const blinking = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinking, {
          toValue: 0.5,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(blinking, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(blinking, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (!isLogin || !userData || !session) {
      navigation.navigate("Login");
      return;
    }

    // Lấy thông báo từ server khi component render

    console.log("///////////////////////" + userData?.id);

    // console.log(notifications)

    // Dọn dẹp socket khi component bị unmount
    return () => {};
  }, [isLogin, userData, session, navigation]);

  // Đánh dấu tất cả thông báo là đã đọc
  const markAllAsRead = async () => {
    try {
      const response = await axiosJWT.put(
        `${BASE_URL}/notification/mark-all-read`,
        {}
      );

      const result = response.data;

      if (result && result.status === 200) {
        // Hiển thị thông báo thành công từ API
        // Alert.alert("Success", result.message);

        // Cập nhật tất cả thông báo thành đã đọc trong UI
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) => ({
            ...notification,
            readStatus: true,
          }))
        );
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to mark all notifications as read.",
          onPress: () => {
            Toast.hide();
          },
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "An error occurred while marking all notifications as read.",
        onPress: () => {
          Toast.hide();
        },
      });
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Đánh dấu một thông báo là đã đọc
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
        // Hiển thị thông báo thành công từ API
        // Alert.alert("Success", result.message);

        // Cập nhật trạng thái trong UI
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification.notificationId === notificationId
              ? { ...notification, readStatus: true }
              : notification
          )
        );
        //điều hướng sang detail
        //truyền dũ liệu sang detail
        navigation.navigate("NotificationDetail", { notificationData: item });
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

  // Render thông báo
  const renderItem = React.useCallback(({ item }) => {
    if (!item) {
      return (
        <View style={styles.notificationItem}>
          <Text>No notification data available.</Text>
        </View>
      );
    }

    // Thay đổi màu nền dựa trên trạng thái thông báo
    const backgroundColor = item.readStatus ? "#e0e0e0" : "#f9f9f9";

    try {
      return (
        <TouchableOpacity
          onPress={() => markAsRead(item.notificationId, item)} // Đánh dấu thông báo khi nhấn
          //truyền cả item
          style={{
            flexDirection: "row",
            paddingVertical: 12,
            paddingHorizontal: 16,
            backgroundColor: backgroundColor, // Màu nền thay đổi dựa trên trạng thái
            borderRadius: 12,
            marginBottom: 10,
            elevation: 1,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 5,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: item.readStatus ? "gray" : "black",
              }}
            >
              {item.title}
            </Text>
            <Text
              numberOfLines={2}
              style={{
                fontSize: 16,
                color: item.readStatus ? "gray" : "black",
                marginTop: 4,
              }}
            >
              {item.message}
            </Text>
          </View>
          <View style={styles.notificationStatus}>
            {item.readStatus ? (
              <Ionicons name="checkmark-done" size={24} color="gray" />
            ) : (
              <Animated.View
                style={{
                  opacity: blinking,
                  marginVertical: 4,
                }}
              >
                <View
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 20,
                    backgroundColor: "#F39300",
                  }}
                />
              </Animated.View>
            )}
          </View>
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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity hitSlop={30} onPress={() => navigation.navigate("Home")}>
            <Ionicons name="arrow-back-outline" size={30} color="#F39300" />
          </TouchableOpacity>
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
        <View style={styles.headerRight}>
          {/* Icon để đánh dấu tất cả thông báo là đã đọc */}
          <TouchableOpacity hitSlop={30} onPress={markAllAsRead}>
            <MaterialIcons name="done-all" size={30} color="#F39300" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab bar */}

      {/* Notifications List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.notificationId.toString()} // Sử dụng notificationId làm key
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
const { width, height } = Dimensions.get("screen");
const styles = StyleSheet.create({
  container: { backgroundColor: "#f5f7fd", flex: 1, paddingHorizontal: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: height * 0.035,
  },
  headerLeft: { flex: 1 },
  headerCenter: { flex: 3, alignItems: "center" },
  headerRight: { flex: 1, alignItems: "flex-end" },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#F39300" },

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
  tab: {
    fontSize: 18,
    color: "gray",
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  notificationStatus: {
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 10,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
