import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  Animated,
  TouchableOpacity,
} from "react-native";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../Context/AuthContext";
import axiosJWT, { BASE_URL } from "../../../config/Config";
import { SocketContext } from "../../Context/SocketContext";

export default function Personal() {
  const navigation = useNavigation();
  const { fetchProfile, profile, userData } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const scrollViewRef = useRef(null);
  useFocusEffect(
    React.useCallback(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
      }
      fetchRequestAllPages();
      fetchAppointmentAllPages();
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

  const [requestCount, setRequestCount] = useState(0);
  const [appoinmentCount, setAppointmentCount] = useState(0);

  useEffect(() => {
    socket.on(`/user/${userData?.id}/private/notification`, () => {
      fetchRequestAllPages();
      fetchAppointmentAllPages();
    });
  }, []);

  const fetchRequestAllPages = async () => {
    let page = 1;
    let totalWaitingItems = 0;
    let hasMorePages = true;

    try {
      while (hasMorePages) {
        const response = await axiosJWT.get(
          `${BASE_URL}/booking-counseling/appointment-request`,
          { params: { page: page } }
        );
        const { data, totalPages } = response?.data?.content;
        const waitingItems = data?.filter((item) => item.status === "WAITING");
        totalWaitingItems += waitingItems?.length;
        page += 1;
        hasMorePages = page <= totalPages;
      }
      setRequestCount(totalWaitingItems);
    } catch (error) {
      console.error("Error fetching pages:", error);
      setRequestCount(0);
    }
  };

  const fetchAppointmentAllPages = async () => {
    let page = 1;
    let totalWaitingItems = 0;
    let hasMorePages = true;

    try {
      while (hasMorePages) {
        const response = await axiosJWT.get(
          `${BASE_URL}/appointments/counselor`,
          { params: { page: page } }
        );
        const { data, totalPages } = response?.data?.content;
        const waitingItems = data?.filter((item) => item.status === "WAITING");
        totalWaitingItems += waitingItems?.length;
        page += 1;
        hasMorePages = page <= totalPages;
      }
      setAppointmentCount(totalWaitingItems);
    } catch (error) {
      console.error("Error fetching pages:", error);
      setAppointmentCount(0);
    }
  };

  return (
    <>
      <View style={{ backgroundColor: "#f5f7fd", flex: 1 }}>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            paddingHorizontal: 30,
            marginTop: 25,
            paddingVertical: 10,
          }}
        >
          <View style={{ flex: 1, alignItems: "flex-start" }} />
          <View style={{ flex: 2, alignItems: "center" }} />
          <View style={{ flex: 1 }} />
        </View>
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 20,
            elevation: 3,
            marginHorizontal: 30,
            paddingHorizontal: 12,
            paddingVertical: 8,
            justifyContent: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <Image
                source={{ uri: profile.avatarLink }}
                style={{ width: 50, height: 50, borderRadius: 25 }}
              />
              <View style={{ marginLeft: 20 }}>
                {profile && (
                  <Text style={{ fontSize: 22, fontWeight: "bold" }}>
                    {profile.fullName}
                  </Text>
                )}
                <View style={{ flexDirection: "row", alignItems: "center" }}>
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
                  <Text style={{ fontSize: 18, marginLeft: 8 }}>Online</Text>
                </View>
              </View>
            </View>
            <Pressable
              style={{ justifyContent: "flex-end" }}
              onPress={() => navigation.navigate("Profile")}
            >
              <Ionicons name="arrow-forward-circle" size={40} color="#F39300" />
            </Pressable>
          </View>
        </View>
        <View
          style={{
            marginVertical: 16,
            marginHorizontal: 30,
            justifyContent: "space-between",
            flexDirection: "row",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              flex: 0.43,
              padding: 12,
              borderRadius: 10,
              elevation: 3,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: "black",
                }}
              >
                Requests
              </Text>
              <View
                style={{
                  backgroundColor: "#F39300",
                  padding: 2,
                  borderRadius: 20,
                  width: 28,
                  height: 28,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 14,
                    fontWeight: "bold",
                  }}
                >
                  {requestCount === 0 ? 0 : requestCount}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate("Request")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: "#F39300",
                  fontWeight: "600",
                }}
              >
                View all
              </Text>
              <Ionicons
                name="chevron-forward"
                size={22}
                color="#F39300"
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          </View>
          <View
            style={{
              backgroundColor: "white",
              flex: 0.55,
              padding: 12,
              borderRadius: 10,
              elevation: 3,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: "black",
                }}
              >
                Appointments
              </Text>
              <View
                style={{
                  backgroundColor: "#F39300",
                  padding: 2,
                  borderRadius: 20,
                  width: 28,
                  height: 28,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 14,
                    fontWeight: "bold",
                  }}
                >
                  {appoinmentCount === 0 ? 0 : appoinmentCount}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate("Appointment")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: "#F39300",
                  fontWeight: "600",
                }}
              >
                View all
              </Text>
              <Ionicons
                name="chevron-forward"
                size={22}
                color="#F39300"
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{
            marginVertical: 4,
            marginHorizontal: 30,
            justifyContent: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 24, fontWeight: "bold" }}>
                Your History
              </Text>
            </View>
            <View style={{ justifyContent: "flex-end" }}>
              <Text
                style={{ fontSize: 20, color: "#F39300", fontWeight: "600" }}
              >
                View all
              </Text>
            </View>
          </View>
        </View>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          style={{
            flex: 0.65,
            backgroundColor: "white",
            borderRadius: 20,
            elevation: 3,
            marginHorizontal: 30,
            paddingHorizontal: 5,
            marginBottom: 20,
          }}
        ></ScrollView>
      </View>
    </>
  );
}
