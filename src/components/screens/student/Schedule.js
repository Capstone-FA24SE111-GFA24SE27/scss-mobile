import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  ScrollView,
  TextInput,
  Linking,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import {
  AgendaList,
  CalendarProvider,
  ExpandableCalendar,
} from "react-native-calendars";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import axiosJWT, { BASE_URL } from "../../../config/Config";
import { useFocusEffect } from "@react-navigation/native";
import { SocketContext } from "../../context/SocketContext";
import { AuthContext } from "../../context/AuthContext";
import Toast from "react-native-toast-message";
import ExtendInfoModal from "../../layout/ExtendInfoModal";

export default function Schedule() {
  const { width, height } = Dimensions.get("screen");
  const socket = useContext(SocketContext);
  const { userData } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [openInfo, setOpenInfo] = useState(false);
  const [info, setInfo] = useState({});
  const [openExtendInfo, setOpenExtendInfo] = useState(false);
  const [extendInfo, setExtendInfo] = useState(null);
  const [openFeedback, setOpenFeedback] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rating, setRating] = useState(0);
  const [value, setValue] = useState("");

  useFocusEffect(
    React.useCallback(() => {
      const date = new Date(selectedDate);
      const dayOfWeek = date.getDay();

      const startDate = new Date(
        date.getTime() - dayOfWeek * 24 * 60 * 60 * 1000
      );
      const endDate = new Date(
        date.getTime() + (6 - dayOfWeek) * 24 * 60 * 60 * 1000
      );

      const fromDate = startDate.toISOString().split("T")[0];
      const toDate = endDate.toISOString().split("T")[0];
      if (fromDate && toDate) {
        fetchData(fromDate, toDate);
      }
    }, [selectedDate])
  );

  useEffect(() => {
    if (socket) {
      socket.on(`/user/${userData?.id}/appointment`, (data) => {
        console.log(data);
        setSelectedDate((prev) => {
          const date = new Date(prev);
          const dayOfWeek = date.getDay();

          const startDate = new Date(
            date.getTime() - dayOfWeek * 24 * 60 * 60 * 1000
          );
          const endDate = new Date(
            date.getTime() + (6 - dayOfWeek) * 24 * 60 * 60 * 1000
          );

          const fromDate = startDate.toISOString().split("T")[0];
          const toDate = endDate.toISOString().split("T")[0];
          if (fromDate && toDate) {
            fetchData(fromDate, toDate);
          }
          return prev;
        });
      });
    }
    return () => {
      if (socket) {
        socket.off(`/user/${userData?.id}/appointment`);
      }
    };
  }, [socket]);

  const formatDate = (value) => {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  };

  const fetchData = async (fromDate, toDate) => {
    try {
      if (!fromDate || !toDate) return;
      console.log(fromDate, "|", toDate);

      const scheduleRes = await axiosJWT.get(
        `${BASE_URL}/booking-counseling/appointment?fromDate=${fromDate}&toDate=${toDate}`
      );

      const data = scheduleRes?.data;
      if (data.status === 200) {
        const formattedItems = data?.content
          ?.filter((appointment) => appointment?.status !== "CANCELED")
          .sort(
            (a, b) =>
              new Date(a.startDateTime).getTime() -
              new Date(b.startDateTime).getTime()
          )
          .reduce((acc, appointment) => {
            const date = appointment?.startDateTime.split("T")[0];
            if (!acc[date]) {
              acc[date] = [];
            }
            acc[date].push({
              id: appointment?.id,
              reason: appointment?.reason,
              date: formatDate(date),
              startTime: appointment?.startDateTime.split("T")[1].slice(0, 5),
              endTime: appointment?.endDateTime.split("T")[1].slice(0, 5),
              meetingType: appointment?.meetingType,
              place:
                appointment?.meetingType === "ONLINE"
                  ? `${appointment?.meetUrl}`
                  : `${appointment?.address}`,
              counselorName:
                appointment?.counselorInfo?.profile?.fullName || "No name",
              counselorImage:
                appointment?.counselorInfo?.profile?.avatarLink || "Image-url",
              counselorEmail: appointment?.counselorInfo?.email,
              counselorGender: appointment?.counselorInfo?.profile?.gender,
              counselorPhone: appointment?.counselorInfo?.profile?.phoneNumber,
              counselorMajor: appointment?.counselorInfo?.major?.name,
              status: appointment?.status,
              feedback: appointment?.appointmentFeedback,
              extendInfo: appointment?.counselorInfo,
            });
            return acc;
          }, {});

        const items = Object.keys(formattedItems).map((date) => ({
          title: date,
          data: formattedItems[date],
        }));

        setItems(items);

        const marked = {};
        items.forEach((item) => {
          marked[item.title] = {
            marked: true,
            dotColor: "#F39300",
            // dotColor: selectedDate === item.title ? "white" : "#F39300",
          };
        });
        setMarkedDates(marked);
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to fetch data",
          onPress: () => {
            Toast.hide();
          },
        });
      }
    } catch (err) {
      console.log("Failed to fetch data", err);
    }
  };

  const error = console.error;
  console.error = (...args) => {
    if (/defaultProps/.test(args[0])) return;
    error(...args);
  };

  const handleOpenFeedback = async (id) => {
    setOpenFeedback(true);
    setSelectedAppointment(id);
  };

  const handleTakeFeedback = async () => {
    try {
      const response = await axiosJWT.post(
        `${BASE_URL}/booking-counseling/feedback/${selectedAppointment}`,
        {
          rating: rating,
          comment: value,
        }
      );
      const data = await response.data;
      if (data && data.status == 200) {
        setInfo({
          ...info,
          feedback: {
            rating: rating,
            comment: value,
            createdAt: new Date().toISOString().split("T")[0],
          },
        });
        handleCloseFeedback();
      }
    } catch (err) {
      console.log("Can't take feedback on this appointment", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Can't take feedback on this appointment",
      });
    }
  };

  const handleCloseFeedback = () => {
    setSelectedAppointment(null);
    setRating(0);
    setValue("");
    setOpenFeedback(false);
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay();

    const startDate = new Date(
      date.getTime() - dayOfWeek * 24 * 60 * 60 * 1000
    );
    const endDate = new Date(
      date.getTime() + (6 - dayOfWeek) * 24 * 60 * 60 * 1000
    );

    const fromDate = startDate.toISOString().split("T")[0];
    const toDate = endDate.toISOString().split("T")[0];
    if (fromDate && toDate) {
      fetchData(fromDate, toDate);
    }
  };

  const renderItem = ({ item }) => (
    <>
      <TouchableOpacity
        onPress={() => (setInfo(item), setOpenInfo(true))}
        activeOpacity={0.8}
        style={{
          backgroundColor: "white",
          padding: 16,
          borderRadius: 10,
          margin: 8,
          elevation: 3,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Image
            source={{ uri: item.counselorImage }}
            style={{
              width: width * 0.14,
              height: width * 0.14,
              borderRadius: width * 0.07,
              marginRight: 16,
              borderWidth: 1.5,
              borderColor: "#F39300",
            }}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#333",
              }}
            >
              {item.counselorName}
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                color: "#555",
                marginTop: 4,
              }}
            >
              {item.startTime} - {item.endTime}
            </Text>
          </View>
          <View
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
            }}
          >
            <View
              style={[
                item.status === "ATTEND" && { borderColor: "green" },
                item.status === "WAITING" && { borderColor: "#F39300" },
                item.status === "ABSENT" && { borderColor: "red" },
                item.status === "CANCELED" && { borderColor: "gray" },
                {
                  backgroundColor: "#fdfdfd",
                  borderRadius: 20,
                  paddingVertical: 6,
                  borderWidth: 1.5,
                  paddingHorizontal: 12,
                  flexDirection: "row",
                  elevation: 1,
                },
              ]}
            >
              <Text
                style={[
                  { fontSize: 16, fontWeight: "bold" },
                  item.status === "ATTEND" && { color: "green" },
                  item.status === "WAITING" && { color: "#F39300" },
                  item.status === "ABSENT" && { color: "red" },
                  item.status === "CANCELED" && { color: "gray" },
                ]}
              >
                {item.status}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </>
  );

  return (
    <>
      <View style={{ backgroundColor: "#f5f7fd", flex: 1 }}>
        <View style={{ flex: 1, marginTop: height * 0.04 }}>
          <CalendarProvider
            date={selectedDate}
            onDateChanged={(date) => setSelectedDate(date)}
          >
            <ExpandableCalendar
              firstDay={0}
              markedDates={markedDates}
              hideKnob
              disablePan
              initialPosition="close"
              theme={{
                // selectedDayBackgroundColor: "#F39300",
                // selectedDayTextColor: "white",
                selectedDayBackgroundColor: "white",
                selectedDayTextColor: "#F39300",
                arrowColor: "#F39300",
                textDayHeaderFontSize: 14,
                textDayFontSize: 16,
                todayTextColor: "black",
              }}
              style={{
                elevation: 1,
              }}
              renderArrow={(direction) => {
                return direction === "left" ? (
                  <Ionicons name="chevron-back" size={22} color="#F39300" />
                ) : (
                  <Ionicons name="chevron-forward" size={22} color="#F39300" />
                );
              }}
            />
            <AgendaList
              sections={items}
              renderItem={renderItem}
              style={{ marginTop: 8 }}
              sectionStyle={{
                color: "#F39300",
                backgroundColor: "#f5f7fd",
                fontSize: 16,
                marginHorizontal: 10,
                paddingTop: 12,
                paddingBottom: 4,
              }}
            />
          </CalendarProvider>
          <Modal
            transparent={true}
            visible={openInfo}
            animationType="slide"
            onRequestClose={() => setOpenInfo(false)}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "flex-end",
                alignItems: "center",
                backgroundColor: "rgba(0, 0, 0, 0.2)",
              }}
            >
              <View
                style={{
                  width: "100%",
                  height: "98%",
                  backgroundColor: "#f5f7fd",
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                }}
              >
                <TouchableOpacity
                  style={{
                    backgroundColor: "#ededed",
                    padding: 4,
                    marginHorizontal: 20,
                    marginTop: 16,
                    marginBottom: 20,
                    borderRadius: 20,
                    alignSelf: "flex-start",
                    alignItems: "flex-start",
                  }}
                  onPress={() => (setInfo(""), setOpenInfo(false))}
                >
                  <Ionicons name="chevron-back" size={28} />
                </TouchableOpacity>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View
                    style={{
                      padding: 20,
                      backgroundColor: "#f5f7fd",
                    }}
                  >
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => (
                        setOpenExtendInfo(true), setExtendInfo(info?.extendInfo)
                      )}
                      style={{
                        flexDirection: "row",
                        padding: 16,
                        backgroundColor: "white",
                        borderRadius: 10,
                        marginBottom: 20,
                        elevation: 1,
                        borderWidth: 1.5,
                        borderColor: "#e3e3e3",
                      }}
                    >
                      <View style={{ width: "40%" }}>
                        <View style={{ position: "relative" }}>
                          <Image
                            source={{ uri: info?.counselorImage }}
                            style={{
                              width: width * 0.28,
                              height: width * 0.28,
                              borderRadius: 100,
                              marginBottom: 12,
                              borderColor: "#F39300",
                              borderWidth: 2,
                            }}
                          />
                          <View
                            style={{
                              padding: 5,
                              backgroundColor: "#F39300",
                              borderRadius: 30,
                              position: "absolute",
                              right: 20,
                              bottom: 12,
                            }}
                          >
                            <Ionicons
                              name={
                                info?.counselorGender == "MALE"
                                  ? "male"
                                  : "female"
                              }
                              size={24}
                              style={{ color: "white" }}
                            />
                          </View>
                        </View>
                      </View>
                      <View style={{ width: "60%" }}>
                        <Text
                          style={{
                            fontSize: 24,
                            fontWeight: "bold",
                            color: "#333",
                            marginBottom: 4,
                          }}
                        >
                          {info?.counselorName}
                        </Text>
                        <Text
                          style={{
                            fontSize: 20,
                            fontWeight: "500",
                            color: "#333",
                            marginBottom: 2,
                          }}
                        >
                          {info?.counselorMajor}
                        </Text>
                        <Text
                          style={{
                            fontSize: 16,
                            color: "grey",
                            marginBottom: 2,
                          }}
                        >
                          Email: {info?.counselorEmail}
                        </Text>
                        <Text
                          style={{
                            fontSize: 16,
                            color: "grey",
                          }}
                        >
                          Phone: {info?.counselorPhone}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <View
                      style={{
                        flexDirection: "row",
                        padding: 16,
                        backgroundColor: "white",
                        borderRadius: 10,
                        marginBottom: 20,
                        elevation: 1,
                        borderWidth: 1.5,
                        borderColor: "#e3e3e3",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "bold",
                          color: "#F39300",
                          marginBottom: 4,
                        }}
                      >
                        Appointment Topic
                      </Text>
                      <Text
                        style={{
                          fontSize: 20,
                          color: "#333",
                          fontWeight: "500",
                          opacity: 0.7,
                        }}
                      >
                        {info?.reason}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        padding: 16,
                        backgroundColor: "white",
                        borderRadius: 10,
                        marginBottom: 20,
                        elevation: 1,
                        borderWidth: 1.5,
                        borderColor: "#e3e3e3",
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginVertical: 12,
                        }}
                      >
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Ionicons name="calendar" size={24} color="#F39300" />
                          <Text
                            style={{
                              fontSize: 18,
                              color: "gray",
                              fontWeight: "500",
                              marginLeft: 10,
                            }}
                          >
                            Date
                          </Text>
                        </View>
                        <View>
                          <Text
                            style={{
                              fontSize: 18,
                              color: "#333",
                              fontWeight: "500",
                            }}
                          >
                            {info.date}
                          </Text>
                        </View>
                      </View>
                      <View
                        style={{
                          borderTopWidth: 1,
                          borderColor: "lightgrey",
                          marginVertical: 4,
                        }}
                      />
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginVertical: 12,
                        }}
                      >
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Ionicons name="time" size={24} color="#F39300" />
                          <Text
                            style={{
                              fontSize: 18,
                              color: "gray",
                              fontWeight: "500",
                              marginLeft: 10,
                            }}
                          >
                            Time
                          </Text>
                        </View>
                        <View>
                          <Text
                            style={{
                              fontSize: 18,
                              color: "#333",
                              fontWeight: "500",
                            }}
                          >
                            {info.startTime} - {info.endTime}
                          </Text>
                        </View>
                      </View>
                      <View
                        style={{
                          borderTopWidth: 1,
                          borderColor: "lightgrey",
                          marginVertical: 4,
                        }}
                      />
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginVertical: 12,
                        }}
                      >
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <MaterialIcons
                            name="meeting-room"
                            size={24}
                            color="#F39300"
                          />
                          <Text
                            style={{
                              fontSize: 18,
                              color: "gray",
                              fontWeight: "500",
                              marginLeft: 10,
                            }}
                          >
                            Format
                          </Text>
                        </View>
                        <View
                          style={{
                            backgroundColor: "#F39300",
                            borderRadius: 20,
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "bold",
                              color: "white",
                            }}
                          >
                            {info.meetingType}
                          </Text>
                        </View>
                      </View>
                      <View
                        style={{
                          borderTopWidth: 1,
                          borderColor: "lightgrey",
                          marginVertical: 4,
                        }}
                      />
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginVertical: 12,
                        }}
                      >
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          {info.meetingType === "ONLINE" && (
                            <Ionicons
                              name="videocam"
                              size={24}
                              color="#F39300"
                            />
                          )}
                          {info.meetingType === "OFFLINE" && (
                            <MaterialIcons
                              name="place"
                              size={24}
                              color="#F39300"
                            />
                          )}

                          <Text
                            style={{
                              fontSize: 18,
                              color: "gray",
                              fontWeight: "500",
                              marginLeft: 10,
                            }}
                          >
                            {info.meetingType === "ONLINE"
                              ? "Meet URL"
                              : "Address"}
                          </Text>
                        </View>
                        <TouchableOpacity
                          disabled={info.meetingType !== "ONLINE"}
                          onPress={() =>
                            Linking.openURL(`${info.place}`).catch((err) => {
                              console.log("Can't open this link", err);
                              Toast.show({
                                type: "error",
                                text1: "Error",
                                text2: "Can't open this link",
                              });
                            })
                          }
                          style={{ maxWidth: "45%" }}
                        >
                          <Text
                            style={{
                              fontSize: 18,
                              fontWeight: "bold",
                              color:
                                info.meetingType === "ONLINE"
                                  ? "#F39300"
                                  : "#333",
                              textDecorationLine:
                                info.meetingType === "ONLINE"
                                  ? "underline"
                                  : "none",
                            }}
                          >
                            {info.place}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    {info?.feedback !== null ? (
                      <View
                        style={{
                          flexDirection: "row",
                          padding: 16,
                          backgroundColor: "white",
                          borderRadius: 10,
                          marginBottom: 20,
                          elevation: 1,
                          borderWidth: 1.5,
                          borderColor: "#e3e3e3",
                        }}
                      >
                        <View style={{ marginBottom: 8 }}>
                          <Text
                            style={{
                              fontSize: 18,
                              color: "#333",
                              fontWeight: "500",
                            }}
                          >
                            <Text
                              style={{
                                color: "#F39300",
                                fontWeight: "bold",
                              }}
                            >
                              You
                            </Text>{" "}
                            had leave a review
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 12,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              backgroundColor: "#F39300",
                              paddingHorizontal: 12,
                              paddingVertical: 4,
                              borderRadius: 16,
                            }}
                          >
                            <Ionicons name="star" size={16} color="white" />
                            <Text
                              style={{
                                fontSize: 16,
                                marginLeft: 6,
                                fontWeight: "bold",
                                color: "white",
                              }}
                            >
                              {info?.feedback?.rating.toFixed(1)}
                            </Text>
                          </View>
                          <View
                            style={{
                              paddingHorizontal: 12,
                              paddingVertical: 4,
                              borderWidth: 1,
                              borderColor: "gray",
                              borderRadius: 20,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: "500",
                                color: "#333",
                              }}
                            >
                              {formatDate(info?.feedback?.createdAt)}
                            </Text>
                          </View>
                        </View>
                        <Text
                          style={{
                            fontSize: 18,
                            color: "#333",
                            lineHeight: 24,
                          }}
                        >
                          {info?.feedback?.comment}
                        </Text>
                      </View>
                    ) : (
                      <View
                        style={{
                          flexDirection: "row",
                          padding: 16,
                          backgroundColor: "white",
                          borderRadius: 10,
                          marginBottom: 20,
                          elevation: 1,
                          borderWidth: 1.5,
                          borderColor: "#e3e3e3",
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
                          There's no feedback yet
                        </Text>
                        {new Date().toISOString().split("T")[0] <= info.date &&
                          info.status !== "WAITING" &&
                          info.status !== "ABSENT" &&
                          info.status !== "CANCELED" && (
                            <TouchableOpacity
                              onPress={() => handleOpenFeedback(info.id)}
                              activeOpacity={0.6}
                            >
                              <Text
                                style={{
                                  fontSize: 18,
                                  fontWeight: "bold",
                                  color: "#F39300",
                                  textDecorationLine: "underline",
                                }}
                              >
                                Leave a Review
                              </Text>
                            </TouchableOpacity>
                          )}
                      </View>
                    )}
                  </View>
                </ScrollView>
              </View>
            </View>
          </Modal>
          <ExtendInfoModal
            openExtendInfo={openExtendInfo}
            setOpenExtendInfo={setOpenExtendInfo}
            extendInfo={extendInfo}
            setExtendInfo={setExtendInfo}
          />
          <Modal
            transparent={true}
            visible={openFeedback}
            animationType="slide"
            onRequestClose={handleCloseFeedback}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              }}
            >
              <View
                style={{
                  width: width * 0.85,
                  padding: 20,
                  backgroundColor: "white",
                  borderRadius: 10,
                  elevation: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "bold",
                    marginVertical: 12,
                    textAlign: "center",
                  }}
                >
                  Write a Review
                </Text>
                <View style={{ marginVertical: 8 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "600",
                      marginBottom: 8,
                    }}
                  >
                    What do you think?
                  </Text>
                  <TextInput
                    placeholder="Type message here..."
                    value={value}
                    onChangeText={(value) => setValue(value)}
                    style={{
                      borderColor: "#ccc",
                      borderWidth: 1,
                      borderRadius: 10,
                      padding: 12,
                      backgroundColor: "#fff",
                      fontSize: 16,
                      textAlignVertical: "top",
                    }}
                    multiline
                    numberOfLines={2}
                  />
                </View>
                <View style={{ marginVertical: 8 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "600",
                      marginBottom: 8,
                    }}
                  >
                    Give a rating
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    {[1, 2, 3, 4, 5].map((star, index) => (
                      <TouchableOpacity
                        key={index}
                        activeOpacity={0.6}
                        onPress={() => setRating(star)}
                      >
                        <Ionicons
                          name="star"
                          size={24}
                          color={rating >= star ? "#F39300" : "gray"}
                          style={{ marginHorizontal: 2 }}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    alignItems: "flex-end",
                    marginTop: 8,
                  }}
                >
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#ededed",
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 10,
                      marginRight: 10,
                      justifyContent: "center",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: "gray",
                    }}
                    onPress={handleCloseFeedback}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        color: "#333",
                      }}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    disabled={value === "" || rating === 0}
                    style={{
                      backgroundColor:
                        value === "" || rating === 0 ? "#ededed" : "#F39300",
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 10,
                      justifyContent: "center",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor:
                        value === "" || rating === 0 ? "gray" : "#F39300",
                    }}
                    onPress={handleTakeFeedback}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        color: value === "" || rating === 0 ? "gray" : "white",
                      }}
                    >
                      Save
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </>
  );
}
