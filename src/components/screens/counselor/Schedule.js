import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  ScrollView,
  Linking,
  TextInput,
  FlatList,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import {
  Agenda,
  AgendaList,
  CalendarProvider,
  ExpandableCalendar,
} from "react-native-calendars";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import axiosJWT, { BASE_URL } from "../../../config/Config";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { SocketContext } from "../../context/SocketContext";
import { AuthContext } from "../../context/AuthContext";
import Toast from "react-native-toast-message";

export default function Schedule() {
  const navigation = useNavigation();
  const { width, height } = Dimensions.get("screen");
  // const [items, setItems] = useState({});
  const socket = useContext(SocketContext);
  const { userData } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [openInfo, setOpenInfo] = useState(false);
  const [info, setInfo] = useState({});
  const [openReport, setOpenReport] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openAttendance, setOpenAttendance] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [method, setMethod] = useState("");
  const [value, setValue] = useState("");
  const statusOptions = ["ABSENT", "ATTEND"];

  useFocusEffect(
    React.useCallback(() => {
      // const startDate = new Date(selectedDate);
      // const endDate = new Date(startDate);
      // endDate.setDate(startDate.getDate() + 6);
      // startDate.setDate(startDate.getDate() - 6);

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

  const openURL = (url) => {
    Linking.openURL(url).catch((err) =>
      console.log("An error occurred", err)
    );
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
          ?.sort(
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
              date: formatDate(date),
              startTime: appointment?.startDateTime.split("T")[1].slice(0, 5),
              endTime: appointment?.endDateTime.split("T")[1].slice(0, 5),
              meetingType: appointment?.meetingType,
              place:
                appointment?.meetingType === "ONLINE"
                  ? `${appointment?.meetUrl}`
                  : `${appointment?.address}`,
              studentName:
                appointment?.studentInfo?.profile?.fullName || "No name",
              studentImage:
                appointment?.studentInfo?.profile?.avatarLink || "Image-url",
              studentEmail: appointment?.studentInfo?.email,
              studentGender: appointment?.studentInfo?.profile?.gender,
              studentCode: appointment?.studentInfo?.studentCode,
              studentPhone: appointment?.studentInfo?.profile?.phoneNumber,
              studentSpecialization:
                appointment?.studentInfo?.specialization?.name,
              status: appointment?.status,
              feedback: appointment?.appointmentFeedback,
              havingReport: appointment?.havingReport,
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
            dotColor: "#F39300"
            // dotColor: selectedDate === item.title ? "white" : "#F39300",
          };
        });
        setMarkedDates(marked);
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to request.",
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

  const handleOpenInfo = (info) => {
    setInfo(info);
    setOpenInfo(true);
  };

  const handleOpenUpdateAppointment = async (id, method, value) => {
    setOpenUpdate(true);
    setSelectedAppointment(id);
    setMethod(method);
    setValue(value);
  };

  const handleOpenTakeAttendance = async (id, value) => {
    setOpenAttendance(true);
    setSelectedAppointment(id);
    setValue(value);
  };

  const reportData = {
    consultationGoal: {
      specificGoal: "Improve communication skills",
      reason: "Student is facing difficulties in team projects",
    },
    consultationContent: {
      summaryOfDiscussion: "Discussed strategies for effective communication",
      mainIssues: "Lack of confidence, language barriers",
      studentEmotions: "Anxious, willing to improve",
      studentReactions: "Responsive, asked insightful questions",
    },
    consultationConclusion: {
      counselorConclusion: "Recommended joining a communication workshop",
      followUpNeeded: true,
      followUpNotes: "Schedule a follow-up in one month",
    },
    intervention: {
      type: "Workshop Enrollment",
      description:
        "Student should join a 2-week communication workshop to enhance skills",
    },
  };

  const handleOpenReport = async () => {
    setOpenReport(true);
  };

  const handleUpdateAppointment = async () => {
    try {
      const dataToSend =
        method === "ONLINE" ? { meetUrl: value } : { address: value };
      const response = await axiosJWT.put(
        `${BASE_URL}/booking-counseling/${selectedAppointment}/update-details`,
        dataToSend
      );
      const data = await response.data;
      if (data && data.status == 200) {
        setInfo({
          ...info,
          place: value,
        });
        handleCloseUpdateAppointment();
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to update appoinment.",
          onPress: () => {
            Toast.hide();
          },
        });
      }
    } catch (err) {
      console.log("Can't update appointment", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Can't update appointment",
      });
    }
  };

  const handleTakeAttendance = async () => {
    try {
      const response = await axiosJWT.put(
        `${BASE_URL}/booking-counseling/take-attendance/${selectedAppointment}/${value}`
      );
      const data = await response.data;
      if (data && data.status == 200) {
        handleCloseTakeAttendance();
      }
    } catch (err) {
      console.log("Can't take attendance on this appointment", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Can't take attendance on this appointment",
      });
    }
  };

  const handleCloseUpdateAppointment = () => {
    setMethod("");
    setValue("");
    setSelectedAppointment(null);
    setOpenUpdate(false);
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

  const handleCloseTakeAttendance = () => {
    setSelectedAppointment(null);
    setValue(null);
    setOpenAttendance(false);
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

  const handleCloseInfo = () => {
    setInfo("");
    setOpenInfo(false);
  };

  const handleCloseReport = () => {
    setOpenReport(false);
  };

  const renderItem = ({ item }) => (
    <>
      <TouchableOpacity
        onPress={() => handleOpenInfo(item)}
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
            source={{ uri: item.studentImage }}
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
              {item.studentName}
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
            <TouchableOpacity
              onPress={() => handleOpenTakeAttendance(item.id, item.status)}
              disabled={new Date().toISOString().split("T")[0] > item.date}
              activeOpacity={0.6}
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
              <MaterialIcons name="edit-calendar" size={20} color="gray" />
              <Text style={{ fontSize: 16, marginHorizontal: 6 }}>-</Text>
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
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </>
  );

  // const handleMonthChange = (newDate) => {
  //   const startOfWeek = new Date(newDate.dateString);
  //   const endOfWeek = new Date(startOfWeek);
  //   endOfWeek.setDate(startOfWeek.getDate() + 31);
  //   startOfWeek.setDate(startOfWeek.getDate() - 31);

  //   const fromDate = startOfWeek.toISOString().split("T")[0];
  //   const toDate = endOfWeek.toISOString().split("T")[0];

  //   fetchData(fromDate, toDate);
  // };

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
                selectedDayTextColor: "black",
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
            visible={openAttendance}
            animationType="slide"
            onRequestClose={handleCloseTakeAttendance}
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
                  borderRadius: 15,
                  elevation: 10,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 22,
                      fontWeight: "bold",
                      textAlign: "center",
                      color: "#333",
                    }}
                  >
                    Take Attendance
                  </Text>
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#ededed",
                      padding: 6,
                      borderRadius: 30,
                      alignSelf: "flex-end",
                    }}
                    onPress={handleCloseTakeAttendance}
                  >
                    <Ionicons name="close" size={24} />
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={statusOptions}
                  keyExtractor={(item) => item}
                  numColumns={2}
                  columnWrapperStyle={{ justifyContent: "space-between" }}
                  renderItem={({ item }) => {
                    const isSelected = item === value;
                    const itemColor = item === "ATTEND" ? "green" : "red";
                    return (
                      <TouchableOpacity
                        onPress={() => setValue(item)}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginVertical: 6,
                          paddingHorizontal: 20,
                        }}
                      >
                        <Ionicons
                          name={
                            isSelected ? "radio-button-on" : "radio-button-off"
                          }
                          size={22}
                          color={isSelected ? itemColor : "gray"}
                          style={{ marginRight: 8 }}
                        />
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: isSelected ? "600" : "400",
                            color: isSelected ? itemColor : "black",
                          }}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                />
                <TouchableOpacity
                  onPress={handleTakeAttendance}
                  style={{
                    marginTop: 20,
                    backgroundColor: "#F39300",
                    paddingVertical: 8,
                    borderRadius: 10,
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: 18,
                    }}
                  >
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <Modal
            transparent={true}
            visible={openInfo}
            animationType="slide"
            onRequestClose={handleCloseInfo}
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
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#ededed",
                      padding: 4,
                      marginHorizontal: 20,
                      marginTop: 16,
                      marginBottom: 8,
                      borderRadius: 20,
                      alignSelf: "flex-start",
                      alignItems: "flex-start",
                    }}
                    onPress={handleCloseInfo}
                  >
                    <Ionicons name="chevron-back" size={28} />
                  </TouchableOpacity>
                  {info?.status != "WAITING" && (
                    <TouchableOpacity
                      style={{
                        backgroundColor: "white",
                        padding: 4,
                        marginHorizontal: 20,
                        marginTop: 16,
                        marginBottom: 8,
                        borderRadius: 10,
                        alignSelf: "flex-end",
                        alignItems: "flex-end",
                      }}
                      onPress={handleOpenReport}
                    >
                      <Ionicons name="newspaper" size={28} color="#F39300" />
                    </TouchableOpacity>
                  )}
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View
                    style={{
                      flexDirection: "row",
                      padding: 16,
                      backgroundColor: "white",
                      borderRadius: 12,
                      marginVertical: 20,
                      marginHorizontal: 20,
                      elevation: 1,
                      borderWidth: 1.5,
                      borderColor: "#e3e3e3",
                    }}
                  >
                    <View style={{ width: "40%" }}>
                      <View style={{ position: "relative" }}>
                        <Image
                          source={{ uri: info?.studentImage }}
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
                              info?.studentGender == "MALE" ? "male" : "female"
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
                        {info?.studentName}
                      </Text>
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: "500",
                          color: "#333",
                          marginBottom: 2,
                        }}
                      >
                        {info?.studentSpecialization}
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          color: "grey",
                          marginBottom: 2,
                        }}
                      >
                        ID: {info?.studentCode}
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          color: "grey",
                        }}
                      >
                        Phone: {info?.studentPhone}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      marginHorizontal: 20,
                      borderRadius: 20,
                      backgroundColor: "white",
                      paddingVertical: 12,
                      paddingHorizontal: 20,
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
                          borderRadius: 18,
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
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-start",
                        }}
                      >
                        {info.meetingType === "ONLINE" && (
                          <Ionicons name="videocam" size={24} color="#F39300" />
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
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "flex-end",
                          maxWidth: "45%",
                        }}
                      >
                        {info.date + "T" + info.startTime >
                          new Date().toISOString() &&
                          info?.status === "WAITING" && (
                            <View
                              style={{
                                flexDirection: "row",
                                marginHorizontal: 8,
                              }}
                            >
                              <TouchableOpacity
                                onPress={() =>
                                  handleOpenUpdateAppointment(
                                    info.id,
                                    info.meetingType,
                                    info.place
                                  )
                                }
                              >
                                <MaterialIcons
                                  name="edit-note"
                                  size={24}
                                  color="#F39300"
                                />
                              </TouchableOpacity>
                              <Modal
                                transparent={true}
                                visible={openUpdate}
                                animationType="fade"
                                onRequestClose={handleCloseUpdateAppointment}
                              >
                                <View
                                  style={{
                                    flex: 1,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    backgroundColor: "rgba(0, 0, 0, 0.1)",
                                  }}
                                >
                                  <View
                                    style={{
                                      width: width * 0.8,
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
                                        marginBottom: 10,
                                        textAlign: "center",
                                      }}
                                    >
                                      Update Confirmation
                                    </Text>
                                    <Text
                                      style={{
                                        fontSize: 18,
                                        marginBottom: 30,
                                        textAlign: "left",
                                      }}
                                    >
                                      Are you sure you want to update this
                                      appointment? Your schedule will be updated
                                    </Text>
                                    <Text
                                      style={{
                                        fontSize: 16,
                                        marginBottom: 10,
                                        fontWeight: "600",
                                      }}
                                    >
                                      Please provide the meeting
                                      {info.meetingType === "ONLINE"
                                        ? "'s Google Meet URL"
                                        : "'s address"}{" "}
                                      <Text
                                        style={{
                                          color: "#F39300",
                                          fontSize: 20,
                                        }}
                                      >
                                        *
                                      </Text>
                                    </Text>
                                    <View>
                                      <TextInput
                                        placeholder="Input here"
                                        placeholderTextColor="gray"
                                        keyboardType="default"
                                        value={value}
                                        onChangeText={(value) =>
                                          setValue(value)
                                        }
                                        style={{
                                          fontWeight: "600",
                                          fontSize: 16,
                                          opacity: 0.8,
                                          paddingVertical: 8,
                                          textAlignVertical: "center",
                                          paddingHorizontal: 12,
                                          backgroundColor: "#ededed",
                                          borderColor: "gray",
                                          borderWidth: 1,
                                          borderRadius: 10,
                                          marginBottom: 20,
                                        }}
                                      />
                                    </View>
                                    <View
                                      style={{
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <TouchableOpacity
                                        style={{
                                          flex: 1,
                                          backgroundColor: "#ededed",
                                          padding: 10,
                                          borderRadius: 10,
                                          marginRight: 10,
                                          justifyContent: "center",
                                          alignItems: "center",
                                          borderWidth: 1,
                                          borderColor: "gray",
                                        }}
                                        onPress={handleCloseUpdateAppointment}
                                      >
                                        <Text
                                          style={{
                                            fontSize: 18,
                                            color: "#333",
                                            fontWeight: "600",
                                          }}
                                        >
                                          No
                                        </Text>
                                      </TouchableOpacity>
                                      <TouchableOpacity
                                        style={{
                                          flex: 1,
                                          backgroundColor: "#F39300",
                                          padding: 10,
                                          borderRadius: 10,
                                          justifyContent: "center",
                                          alignItems: "center",
                                        }}
                                        onPress={handleUpdateAppointment}
                                      >
                                        <Text
                                          style={{
                                            fontSize: 18,
                                            color: "white",
                                            fontWeight: "600",
                                          }}
                                        >
                                          Yes
                                        </Text>
                                      </TouchableOpacity>
                                    </View>
                                  </View>
                                </View>
                              </Modal>
                            </View>
                          )}
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: "bold",
                            color: "#333",
                          }}
                        >
                          {info.place}
                        </Text>
                        {/* {info.meetingType === "ONLINE" && (
                          <Ionicons
                            name="open"
                            size={20}
                            style={{
                              color: "grey",
                              marginLeft: 8,
                              marginTop: 2,
                            }}
                            onPress={() => {
                              openURL(`https://meet.google.com/${info.place}`);
                            }}
                          />
                        )} */}
                      </View>
                    </View>
                  </View>
                  {info?.feedback !== null ? (
                    <View
                      style={{
                        margin: 20,
                        borderRadius: 20,
                        backgroundColor: "white",
                        padding: 16,
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
                            style={{ color: "#F39300", fontWeight: "bold" }}
                          >
                            {info.studentName}
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
                        margin: 20,
                        borderRadius: 20,
                        backgroundColor: "white",
                        padding: 16,
                        elevation: 1,
                        borderWidth: 1.5,
                        borderColor: "#e3e3e3",
                        flexDirection: "row",
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
                        There's no feedback yet
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            </View>
          </Modal>
          <Modal
            transparent={true}
            visible={openReport}
            animationType="slide"
            onRequestClose={handleCloseReport}
          >
            <View
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#f5f7fd",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <TouchableOpacity
                  style={{
                    backgroundColor: "#ededed",
                    padding: 4,
                    marginHorizontal: 20,
                    marginTop: 16,
                    marginBottom: 8,
                    borderRadius: 20,
                    alignSelf: "flex-start",
                    alignItems: "flex-start",
                  }}
                  onPress={handleCloseReport}
                >
                  <Ionicons name="chevron-back" size={28} />
                </TouchableOpacity>
                <View style={{ flex: 3, justifyContent: "center" }}>
                  <Text
                    style={{
                      color: "#F39300",
                      fontSize: 20,
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    Counseling Report
                  </Text>
                </View>
                <View style={{ flex: 1 }} />
              </View>
              <ScrollView
                style={{
                  flex: 1,
                  paddingHorizontal: 20,
                  marginVertical: 12,
                }}
                showsVerticalScrollIndicator={false}
              >
                <View
                  style={{
                    backgroundColor: "#F39300",
                    paddingHorizontal: 8,
                    paddingVertical: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "white",
                    }}
                  >
                    Consultation Goal
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: "#ededed",
                    padding: 8,
                    marginBottom: 16,
                  }}
                >
                  <Text
                    style={{ fontSize: 16, color: "#333", marginBottom: 8 }}
                  >
                    <Text style={{ fontWeight: "600" }}>• Specific Goal:</Text>
                    {"\n"}
                    {reportData.consultationGoal.specificGoal}
                  </Text>
                  <Text
                    style={{ fontSize: 16, color: "#333", marginBottom: 8 }}
                  >
                    <Text style={{ fontWeight: "600" }}>• Reason:</Text>
                    {"\n"}
                    {reportData.consultationGoal.reason}
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: "#F39300",
                    paddingHorizontal: 8,
                    paddingVertical: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: "white",
                    }}
                  >
                    Consultation Content
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: "#ededed",
                    padding: 8,
                    marginBottom: 16,
                  }}
                >
                  <Text
                    style={{ fontSize: 16, color: "#333", marginBottom: 8 }}
                  >
                    <Text style={{ fontWeight: "600" }}>
                      • Summary of Discussion:
                    </Text>
                    {"\n"}
                    {reportData.consultationContent.summaryOfDiscussion}
                  </Text>
                  <Text
                    style={{ fontSize: 16, color: "#333", marginBottom: 8 }}
                  >
                    <Text style={{ fontWeight: "600" }}>• Main Issues:</Text>
                    {"\n"}
                    {reportData.consultationContent.mainIssues}
                  </Text>
                  <Text
                    style={{ fontSize: 16, color: "#333", marginBottom: 8 }}
                  >
                    <Text style={{ fontWeight: "600" }}>
                      • Student Emotions:
                    </Text>
                    {"\n"}
                    {reportData.consultationContent.studentEmotions}
                  </Text>
                  <Text
                    style={{ fontSize: 16, color: "#333", marginBottom: 8 }}
                  >
                    <Text style={{ fontWeight: "600" }}>
                      • Student Reactions:
                    </Text>
                    {"\n"}
                    {reportData.consultationContent.studentReactions}
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: "#F39300",
                    paddingHorizontal: 8,
                    paddingVertical: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: "white",
                    }}
                  >
                    Consultation Conclusion
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: "#ededed",
                    padding: 8,
                    marginBottom: 16,
                  }}
                >
                  <Text
                    style={{ fontSize: 16, color: "#333", marginBottom: 8 }}
                  >
                    <Text style={{ fontWeight: "600" }}>
                      • Counselor Conclusion:
                    </Text>
                    {"\n"}
                    {reportData.consultationConclusion.counselorConclusion}
                  </Text>
                  <Text
                    style={{ fontSize: 16, color: "#333", marginBottom: 8 }}
                  >
                    <Text style={{ fontWeight: "600" }}>
                      • Follow-up Needed:
                    </Text>
                    {"\n"}
                    {reportData.consultationConclusion.followUpNeeded
                      ? "Yes"
                      : "No"}
                  </Text>
                  {reportData.consultationConclusion.followUpNeeded && (
                    <Text
                      style={{ fontSize: 16, color: "#333", marginBottom: 8 }}
                    >
                      <Text style={{ fontWeight: "600" }}>
                        • Follow-up Notes:
                      </Text>
                      {"\n"}
                      {reportData.consultationConclusion.followUpNotes}
                    </Text>
                  )}
                </View>

                <View
                  style={{
                    backgroundColor: "#F39300",
                    paddingHorizontal: 8,
                    paddingVertical: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: "white",
                    }}
                  >
                    Intervention
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: "#ededed",
                    padding: 8,
                    marginBottom: 16,
                  }}
                >
                  <Text
                    style={{ fontSize: 16, color: "#333", marginBottom: 8 }}
                  >
                    <Text style={{ fontWeight: "600" }}>• Type:</Text>
                    {"\n"}
                    {reportData.intervention.type}
                  </Text>
                  <Text
                    style={{ fontSize: 16, color: "#333", marginBottom: 8 }}
                  >
                    <Text style={{ fontWeight: "600" }}>• Description:</Text>
                    {"\n"}
                    {reportData.intervention.description}
                  </Text>
                </View>
              </ScrollView>
            </View>
          </Modal>
        </View>
      </View>
    </>
  );
}

