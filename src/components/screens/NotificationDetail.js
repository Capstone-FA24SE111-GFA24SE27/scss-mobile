import React from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function NotificationDetail({ route }) {
  const { notificationData } = route.params;
  const prevScreen = route.params.prevScreen;
  const navigation = useNavigation();
  const { width, height } = Dimensions.get("screen");

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    const hour = d.getHours();
    const minute = d.getMinutes();
    return `${year}-${month}-${day}, ${hour}:${minute}`;
  };

  return (
    <View style={{ backgroundColor: "#f5f7fd", flex: 1 }}>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          paddingHorizontal: 20,
          paddingTop: height * 0.035,
          paddingVertical: 10,
        }}
      >
        <View style={{ flex: 1, alignItems: "flex-start" }}>
          <TouchableOpacity
            onPress={() => navigation.navigate(prevScreen || "Notification")}
          >
            <Ionicons name="return-up-back" size={36} />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 2, alignItems: "center" }}>
          <Text style={{ fontSize: 24, fontWeight: "bold" }}>
            {/* Notifcation No.{notificationData?.notificationId} */}
            Content
          </Text>
        </View>
        <View style={{ flex: 1 }} />
      </View>
      <View style={{ paddingHorizontal: 20 }}>
        <View
          style={{
            backgroundColor: "white",
            padding: 20,
            borderRadius: 10,
            borderWidth: 1.5,
            borderColor: "#e3e3e3",
            elevation: 1,
            marginBottom: 20,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Ionicons name="person-outline" size={24} color="#F39300" />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#F39300",
                marginLeft: 10,
              }}
            >
              Sender
            </Text>
          </View>
          <Text
            style={{
              fontSize: 16,
              color: "#333",
              marginLeft: 34,
              marginBottom: 8,
            }}
          >
            {notificationData?.sender}
          </Text>
          <View
            style={{
              height: 1,
              backgroundColor: "#e3e3e3",
              marginVertical: 10,
            }}
          />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Ionicons
              name="information-circle-outline"
              size={24}
              color="#F39300"
            />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#F39300",
                marginLeft: 10,
              }}
            >
              Title
            </Text>
          </View>
          <Text
            style={{
              fontSize: 16,
              color: "#333",
              marginLeft: 34,
              marginBottom: 8,
            }}
          >
            {notificationData?.title}
          </Text>

          <View
            style={{
              height: 1,
              backgroundColor: "#e3e3e3",
              marginVertical: 10,
            }}
          />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Ionicons name="calendar-outline" size={24} color="#F39300" />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#F39300",
                marginLeft: 10,
              }}
            >
              Sent At
            </Text>
          </View>
          <Text style={{ fontSize: 16, color: "#333", marginLeft: 34 }}>
            {formatDate(notificationData?.createdDate)}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: "white",
            padding: 20,
            borderRadius: 10,
            borderWidth: 1.5,
            borderColor: "#e3e3e3",
            elevation: 1,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Ionicons name="mail-outline" size={24} color="#F39300" />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#F39300",
                marginLeft: 10,
              }}
            >
              Message
            </Text>
          </View>
          <Text
            style={{
              fontSize: 16,
              color: "#333",
              marginLeft: 34,
              lineHeight: 24,
            }}
          >
            {notificationData?.message}
          </Text>
        </View>
      </View>
    </View>
  );
}
