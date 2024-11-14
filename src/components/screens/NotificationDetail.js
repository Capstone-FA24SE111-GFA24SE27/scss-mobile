import React from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function NotificationDetail({ route }) {
  const { notificationData } = route.params; // Data passed from Notification component
  const prevScreen = route.params.prevScreen;
  const navigation = useNavigation();
  const { width, height } = Dimensions.get("screen");
  // Convert createdDate to a human-readable format
  const formattedDate = new Date(
    notificationData?.createdDate
  ).toLocaleString();

  return (
    <View style={{ backgroundColor: "#f5f7fd", flex: 1 }}>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          paddingHorizontal: 30,
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
            {/* No. {notificationData?.notificationId}  */}
            {/* Detail */}
          </Text>
        </View>
        <View style={{ flex: 1 }} />
      </View>
      <View style={{ paddingHorizontal: 30 }}>
        <View
          style={{
            backgroundColor: "white",
            padding: 20,
            borderRadius: 10,
            borderWidth: 1.5,
            borderColor: "#e3e3e3",
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
            <Ionicons name="person-outline" size={22} color="#F39300" />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#333",
                marginLeft: 10,
              }}
            >
              Sender:
            </Text>
          </View>
          <Text style={{ fontSize: 16, color: "#555", marginLeft: 35 }}>
            {notificationData?.sender}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 20,
              marginBottom: 8,
            }}
          >
            <Ionicons
              name="information-circle-outline"
              size={22}
              color="#F39300"
            />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#333",
                marginLeft: 10,
              }}
            >
              Title:
            </Text>
          </View>
          <Text style={{ fontSize: 16, color: "#555", marginLeft: 35 }}>
            {notificationData?.title}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 20,
              marginBottom: 8,
            }}
          >
            <Ionicons name="calendar-outline" size={22} color="#F39300" />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#333",
                marginLeft: 10,
              }}
            >
              Date:
            </Text>
          </View>
          <Text style={{ fontSize: 16, color: "#555", marginLeft: 35 }}>
            {formattedDate}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: "white",
            padding: 20,
            borderRadius: 15,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 5,
            borderWidth: 1,
            borderColor: "#e3e3e3",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Ionicons name="mail-outline" size={22} color="#F39300" />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#333",
                marginLeft: 10,
              }}
            >
              Message:
            </Text>
          </View>
          <Text
            style={{
              fontSize: 16,
              color: "#555",
              lineHeight: 22, // Slightly increased line height for better readability
              marginLeft: 35,
            }}
          >
            {notificationData?.message}
          </Text>
        </View>
      </View>
    </View>
  );
}