{
  /* <Agenda
            items={items}
            selected={selectedDate}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            renderItem={(item) => {
              return (
                <TouchableOpacity
                  style={{
                    backgroundColor: "white",
                    borderRadius: 12,
                    padding: 16,
                    marginRight: 16,
                    marginTop: 12,
                    borderWidth: 1,
                    borderColor: "#F39300",
                    elevation: 2,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "400",
                        color: "#333",
                      }}
                    >
                      {item.time}
                    </Text>
                    <View
                      style={{
                        backgroundColor: "#F39300",
                        borderRadius: 20,
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        marginLeft: 12,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "bold",
                          color: "white",
                        }}
                      >
                        {item.meetingType}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{
                      fontSize: 18,
                      marginTop: 8,
                      color: "#333",
                      fontWeight: "500",
                    }}
                  >
                    {item.place}
                  </Text>
                  <View
                    style={{
                      justifyContent: "flex-end",
                      flexDirection: "row",
                      flex: 1,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        color: "#333",
                        verticalAlign: "middle",
                        opacity: 0.7,
                        marginRight: 20,
                      }}
                    >
                      {item.studentName}
                    </Text>
                    <Image
                      source={{ uri: item.studentImage }}
                      style={{
                        width: width * 0.08,
                        height: height * 0.048,      
                        borderRadius: 40,
                      }}
                    />
                  </View>
                </TouchableOpacity>
              );
            }}
            renderEmptyData={() => {
              return (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 20,
                  }}
                >
                  <Text
                    style={{ fontSize: 24, fontWeight: "600", opacity: 0.6 }}
                  >
                    No Schedule
                  </Text>
                </View>
              );
            }}
            rowHasChanged={(r1, r2) => {
              return r1.name !== r2.name;
            }}
            pastScrollRange={2}
            futureScrollRange={4}
            theme={{
              calendarBackground: "white",
              agendaDayTextColor: "black",
              agendaDayNumColor: "black",
              agendaTodayColor: "#F39300",
              agendaKnobColor: "#e3e3e3",
              monthTextColor: "#F39300",
              dotColor: "#F39300",
              selectedDayBackgroundColor: "#F39300",
              selectedDayTextColor: "white",
              todayTextColor: "#F39300",
            }}
            renderArrow={(direction) => {
              return direction === "left" ? (
                <Ionicons
                  name="caret-back-circle-outline"
                  size={30}
                  color="#F39300"
                />
              ) : (
                <Ionicons
                  name="caret-forward-circle-outline"
                  size={30}
                  color="#F39300"
                />
              );
            }}
          /> */
}
