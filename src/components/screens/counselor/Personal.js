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
import { AuthContext } from "../../context/AuthContext";
import axiosJWT, { BASE_URL } from "../../../config/Config";
import { SocketContext } from "../../context/SocketContext";

export default function Personal() {
  const navigation = useNavigation();
  const { profile, userData } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const [requestCount, setRequestCount] = useState(0);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [demandCount, setDemandCount] = useState(0);
  const [weekSlots, setWeekSlots] = useState([]);
  const daysOfWeek = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ];
  const scrollViewRef = useRef(null);
  useFocusEffect(
    React.useCallback(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
      }
      fetchRequestAllPages();
      fetchAppointmentAllPages();
      fetchDemandAllPages();
      fetchWeekTimetableSlots();
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
    socket.on(`/user/${userData?.id}/private/notification`, () => {
      fetchRequestAllPages();
      fetchAppointmentAllPages();
      fetchDemandAllPages();
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
      console.log("Error fetching requests");
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
      console.log("Error fetching appointments", error);
      setAppointmentCount(0);
    }
  };

  const fetchDemandAllPages = async () => {
    let page = 1;
    let totalWaitingItems = 0;
    let hasMorePages = true;

    try {
      while (hasMorePages) {
        const response = await axiosJWT.get(
          `${BASE_URL}/counseling-demand/counselor/filter`,
          { params: { page: page } }
        );
        const { data, totalPages } = response?.data?.content;
        const waitingItems = data?.filter(
          (item) => item.status === "PROCESSING"
        );
        totalWaitingItems += waitingItems?.length;
        page += 1;
        hasMorePages = page <= totalPages;
      }
      setDemandCount(totalWaitingItems);
    } catch (error) {
      console.log("Error fetching demands", error);
      setDemandCount(0);
    }
  };

  const fetchWeekTimetableSlots = async () => {
    try {
      const weekRes = await axiosJWT.get(
        `${BASE_URL}/manage/counselors/${userData?.id}/counseling-slots`
      );
      const weeKData = weekRes.data.content;
      setWeekSlots(weeKData);
    } catch (err) {
      console.log("Can't fetch week timetable", err);
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
            borderRadius: 10,
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
                source={{ uri: profile?.avatarLink }}
                style={{ width: 50, height: 50, borderRadius: 25 }}
              />
              <View style={{ marginLeft: 20 }}>
                {profile && (
                  <Text style={{ fontSize: 22, fontWeight: "bold" }}>
                    {profile?.fullName}
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
              flex: 0.42,
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
                  color: "#333",
                }}
              >
                Requests
              </Text>
              <View
                style={{
                  backgroundColor: "#F39300",
                  padding: 1,
                  borderRadius: 20,
                  width: 24,
                  height: 24,
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
                  opacity: 0.8,
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
              flex: 0.56,
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
                  color: "#333",
                }}
              >
                Appointments
              </Text>
              <View
                style={{
                  backgroundColor: "#F39300",
                  padding: 1,
                  borderRadius: 20,
                  width: 24,
                  height: 24,
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
                  {appointmentCount === 0 ? 0 : appointmentCount}
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
                  opacity: 0.8,
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
            marginBottom: 16,
            marginHorizontal: 30,
            flexDirection: "row",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              flex: 1,
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
                  color: "#333",
                }}
              >
                Counseling Demands
              </Text>
              <View
                style={{
                  backgroundColor: "#F39300",
                  padding: 1,
                  borderRadius: 20,
                  width: 24,
                  height: 24,
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
                  {demandCount === 0 ? 0 : demandCount}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate("Demand")}
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
                  opacity: 0.8,
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
            backgroundColor: "white",
            flex: 1,
            padding: 12,
            marginBottom: 16,
            marginHorizontal: 30,
            borderRadius: 10,
            elevation: 3,
          }}
        >
          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 20, fontWeight: "700", color: "#333" }}>
              Week Timetable
            </Text>
          </View>
          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            style={{ backgroundColor: "white" }}
          >
            {daysOfWeek.map((day) => {
              const slots = weekSlots.filter((slot) => slot.dayOfWeek === day);
              return (
                <View key={day} style={{ marginBottom: 8 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      color: "#F39300",
                      fontWeight: "600",
                      opacity: 0.8,
                      marginBottom: 8,
                    }}
                  >
                    {day}
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                    {slots.length > 0 ? (
                      slots.map((slot) => (
                        <View
                          key={slot.id}
                          style={{
                            backgroundColor: "white",
                            padding: 8,
                            marginVertical: 4,
                            marginRight: 6,
                            borderRadius: 10,
                            borderWidth: 1.5,
                            borderColor: "black",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "600",
                              color: "#333",
                            }}
                          >
                            {slot.startTime.substring(0, 5)} -{" "}
                            {slot.endTime.substring(0, 5)}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text
                        style={{
                          fontSize: 18,
                          fontStyle: "italic",
                          fontWeight: "600",
                          color: "gray",
                          opacity: 0.7,
                        }}
                      >
                        No slots on this day
                      </Text>
                    )}
                  </View>
                  {day !== "SUNDAY" && (
                    <View
                      style={{
                        borderBottomWidth: 1.5,
                        borderColor: "#F39300",
                        marginVertical: 8,
                      }}
                    />
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </>
  );
}
