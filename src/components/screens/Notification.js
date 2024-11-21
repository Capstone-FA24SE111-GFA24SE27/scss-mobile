import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import { NotificationContext } from "../context/NotificationContext";
import axiosJWT, { BASE_URL } from "../../config/Config";
import Toast from "react-native-toast-message";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";

export default function Notification() {
  const navigation = useNavigation();
  const { width, height } = Dimensions.get("screen");
  const { isLogin, userData, session } = useContext(AuthContext);
  // const socket = useContext(SocketContext);
  // const [notifications, setNotifications] = useState([]);
  const {
    notifications,
    setNotifications,
    loadMoreNotifications,
    loading,
    currentPage,
    totalPages,
  } = useContext(NotificationContext);
  // const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollViewRef = useRef(null);
  useFocusEffect(
    React.useCallback(() => {
      if (
        scrollViewRef.current &&
        notifications.filter(
          (notification) => notification.readStatus === false
        ).length >= 1
      ) {
        scrollViewRef.current.scrollToOffset({ offset: 0, animated: false });
      }
    }, [])
  );
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
    console.log("/" + userData?.id);
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
        // Cập nhật tất cả thông báo thành đã đọc trong UI
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) => ({
            ...notification,
            readStatus: true,
          }))
        );
        if (
          notifications?.filter(
            (notification) => notification.readStatus == false
          ).length > 0
        ) {
          Toast.show({
            type: "info",
            text1: "Mark All Read",
            text2: `You have read ${
              notifications?.filter(
                (notification) => notification.readStatus == false
              ).length
            } notification(s)`,
            onPress: () => {
              Toast.hide();
            },
          });
        }
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to mark all notifications as read.",
        });
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "An error occurred while marking all notifications as read.",
        onPress: () => {
          Toast.hide();
        },
      });
      console.lpg("Error marking all notifications as read:", err);
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
        // Cập nhật trạng thái trên UI
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification.notificationId === notificationId
              ? { ...notification, readStatus: true }
              : notification
          )
        );
        // Điều hướng và truyền dũ liệu sang detail
        navigation.navigate("NotificationDetail", { notificationData: item });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: result.message || "Failed to mark all notifications as read.",
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
  const renderItem = React.useCallback(({ item, index }) => {
    if (!item) {
      return (
        <View
          style={{
            backgroundColor: "#ededed",
            padding: 12,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontStyle: "italic",
              fontWeight: "600",
              textAlign: "center",
              color: "gray",
              opacity: 0.7,
            }}
          >
            No notification data available.
          </Text>
        </View>
      );
    }

    try {
      return (
        <TouchableOpacity
          key={index}
          onPress={() => markAsRead(item.notificationId, item)}
          style={{
            flexDirection: "row",
            backgroundColor: item.readStatus ? "#e0e0e0" : "#fdfdfd",
            padding: 12,
            marginBottom: 12,
            borderRadius: 10,
            elevation: 1,
            borderWidth: 1.5,
            borderColor: "#e3e3e3",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                maxWidth: "90%",
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
                marginVertical: 4,
              }}
            >
              {item.message}
            </Text>
            <View>
              <Text
                style={{
                  fontSize: 16,
                  fontStyle: "italic",
                  fontWeight: "600",
                  textAlign: "right",
                  color: "gray",
                  opacity: 0.7,
                }}
              >
                {formatDistanceToNow(new Date(item.createdDate), {
                  addSuffix: true,
                })}
              </Text>
            </View>
          </View>

          <View
            style={{
              position: "absolute",
              top: 12,
              right: 12,
            }}
          >
            {item.readStatus ? (
              <Ionicons name="checkmark-done" size={24} color="gray" />
            ) : (
              <Animated.View
                style={{
                  opacity: blinking,
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
    } catch (err) {
      console.log("Error rendering notification:", err);
      return (
        <View
          style={{
            backgroundColor: "#ededed",
            padding: 12,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontStyle: "italic",
              fontWeight: "600",
              textAlign: "center",
              color: "gray",
              opacity: 0.7,
            }}
          >
            Error displaying notification.
          </Text>
        </View>
      );
    }
  }, []);

  const handleEndReached = () => {
    if (currentPage < totalPages) {
      loadMoreNotifications();
    }
  };

  if (error) {
    return (
      <View
        style={{
          backgroundColor: "#ededed",
          padding: 12,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontStyle: "italic",
            fontWeight: "600",
            textAlign: "center",
            color: "gray",
            opacity: 0.7,
          }}
        >
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: "#f5f7fd", flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 30,
          paddingTop: height * 0.035,
          paddingBottom: 10,
        }}
      >
        <TouchableOpacity
          hitSlop={30}
          onPress={() => navigation.navigate("Home")}
        >
          <Ionicons name="return-up-back" size={36} />
        </TouchableOpacity>
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 24,
            flex: 3,
            textAlign: "center",
          }}
        >
          Notifications
        </Text>
        <TouchableOpacity hitSlop={30} onPress={markAllAsRead}>
          <MaterialIcons name="done-all" size={36} color="#F39300" />
        </TouchableOpacity>
      </View>
      <View style={{ paddingHorizontal: 30, paddingBottom: 80 }}>
        {notifications.length === 0 && (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginTop: height * 0.1,
            }}
          >
            {/* <Text style={{ fontWeight: "bold", fontSize: 18 }}>
              You don't have no notifications right now
            </Text> */}
            <Image
              source={{
                uri: "https://img.freepik.com/premium-vector/modern-design-concept-no-notification-found-design_637684-237.jpg?semt=ais_hybrid",
              }}
              style={{
                width: width * 0.85,
                height: height * 0.6,
                resizeMode: "cover",
              }}
            />
          </View>
        )}
        <FlatList
          ref={scrollViewRef}
          data={notifications}
          keyExtractor={(item, index) => index + item.notificationId.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          onEndReached={() => handleEndReached()}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() =>
            loading ? (
              <View style={{ padding: 16 }}>
                <ActivityIndicator size={40} color="#F39300" />
              </View>
            ) : null
          }
        />
      </View>
    </View>
  );
}
