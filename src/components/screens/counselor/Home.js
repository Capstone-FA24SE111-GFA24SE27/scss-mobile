import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  Animated,
  TextInput,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../context/AuthContext";
import { NotificationContext } from "../../context/NotificationContext";
import axiosJWT, { BASE_URL } from "../../../config/Config";

export default function Home() {
  const { width, height } = Dimensions.get("screen");
  const navigation = useNavigation();
  const { fetchProfile, profile } = useContext(AuthContext);
  const { notifications } = useContext(NotificationContext);
  const [requests, setRequests] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const scrollViewRef = useRef(null);
  useFocusEffect(
    React.useCallback(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
      }
      fetchProfile();
      fetchRequest();
      const fromDate = new Date().toISOString().split("T")[0];
      const toDate = new Date(new Date().setDate(new Date().getDate() + 6))
        .toISOString()
        .split("T")[0];
      fetchAppointment(fromDate, toDate);
    }, [])
  );

  const ringing = useRef(new Animated.Value(0)).current;
  const blinking = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(5000),
        Animated.timing(ringing, {
          toValue: -1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(ringing, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(ringing, {
          toValue: -1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(ringing, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(ringing, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const rotation = ringing.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-30deg", "30deg"],
  });

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinking, {
          toValue: 0.5,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(blinking, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchRequest();
    const fromDate = new Date().toISOString().split("T")[0];
    const toDate = new Date(new Date().setDate(new Date().getDate() + 6))
      .toISOString()
      .split("T")[0];
    fetchAppointment(fromDate, toDate);
  }, []);

  const fetchRequest = async () => {
    try {
      const requestsRes = await axiosJWT.get(
        `${BASE_URL}/booking-counseling/appointment-request`
      );
      const requestsData = requestsRes?.data?.content || [];
      setRequests(requestsData);
      console.log(requests);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchAppointment = async (fromDate, toDate) => {
    try {
      const appointmentRes = await axiosJWT.get(
        `${BASE_URL}/booking-counseling/appointment?fromDate=${fromDate}&toDate=${toDate}`
      );
      const data = appointmentRes.data;
      if (data.status === 200) {
        const formattedAppointments = data?.content?.map((appointment) => ({
          id: appointment.id,
          date: appointment.startDateTime.split("T")[0],
          startTime: appointment.startDateTime.split("T")[1].slice(0, 5),
          endTime: appointment.endDateTime.split("T")[1].slice(0, 5),
          meetingType: appointment.meetingType,
          place:
            appointment?.meetingType === "ONLINE"
              ? `${appointment?.meetUrl}`
              : `${appointment?.address}`,
              studentName:
              appointment?.studentInfo?.profile?.fullName,
            studentImage:
              appointment?.studentInfo?.profile?.avatarLink,
          studentSpec:
            appointment.studentInfo.specialization.name,
          status: appointment.status,
        }));
        setAppointments(formattedAppointments);
      }
    } catch (error) {
      console.log("Failed to fetch appointments", error);
    }
  };
  return (
    <>
      <View style={{ backgroundColor: "#f5f7fd", flex: 1 }}>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 30,
            paddingTop: height * 0.04,
            paddingBottom: height * 0.02,
            backgroundColor: "#F39300",
            borderBottomStartRadius: 40,
            borderBottomEndRadius: 40,
          }}
        >
          <View>
            {profile && (
              <Text
                style={{ fontSize: 20, fontWeight: "semibold", color: "white" }}
              >
                Hello, {profile.fullName}
              </Text>
            )}
            <Text style={{ fontSize: 26, fontWeight: "bold", color: "white" }}>
              Ready to discover
            </Text>
          </View>

          <View
            style={{ display: "flex", flexDirection: "row", marginTop: 12 }}
          >
            <Pressable
              onPress={() => navigation.navigate("Notification")}
              style={{ position: "relative", marginRight: 20, marginTop: 2 }}
            >
              <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                <Ionicons
                  name="notifications-outline"
                  size={40}
                  style={{ color: "white" }}
                />
              </Animated.View>
              {notifications.some(
                (notification) => notification.readStatus === false
              ) && (
                <Animated.View
                  style={{
                    opacity: blinking,
                    position: "absolute",
                    top: -6,
                    right: -3,
                    zIndex: 1,
                  }}
                >
                  <View
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: "white",
                    }}
                  />
                </Animated.View>
              )}
            </Pressable>
            <Pressable>
              <Ionicons name="menu" size={40} color="white" />
            </Pressable>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            borderRadius: 30,
            marginHorizontal: 25,
            paddingHorizontal: 15,
            marginVertical: 16,
            alignItems: "center",
            backgroundColor: "#ededed",
            alignContent: "center",
            height: 50,
          }}
        >
          <Ionicons
            name="search"
            size={24}
            style={{ marginRight: 10, color: "#F39300", opacity: 0.7 }}
          />
          <TextInput
            placeholder="What are you searching for?"
            placeholderTextColor="#F39300"
            style={{
              fontSize: 18,
              opacity: 0.8,
            }}
          />
        </View>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          style={{ marginHorizontal: 30 }}
        >
          <View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                Recently Requests
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Request")}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: "#F39300",
                    opacity: 0.8,
                  }}
                >
                  See All
                </Text>
              </TouchableOpacity>
            </View>
            {requests?.data?.length === 0 ? (
              <View
                style={{
                  width: width,
                  backgroundColor: "#ededed",
                  padding: 12,
                  marginVertical: 12,
                  alignSelf: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "500",
                    textAlign: "center",
                    color: "#F39300",
                  }}
                >
                  No requests created
                </Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {requests?.data?.map((request, index) => (
                  <TouchableOpacity
                    key={request.id}
                    style={{
                      width: width * 0.65,
                      height: "auto",
                      backgroundColor: "white",
                      borderRadius: 20,
                      padding: 12,
                      marginVertical: 12,
                      marginRight: 12,
                      borderWidth: 1.5,
                      borderColor: "#F39300",
                      overflow: "hidden",
                      position: "relative",
                      flexDirection: "column",
                    }}
                  >
                    <View style={{ flexDirection: "row", marginBottom: 16 }}>
                      <Image
                        source={{ uri: request.student.profile.avatarLink }}
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 40,
                          borderColor: "#F39300",
                          borderWidth: 2,
                        }}
                      />
                      <View style={{ marginLeft: 12 }}>
                        <Text style={{ fontWeight: "bold", fontSize: 18 }}>
                          {request.student.profile.fullName.length > 12
                            ? request.student.profile.fullName.substring(
                                0,
                                12
                              ) + "..."
                            : request.student.profile.fullName}
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            alignSelf: "flex-start",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#F39300",
                            borderRadius: 20,
                            paddingVertical: 4,
                            paddingHorizontal: 12,
                            marginTop: 4,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "bold",
                              color: "white",
                            }}
                          >
                            {request.meetingType.charAt(0).toUpperCase() +
                              request.meetingType.slice(1)}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <Ionicons name="calendar" size={20} color="#F39300" />
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "600",
                            marginLeft: 8,
                          }}
                        >
                          {request.requireDate}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <Ionicons name="time" size={20} color="#F39300" />
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "600",
                            marginLeft: 8,
                          }}
                        >
                          {request.startTime.split(":")[0] +
                            ":" +
                            request.startTime.split(":")[1]}{" "}
                          -{" "}
                          {request.endTime.split(":")[0] +
                            ":" +
                            request.endTime.split(":")[1]}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          flexWrap: "wrap",
                          justifyContent: "space-between",
                          marginBottom: 8,
                        }}
                      >
                        <View>
                          <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                            Status:{" "}
                            <Text
                              style={[
                                request.status === "APPROVED" && {
                                  color: "green",
                                },
                                request.status === "WAITING" && {
                                  color: "#F39300",
                                },
                                request.status === "DENIED" && { color: "red" },
                              ]}
                            >
                              {request.status}
                            </Text>
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View
                      style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        backgroundColor: "#F39300",
                        paddingVertical: 4,
                        paddingLeft: 8,
                        paddingRight: 4,
                        borderBottomLeftRadius: 16,
                      }}
                    >
                      <Text style={{ fontSize: 16, color: "white" }}>New</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
          <View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                Upcoming Appointments
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Appointment")}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: "#F39300",
                    opacity: 0.8,
                  }}
                >
                  See All
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {Array(7)
                .fill(0)
                .map((_, index) => {
                  const date = new Date();
                  date.setDate(date.getDate() + index);
                  const dateString = date.toISOString().split("T")[0];
                  const appointmentCount = appointments.filter(
                    (appointment) => appointment.date === dateString
                  ).length;
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelectedDate(dateString)}
                      style={{
                        flexDirection: "row",
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        marginVertical: 8,
                        marginRight: 8,
                        backgroundColor:
                          selectedDate === dateString ? "#F39300" : "white",
                        borderRadius: 10,
                        borderColor: "#F39300",
                        borderWidth: 1.5,
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: "bold",
                          fontSize: 16,
                          color:
                            selectedDate === dateString ? "white" : "#F39300",
                        }}
                      >
                        {date.toISOString().split("T")[0] ===
                        new Date().toISOString().split("T")[0]
                          ? "Today"
                          : date.toLocaleDateString("en-US", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })}
                      </Text>
                      <Text
                        style={{
                          fontWeight: "bold",
                          fontSize: 16,
                          color:
                            selectedDate === dateString ? "white" : "#F39300",
                          marginLeft: 4,
                        }}
                      >
                        ({appointmentCount})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
            </ScrollView>
            {appointments?.filter(
              (appointment) => appointment.date === selectedDate
            ).length === 0 ? (
              <View
                style={{
                  width: width,
                  backgroundColor: "#ededed",
                  padding: 12,
                  marginVertical: 12,
                  alignSelf: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "500",
                    textAlign: "center",
                    color: "#F39300",
                  }}
                >
                  No appointment on this day
                </Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {appointments
                  ?.filter((appointment) => appointment.date === selectedDate)
                  .map((appointment) => (
                    <TouchableOpacity
                      key={appointment.id}
                      style={{
                        width: width * 0.8,
                        backgroundColor: "#F39300",
                        borderRadius: 20,
                        marginVertical: 12,
                        marginRight: 12,
                        borderColor: "lightgrey",
                        borderWidth: 1,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          paddingHorizontal: 16,
                          paddingVertical: 16,
                          borderRadius: 20,
                        }}
                      >
                        <View>
                          <Text
                            style={{
                              fontSize: 18,
                              fontWeight: "bold",
                              color: "white",
                            }}
                          >
                            {appointment.studentName}
                          </Text>
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "400",
                              color: "white",
                              marginTop: 2,
                            }}
                          >
                            {appointment.studentSpec}
                          </Text>
                        </View>
                        <Image
                          source={{ uri: appointment.studentImage }}
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: 40,
                            borderColor: "white",
                            borderWidth: 2,
                          }}
                        />
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          padding: 16,
                          borderBottomRightRadius: 20,
                          borderBottomLeftRadius: 20,
                        }}
                      >
                        <View
                          style={{
                            flex: 0.58,
                            flexDirection: "row",
                            alignItems: "center",
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            backgroundColor: "white",
                            borderRadius: 10,
                          }}
                        >
                          {appointment.meetingType === "ONLINE" ? (
                            <Ionicons
                              name="videocam"
                              size={24}
                              color="#F39300"
                            />
                          ) : (
                            <MaterialIcons
                              name="place"
                              size={24}
                              color="#F39300"
                            />
                          )}
                          <View style={{ marginLeft: 8, flex: 1 }}>
                            <Text
                              style={{
                                fontSize: 16,
                                color: "black",
                                fontWeight: "600",
                              }}
                            >
                              {appointment.meetingType === "ONLINE"
                                ? "Online"
                                : "Offline"}
                            </Text>
                            <Text
                              style={{
                                fontSize: 14,
                                color: "#333",
                              }}
                              numberOfLines={2}
                            >
                              {appointment.place}
                            </Text>
                          </View>
                        </View>
                        <View
                          style={{
                            flex: 0.38,
                            flexDirection: "row",
                            alignItems: "center",
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            backgroundColor: "white",
                            borderRadius: 10,
                          }}
                        >
                          <Ionicons
                            name="time-outline"
                            size={24}
                            color="#F39300"
                          />
                          <View style={{ marginLeft: 8 }}>
                            <Text
                              style={{
                                fontSize: 16,
                                color: "black",
                                fontWeight: "600",
                              }}
                            >
                              {appointment.startTime}
                            </Text>
                            <Text style={{ fontSize: 14, color: "#333" }}>
                              {appointment.date}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            )}
          </View>
        </ScrollView>
      </View>
    </>
  );
}
