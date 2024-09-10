import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Notification() {
  const navigation = useNavigation();
  const notifications = [
    {
      id: "1",
      name: "Dr. Sam Wilkinson",
      time: "3 min ago",
      message:
        "Hey tom! I was just wondering if you have had time to go over the new revisions for the upco...",
      avatar: "https://randomuser.me/api/portraits/women/1.jpg",
      unread: true,
    },
    {
      id: "2",
      name: "Ms. Sonja Schaden",
      time: "1 hour ago",
      message:
        "Did you end up getting the approval for the new direction on the merger?",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
      unread: true,
    },
    {
      id: "3",
      name: "Keith Morissette",
      time: "5 hours ago",
      message:
        "I couldn’t help myself and I went and ordered 10,000 plastic toys of your lordship.",
      avatar: "https://randomuser.me/api/portraits/men/3.jpg",
      unread: false,
    },
    {
      id: "4",
      name: "Dr. Sam Milkson",
      time: "5 hours ago",
      message:
        "Hey man! I was just wondering if you have had time to go over the new revisions for the upco...",
      avatar: "https://randomuser.me/api/portraits/men/5.jpg",
      unread: false,
    },
    {
      id: "5",
      name: "Ms. Noir Lamashek",
      time: "6 hours ago",
      message:
        "Did you end up getting the approval for the new direction on the merger?",
      avatar: "https://randomuser.me/api/portraits/women/4.jpg",
      unread: false,
    },
    {
      id: "6",
      name: "Mei Mei",
      time: "6 hours ago",
      message:
        "I might know myself and I went and ordered 10,000 plastic toys of your lordship.",
      avatar: "https://randomuser.me/api/portraits/women/3.jpg",
      unread: true,
    },
    {
      id: "7",
      name: "Dr. Man Wilkinson",
      time: "7 hours ago",
      message:
        "I was just wondering if you have had time to go over the new revisions for the upco...",
      avatar: "https://randomuser.me/api/portraits/men/7.jpg",
      unread: false,
    },
    {
      id: "8",
      name: "Ms. Moires Schaden",
      time: "1 day ago",
      message:
        "Did you end up getting the approval for the new direction on the merger?",
      avatar: "https://randomuser.me/api/portraits/women/10.jpg",
      unread: true,
    },
    {
      id: "9",
      name: "Kay Morissette",
      time: "2 days ago",
      message:
        "I couldn’t help myself and I went and ordered 10,000 plastic toys of your lordship.",
      avatar: "https://randomuser.me/api/portraits/men/8.jpg",
      unread: true,
    },
  ];

  const renderItem = ({ item }) => (
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
            color: item.unread === true ? "black" : "gray",
            marginTop: 4,
          }}
        >
          {item.message}
        </Text>
      </View>
      <Text style={{ fontSize: 14, color: "gray" }}>{item.time}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <View style={{ backgroundColor: "#f5f7fd", flex: 1 }}>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            paddingHorizontal: 30,
            paddingTop: 25,
            paddingVertical: 10,
          }}
        >
          <View style={{ flex: 1, alignItems: "flex-start" }}>
            <Pressable onPress={() => navigation.navigate("Home")}>
              <Ionicons name="return-up-back" size={36} />
            </Pressable>
          </View>
          <View style={{ flex: 2, alignItems: "center" }}>
            {/* <Text style={{ fontSize: 24, fontWeight: "bold" }}>
            Notifications
          </Text> */}
          </View>
          <View style={{ flex: 1 }} />
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 25,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: "#e3e3e3",
          }}
        >
          <Text style={{ color: "black", fontWeight: "bold", fontSize: 20 }}>
            Notification
          </Text>

          <TouchableOpacity>
            <Text style={{ color: "#F39300", fontWeight: "600", fontSize: 18 }}>
              Mark all as read
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: "#e3e3e3",
          }}
        >
          <Text
            style={{
              fontSize: 18,
              color: "white",
              paddingVertical: 4,
              paddingHorizontal: 20,
              fontWeight: "600",
              backgroundColor: "#F39300",
              borderRadius: 10,
            }}
          >
            All
          </Text>
          <Text
            style={{
              fontSize: 18,
              color: "gray",
              paddingVertical: 4,
              paddingHorizontal: 12,
            }}
          >
            Unread
          </Text>
        </View>
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </>
  );
}
