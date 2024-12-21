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
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import {
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
import StudentInfoModal from "../../layout/StudentInfoModal";

export default function Schedule() {
  const navigation = useNavigation();
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
  const [openStudentInfo, setOpenStudentInfo] = useState(false);
  const [selectedStudentInfo, setSelectedStudentInfo] = useState(null);
  const [openReport, setOpenReport] = useState(false);
  const [report, setReport] = useState(null);
  const [openCreateReport, setOpenCreateReport] = useState(false);
  const [formValues, setFormValues] = useState({
    intervention: {
      type: "",
      description: "",
    },
    consultationGoal: {
      specificGoal: "",
      reason: "",
    },
    consultationContent: {
      summaryOfDiscussion: "",
      mainIssues: "",
      studentEmotions: "",
      studentReactions: "",
    },
    consultationConclusion: {
      counselorConclusion: "",
      followUpNeeded: false,
      followUpNotes: "",
    },
  });
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openAttendance, setOpenAttendance] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [method, setMethod] = useState("");
  const [value, setValue] = useState("");

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
              studentId: appointment?.studentInfo?.id,
              studentName:
                appointment?.studentInfo?.profile?.fullName || "No name",
              studentImage:
                appointment?.studentInfo?.profile?.avatarLink || "Image-url",
              studentEmail: appointment?.studentInfo?.email,
              studentGender: appointment?.studentInfo?.profile?.gender,
              studentCode: appointment?.studentInfo?.studentCode,
              studentPhone: appointment?.studentInfo?.profile?.phoneNumber,
              studentMajor: appointment?.studentInfo?.major?.name,
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
            dotColor: "#F39300",
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

  const handleUpdateAppointment = async () => {
    try {
      if (method === "ONLINE") {
        const validFormat = /^https:\/\/meet\.google\.com\//;
        if (!validFormat.test(value)) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "This isn't a valid meeting URL.",
            onPress: () => {
              Toast.hide();
            },
          });
          return;
        }
      }
      const dataToSend =
        method === "ONLINE"
          ? { meetUrl: value, address: "" }
          : { meetUrl: "", address: value };
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
    setValue("");
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

  const fetchAppointmentReport = async () => {
    try {
      const reportRes = await axiosJWT.get(
        `${BASE_URL}/appointments/report/${selectedAppointment}`
      );
      const reportData = reportRes.data.content;
      setReport(reportData);
    } catch (err) {
      console.log("Can't fetch appointment report", err);
    }
  };

  const handleCreateAppointmentReport = async () => {
    try {
      const reportRes = await axiosJWT.post(
        `${BASE_URL}/appointments/report/${selectedAppointment}`,
        {
          ...formValues,
        }
      );
      setOpenCreateReport(false);
      setFormValues({
        intervention: {
          type: "",
          description: "",
        },
        consultationGoal: {
          specificGoal: "",
          reason: "",
        },
        consultationContent: {
          summaryOfDiscussion: "",
          mainIssues: "",
          studentEmotions: "",
          studentReactions: "",
        },
        consultationConclusion: {
          counselorConclusion: "",
          followUpNeeded: false,
          followUpNotes: "",
        },
      });
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Appointment Report created",
      });
      setInfo((prevInfo) => ({ ...prevInfo, havingReport: true }));
    } catch (err) {
      console.log("Can't create appointment report", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Can't create appointment report",
      });
    }
  };

  useEffect(() => {
    if (selectedAppointment && openReport) {
      fetchAppointmentReport();
    }
  }, [selectedAppointment, openReport]);

  const renderItem = ({ item }) => (
    <>
      <TouchableOpacity
        onPress={() => (
          setInfo(item), setOpenInfo(true), setSelectedAppointment(item.id)
        )}
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
              disabled={item.date < new Date().toISOString().split("T")[0]}
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
              {item.date >= new Date().toISOString().split("T")[0] && (
                <>
                  <MaterialIcons name="edit-calendar" size={20} color="gray" />
                  <Text style={{ fontSize: 16, marginHorizontal: 6 }}>-</Text>
                </>
              )}
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
            visible={openAttendance}
            animationType="slide"
            onRequestClose={handleCloseTakeAttendance}
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
                <View
                  style={{
                    flexDirection: "row",
                  }}
                >
                  {["ABSENT", "ATTEND"].map((item) => {
                    const isSelected = item === value;
                    const itemColor = item === "ATTEND" ? "green" : "red";
                    return (
                      <TouchableOpacity
                        key={item}
                        onPress={() => setValue(item)}
                        style={{
                          flex: 0.5,
                          flexDirection: "row",
                          alignItems: "center",
                          marginVertical: 6,
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
                  })}
                </View>
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
            onRequestClose={() => setOpenInfo(false)}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "flex-end",
                alignItems: "center",
                backgroundColor: "rgba(0, 0, 0, 0.1)",
              }}
            >
              <View
                style={{
                  width: "100%",
                  height: "90%",
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
                    onPress={() => (setOpenInfo(false), setInfo(""))}
                  >
                    <Ionicons name="chevron-back" size={28} />
                  </TouchableOpacity>
                  <View
                    style={{
                      flexDirection: "row",
                      alignSelf: "flex-end",
                      alignItems: "flex-end",
                    }}
                  >
                    {info?.havingReport == false &&
                      info?.status == "ATTEND" && (
                        <TouchableOpacity
                          style={{
                            backgroundColor: "#F39300",
                            padding: 4,
                            marginTop: 16,
                            marginBottom: 8,
                            borderRadius: 20,
                          }}
                          onPress={() => setOpenCreateReport(true)}
                        >
                          <Ionicons name="add" size={28} color="white" />
                        </TouchableOpacity>
                      )}
                    {info?.status == "ATTEND" && (
                      <TouchableOpacity
                        style={{
                          backgroundColor: "white",
                          padding: 4,
                          marginLeft: 8,
                          marginRight: 20,
                          marginTop: 16,
                          marginBottom: 8,
                          borderRadius: 20,
                        }}
                        onPress={() => setOpenReport(true)}
                      >
                        <Ionicons name="newspaper" size={28} color="#F39300" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
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
                        setOpenStudentInfo(true),
                        setSelectedStudentInfo(info?.studentId)
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
                                info?.studentGender == "MALE"
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
                          {info?.studentMajor}
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
                    </TouchableOpacity>
                    <View
                      style={{
                        marginBottom: 20,
                        padding: 16,
                        backgroundColor: "white",
                        borderRadius: 12,
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
                        backgroundColor: "white",
                        borderRadius: 10,
                        padding: 20,
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
                          style={{
                            flexDirection: "row",
                            alignItems: "flex-start",
                          }}
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
                                        appointment? Your schedule will be
                                        updated
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
                          <TouchableOpacity
                            disabled={info.meetingType !== "ONLINE"}
                            onPress={() => {
                              if (
                                info.date + "T" + info.startTime <=
                                new Date().toISOString() <=
                                info.date + "T" + info.endTime
                              ) {
                                Linking.openURL(`${info.place}`).catch(
                                  (err) => {
                                    console.log("Can't open this link", err);
                                    Toast.show({
                                      type: "error",
                                      text1: "Error",
                                      text2: "Can't open this link",
                                      onPress: () => {
                                        Toast.hide();
                                      },
                                    });
                                  }
                                );
                              } else {
                                Toast.show({
                                  type: "error",
                                  text1: "Error",
                                  text2: "The meeting time hasn't started yet",
                                  onPress: () => {
                                    Toast.hide();
                                  },
                                });
                              }
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 18,
                                fontWeight: "bold",
                                color:
                                  info.meetingType === "ONLINE" &&
                                  !(
                                    info.date + "T" + info.startTime <=
                                    new Date().toISOString() <=
                                    info.date + "T" + info.endTime
                                  )
                                    ? "gray"
                                    : info.meetingType === "ONLINE"
                                    ? "#F39300"
                                    : "#333",
                                textDecorationLine:
                                  info.meetingType === "ONLINE"
                                    ? "underline"
                                    : "none",
                              }}
                            >
                              {info.meetingType === "ONLINE"
                                ? "Meet URL"
                                : info.place}
                            </Text>
                          </TouchableOpacity>
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
                              openURL(`${info.place}`);
                            }}
                          />
                        )} */}
                        </View>
                      </View>
                    </View>
                    {info?.feedback !== null ? (
                      <View
                        style={{
                          backgroundColor: "white",
                          borderRadius: 10,
                          padding: 20,
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
                          backgroundColor: "white",
                          borderRadius: 10,
                          padding: 20,
                          marginBottom: 20,
                          elevation: 1,
                          borderWidth: 1.5,
                          borderColor: "#e3e3e3",
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
                  </View>
                </ScrollView>
              </View>
            </View>
          </Modal>
          <StudentInfoModal
            openStudentInfo={openStudentInfo}
            setOpenStudentInfo={setOpenStudentInfo}
            selectedStudentInfo={selectedStudentInfo}
            setSelectedStudentInfo={setSelectedStudentInfo}
          />
          <Modal
            transparent={true}
            visible={openReport}
            animationType="slide"
            onRequestClose={() => setOpenReport(false)}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "flex-end",
                alignItems: "center",
                backgroundColor: "rgba(0, 0, 0, 0.1)",
              }}
            >
              <View
                style={{
                  width: "100%",
                  height: report ? "98%" : "20%",
                  backgroundColor: "#f5f7fd",
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                }}
              >
                <View
                  style={{
                    backgroundColor: "#F39300",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "white",
                    }}
                  >
                    Appointment Report
                  </Text>
                  <TouchableOpacity
                    style={{
                      backgroundColor: "white",
                      padding: 4,
                      borderRadius: 20,
                    }}
                    onPress={() => (
                      setOpenReport(false), setSelectedAppointment(null)
                    )}
                  >
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>
                {report ? (
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
                        borderTopLeftRadius: 10,
                        borderTopRightRadius: 10,
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
                        backgroundColor: "white",
                        padding: 8,
                        marginBottom: 16,
                        borderLeftWidth: 1.5,
                        borderRightWidth: 1.5,
                        borderBottomWidth: 1.5,
                        borderColor: "#e3e3e3",
                        borderBottomLeftRadius: 10,
                        borderBottomRightRadius: 10,
                      }}
                    >
                      <Text
                        style={{ fontSize: 16, color: "#333", marginBottom: 8 }}
                      >
                        <Text style={{ fontWeight: "600" }}>• Type:</Text>
                        {"\n"}
                        {report.intervention.type}
                      </Text>
                      <Text
                        style={{ fontSize: 16, color: "#333", marginBottom: 8 }}
                      >
                        <Text style={{ fontWeight: "600" }}>
                          • Description:
                        </Text>
                        {"\n"}
                        {report.intervention.description}
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: "#F39300",
                        paddingHorizontal: 8,
                        paddingVertical: 6,
                        borderTopLeftRadius: 10,
                        borderTopRightRadius: 10,
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
                        backgroundColor: "white",
                        padding: 8,
                        marginBottom: 16,
                        borderLeftWidth: 1.5,
                        borderRightWidth: 1.5,
                        borderBottomWidth: 1.5,
                        borderColor: "#e3e3e3",
                        borderBottomLeftRadius: 10,
                        borderBottomRightRadius: 10,
                      }}
                    >
                      <Text
                        style={{ fontSize: 16, color: "#333", marginBottom: 8 }}
                      >
                        <Text style={{ fontWeight: "600" }}>
                          • Specific Goal:
                        </Text>
                        {"\n"}
                        {report.consultationGoal.specificGoal}
                      </Text>
                      <Text
                        style={{ fontSize: 16, color: "#333", marginBottom: 8 }}
                      >
                        <Text style={{ fontWeight: "600" }}>• Reason:</Text>
                        {"\n"}
                        {report.consultationGoal.reason}
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: "#F39300",
                        paddingHorizontal: 8,
                        paddingVertical: 6,
                        borderTopLeftRadius: 10,
                        borderTopRightRadius: 10,
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
                        backgroundColor: "white",
                        padding: 8,
                        marginBottom: 16,
                        borderLeftWidth: 1.5,
                        borderRightWidth: 1.5,
                        borderBottomWidth: 1.5,
                        borderColor: "#e3e3e3",
                        borderBottomLeftRadius: 10,
                        borderBottomRightRadius: 10,
                      }}
                    >
                      <Text
                        style={{ fontSize: 16, color: "#333", marginBottom: 8 }}
                      >
                        <Text style={{ fontWeight: "600" }}>
                          • Summary of Discussion:
                        </Text>
                        {"\n"}
                        {report.consultationContent.summaryOfDiscussion}
                      </Text>
                      <Text
                        style={{ fontSize: 16, color: "#333", marginBottom: 8 }}
                      >
                        <Text style={{ fontWeight: "600" }}>
                          • Main Issues:
                        </Text>
                        {"\n"}
                        {report.consultationContent.mainIssues}
                      </Text>
                      <Text
                        style={{ fontSize: 16, color: "#333", marginBottom: 8 }}
                      >
                        <Text style={{ fontWeight: "600" }}>
                          • Student Emotions:
                        </Text>
                        {"\n"}
                        {report.consultationContent.studentEmotions}
                      </Text>
                      <Text
                        style={{ fontSize: 16, color: "#333", marginBottom: 8 }}
                      >
                        <Text style={{ fontWeight: "600" }}>
                          • Student Reactions:
                        </Text>
                        {"\n"}
                        {report.consultationContent.studentReactions}
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: "#F39300",
                        paddingHorizontal: 8,
                        paddingVertical: 6,
                        borderTopLeftRadius: 10,
                        borderTopRightRadius: 10,
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
                        backgroundColor: "white",
                        padding: 8,
                        marginBottom: 16,
                        borderLeftWidth: 1.5,
                        borderRightWidth: 1.5,
                        borderBottomWidth: 1.5,
                        borderColor: "#e3e3e3",
                        borderBottomLeftRadius: 10,
                        borderBottomRightRadius: 10,
                      }}
                    >
                      <Text
                        style={{ fontSize: 16, color: "#333", marginBottom: 8 }}
                      >
                        <Text style={{ fontWeight: "600" }}>
                          • Counselor Conclusion:
                        </Text>
                        {"\n"}
                        {report.consultationConclusion.counselorConclusion}
                      </Text>
                      <Text
                        style={{ fontSize: 16, color: "#333", marginBottom: 8 }}
                      >
                        <Text style={{ fontWeight: "600" }}>
                          • Follow-up Needed:
                        </Text>
                        {"\n"}
                        {report.consultationConclusion.followUpNeeded
                          ? "Yes"
                          : "No"}
                      </Text>
                      {report.consultationConclusion.followUpNeeded && (
                        <Text
                          style={{
                            fontSize: 16,
                            color: "#333",
                            marginBottom: 8,
                          }}
                        >
                          <Text style={{ fontWeight: "600" }}>
                            • Follow-up Notes:
                          </Text>
                          {"\n"}
                          {report.consultationConclusion.followUpNotes}
                        </Text>
                      )}
                    </View>
                  </ScrollView>
                ) : (
                  <View
                    style={{
                      flex: 1,
                      alignItems: "center",
                      marginTop: 20,
                    }}
                  >
                    <Text style={{ fontWeight: "bold", fontSize: 20 }}>
                      This appointment has no report yet
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Modal>
          <Modal
            transparent={true}
            visible={openCreateReport}
            animationType="slide"
            onRequestClose={() => setOpenCreateReport(false)}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "flex-end",
                alignItems: "center",
                backgroundColor: "rgba(0, 0, 0, 0.1)",
              }}
            >
              <View
                style={{
                  width: "100%",
                  height: "90%",
                  backgroundColor: "#f5f7fd",
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                }}
              >
                <View
                  style={{
                    backgroundColor: "#F39300",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "white",
                    }}
                  >
                    Create Report
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={{
                      backgroundColor: "white",
                      padding: 4,
                      borderRadius: 20,
                    }}
                    onPress={() => setOpenCreateReport(false)}
                  >
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 20 }}
                >
                  <View style={{ marginVertical: 10 }}>
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: 18,
                        marginBottom: 10,
                        color: "#F39300",
                      }}
                    >
                      Intervention
                    </Text>
                    <Text
                      style={{
                        color: "#333",
                        fontWeight: "bold",
                        fontSize: 16,
                        marginBottom: 4,
                      }}
                    >
                      Type:
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        marginVertical: 4,
                        backgroundColor: "#ededed",
                        borderRadius: 10,
                        borderColor: "gray",
                        borderWidth: 1,
                      }}
                    >
                      <TextInput
                        style={{
                          flex: 1,
                          fontSize: 18,
                          opacity: 0.8,
                        }}
                        placeholder="Input here"
                        value={formValues.intervention.type}
                        onChangeText={(text) =>
                          setFormValues((prevFormValues) => ({
                            ...prevFormValues,
                            intervention: {
                              ...prevFormValues.intervention,
                              type: text,
                            },
                          }))
                        }
                      />
                      {formValues.intervention.type !== "" && (
                        <TouchableOpacity
                          onPress={() =>
                            setFormValues((prevFormValues) => ({
                              ...prevFormValues,
                              intervention: {
                                ...prevFormValues.intervention,
                                type: "",
                              },
                            }))
                          }
                        >
                          <Ionicons
                            name="close"
                            size={28}
                            style={{
                              color: "#F39300",
                              opacity: 0.7,
                            }}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text
                      style={{
                        color: "#333",
                        fontWeight: "bold",
                        fontSize: 16,
                        marginBottom: 4,
                      }}
                    >
                      Description:
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        marginVertical: 4,
                        backgroundColor: "#ededed",
                        borderRadius: 10,
                        borderColor: "gray",
                        borderWidth: 1,
                      }}
                    >
                      <TextInput
                        style={{
                          flex: 1,
                          fontSize: 18,
                          opacity: 0.8,
                        }}
                        placeholder="Input here"
                        value={formValues.intervention.description}
                        onChangeText={(text) =>
                          setFormValues((prevFormValues) => ({
                            ...prevFormValues,
                            intervention: {
                              ...prevFormValues.intervention,
                              description: text,
                            },
                          }))
                        }
                      />
                      {formValues.intervention.description !== "" && (
                        <TouchableOpacity
                          onPress={() =>
                            setFormValues((prevFormValues) => ({
                              ...prevFormValues,
                              intervention: {
                                ...prevFormValues.intervention,
                                description: "",
                              },
                            }))
                          }
                        >
                          <Ionicons
                            name="close"
                            size={28}
                            style={{
                              color: "#F39300",
                              opacity: 0.7,
                            }}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                  <View style={{ marginVertical: 10 }}>
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: 18,
                        marginBottom: 10,
                        color: "#F39300",
                      }}
                    >
                      Consultation Goal
                    </Text>
                    <Text
                      style={{
                        color: "#333",
                        fontWeight: "bold",
                        fontSize: 16,
                        marginBottom: 4,
                      }}
                    >
                      Specific Goal:
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        marginVertical: 4,
                        backgroundColor: "#ededed",
                        borderRadius: 10,
                        borderColor: "gray",
                        borderWidth: 1,
                      }}
                    >
                      <TextInput
                        style={{
                          flex: 1,
                          fontSize: 18,
                          opacity: 0.8,
                        }}
                        placeholder="Input here"
                        value={formValues.consultationGoal.specificGoal}
                        onChangeText={(text) =>
                          setFormValues((prevFormValues) => ({
                            ...prevFormValues,
                            consultationGoal: {
                              ...prevFormValues.consultationGoal,
                              specificGoal: text,
                            },
                          }))
                        }
                      />
                      {formValues.consultationGoal.specificGoal !== "" && (
                        <TouchableOpacity
                          onPress={() =>
                            setFormValues((prevFormValues) => ({
                              ...prevFormValues,
                              consultationGoal: {
                                ...prevFormValues.consultationGoal,
                                specificGoal: "",
                              },
                            }))
                          }
                        >
                          <Ionicons
                            name="close"
                            size={28}
                            style={{
                              color: "#F39300",
                              opacity: 0.7,
                            }}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text
                      style={{
                        color: "#333",
                        fontWeight: "bold",
                        fontSize: 16,
                        marginBottom: 4,
                      }}
                    >
                      Reason:
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        marginVertical: 4,
                        backgroundColor: "#ededed",
                        borderRadius: 10,
                        borderColor: "gray",
                        borderWidth: 1,
                      }}
                    >
                      <TextInput
                        style={{
                          flex: 1,
                          fontSize: 18,
                          opacity: 0.8,
                        }}
                        placeholder="Input here"
                        value={formValues.consultationGoal.reason}
                        onChangeText={(text) =>
                          setFormValues((prevFormValues) => ({
                            ...prevFormValues,
                            consultationGoal: {
                              ...prevFormValues.consultationGoal,
                              reason: text,
                            },
                          }))
                        }
                      />
                      {formValues.consultationGoal.reason !== "" && (
                        <TouchableOpacity
                          onPress={() =>
                            setFormValues((prevFormValues) => ({
                              ...prevFormValues,
                              consultationGoal: {
                                ...prevFormValues.consultationGoal,
                                reason: "",
                              },
                            }))
                          }
                        >
                          <Ionicons
                            name="close"
                            size={28}
                            style={{
                              color: "#F39300",
                              opacity: 0.7,
                            }}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                  <View style={{ marginVertical: 10 }}>
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: 18,
                        marginBottom: 10,
                        color: "#F39300",
                      }}
                    >
                      Consultation Content
                    </Text>
                    <Text
                      style={{
                        color: "#333",
                        fontWeight: "bold",
                        fontSize: 16,
                        marginBottom: 4,
                      }}
                    >
                      Summary of Discussion:
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        marginVertical: 4,
                        backgroundColor: "#ededed",
                        borderRadius: 10,
                        borderColor: "gray",
                        borderWidth: 1,
                      }}
                    >
                      <TextInput
                        style={{
                          flex: 1,
                          fontSize: 18,
                          opacity: 0.8,
                        }}
                        placeholder="Input here"
                        value={
                          formValues.consultationContent.summaryOfDiscussion
                        }
                        onChangeText={(text) =>
                          setFormValues((prevFormValues) => ({
                            ...prevFormValues,
                            consultationContent: {
                              ...prevFormValues.consultationContent,
                              summaryOfDiscussion: text,
                            },
                          }))
                        }
                      />
                      {formValues.consultationContent.summaryOfDiscussion !==
                        "" && (
                        <TouchableOpacity
                          onPress={() =>
                            setFormValues((prevFormValues) => ({
                              ...prevFormValues,
                              consultationContent: {
                                ...prevFormValues.consultationContent,
                                summaryOfDiscussion: "",
                              },
                            }))
                          }
                        >
                          <Ionicons
                            name="close"
                            size={28}
                            style={{
                              color: "#F39300",
                              opacity: 0.7,
                            }}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text
                      style={{
                        color: "#333",
                        fontWeight: "bold",
                        fontSize: 16,
                        marginBottom: 4,
                      }}
                    >
                      Main Issues:
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        marginVertical: 4,
                        backgroundColor: "#ededed",
                        borderRadius: 10,
                        borderColor: "gray",
                        borderWidth: 1,
                      }}
                    >
                      <TextInput
                        style={{
                          flex: 1,
                          fontSize: 18,
                          opacity: 0.8,
                        }}
                        placeholder="Input here"
                        value={formValues.consultationContent.mainIssues}
                        onChangeText={(text) =>
                          setFormValues((prevFormValues) => ({
                            ...prevFormValues,
                            consultationContent: {
                              ...prevFormValues.consultationContent,
                              mainIssues: text,
                            },
                          }))
                        }
                      />
                      {formValues.consultationContent.mainIssues !== "" && (
                        <TouchableOpacity
                          onPress={() =>
                            setFormValues((prevFormValues) => ({
                              ...prevFormValues,
                              consultationContent: {
                                ...prevFormValues.consultationContent,
                                mainIssues: "",
                              },
                            }))
                          }
                        >
                          <Ionicons
                            name="close"
                            size={28}
                            style={{
                              color: "#F39300",
                              opacity: 0.7,
                            }}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text
                      style={{
                        color: "#333",
                        fontWeight: "bold",
                        fontSize: 16,
                        marginBottom: 4,
                      }}
                    >
                      Student Emotions:
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        marginVertical: 4,
                        backgroundColor: "#ededed",
                        borderRadius: 10,
                        borderColor: "gray",
                        borderWidth: 1,
                      }}
                    >
                      <TextInput
                        style={{
                          flex: 1,
                          fontSize: 18,
                          opacity: 0.8,
                        }}
                        placeholder="Input here"
                        value={formValues.consultationContent.studentEmotions}
                        onChangeText={(text) =>
                          setFormValues((prevFormValues) => ({
                            ...prevFormValues,
                            consultationContent: {
                              ...prevFormValues.consultationContent,
                              studentEmotions: text,
                            },
                          }))
                        }
                      />
                      {formValues.consultationContent.studentEmotions !==
                        "" && (
                        <TouchableOpacity
                          onPress={() =>
                            setFormValues((prevFormValues) => ({
                              ...prevFormValues,
                              consultationContent: {
                                ...prevFormValues.consultationContent,
                                studentEmotions: "",
                              },
                            }))
                          }
                        >
                          <Ionicons
                            name="close"
                            size={28}
                            style={{
                              color: "#F39300",
                              opacity: 0.7,
                            }}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text
                      style={{
                        color: "#333",
                        fontWeight: "bold",
                        fontSize: 16,
                        marginBottom: 4,
                      }}
                    >
                      Student Reactions:
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        marginVertical: 4,
                        backgroundColor: "#ededed",
                        borderRadius: 10,
                        borderColor: "gray",
                        borderWidth: 1,
                      }}
                    >
                      <TextInput
                        style={{
                          flex: 1,
                          fontSize: 18,
                          opacity: 0.8,
                        }}
                        placeholder="Input here"
                        value={formValues.consultationContent.studentReactions}
                        onChangeText={(text) =>
                          setFormValues((prevFormValues) => ({
                            ...prevFormValues,
                            consultationContent: {
                              ...prevFormValues.consultationContent,
                              studentReactions: text,
                            },
                          }))
                        }
                      />
                      {formValues.consultationContent.studentReactions !==
                        "" && (
                        <TouchableOpacity
                          onPress={() =>
                            setFormValues((prevFormValues) => ({
                              ...prevFormValues,
                              consultationContent: {
                                ...prevFormValues.consultationContent,
                                studentReactions: "",
                              },
                            }))
                          }
                        >
                          <Ionicons
                            name="close"
                            size={28}
                            style={{
                              color: "#F39300",
                              opacity: 0.7,
                            }}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                  <View style={{ marginVertical: 10 }}>
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: 18,
                        marginBottom: 10,
                        color: "#F39300",
                      }}
                    >
                      Consultation Conclusion
                    </Text>
                    <Text
                      style={{
                        color: "#333",
                        fontWeight: "bold",
                        fontSize: 16,
                        marginBottom: 4,
                      }}
                    >
                      Counselor Conclusion:
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        marginVertical: 4,
                        backgroundColor: "#ededed",
                        borderRadius: 10,
                        borderColor: "gray",
                        borderWidth: 1,
                      }}
                    >
                      <TextInput
                        style={{
                          flex: 1,
                          fontSize: 18,
                          opacity: 0.8,
                        }}
                        placeholder="Input here"
                        value={
                          formValues.consultationConclusion.counselorConclusion
                        }
                        onChangeText={(text) =>
                          setFormValues((prevFormValues) => ({
                            ...prevFormValues,
                            consultationConclusion: {
                              ...prevFormValues.consultationConclusion,
                              counselorConclusion: text,
                            },
                          }))
                        }
                      />
                      {formValues.consultationConclusion.counselorConclusion !==
                        "" && (
                        <TouchableOpacity
                          onPress={() =>
                            setFormValues((prevFormValues) => ({
                              ...prevFormValues,
                              consultationConclusion: {
                                ...prevFormValues.consultationConclusion,
                                counselorConclusion: "",
                              },
                            }))
                          }
                        >
                          <Ionicons
                            name="close"
                            size={28}
                            style={{
                              color: "#F39300",
                              opacity: 0.7,
                            }}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginVertical: 4,
                      }}
                    >
                      <Text
                        style={{
                          color: "#333",
                          fontWeight: "bold",
                          fontSize: 16,
                          marginBottom: 4,
                        }}
                      >
                        Follow-up Needed:
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          setFormValues((prevFormValues) => ({
                            ...prevFormValues,
                            consultationConclusion: {
                              ...prevFormValues.consultationConclusion,
                              followUpNeeded: true,
                            },
                          }))
                        }
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <Ionicons
                          name={
                            formValues.consultationConclusion.followUpNeeded
                              ? "radio-button-on"
                              : "radio-button-off"
                          }
                          size={20}
                          color={
                            formValues.consultationConclusion.followUpNeeded
                              ? "#F39300"
                              : "gray"
                          }
                          style={{ marginRight: 4 }}
                        />
                        <Text
                          style={{
                            fontSize: 18,
                            color: formValues.consultationConclusion
                              .followUpNeeded
                              ? "#F39300"
                              : "black",
                          }}
                        >
                          Yes
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          setFormValues((prevFormValues) => ({
                            ...prevFormValues,
                            consultationConclusion: {
                              ...prevFormValues.consultationConclusion,
                              followUpNeeded: false,
                            },
                          }))
                        }
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <Ionicons
                          name={
                            !formValues.consultationConclusion.followUpNeeded
                              ? "radio-button-on"
                              : "radio-button-off"
                          }
                          size={20}
                          color={
                            !formValues.consultationConclusion.followUpNeeded
                              ? "#F39300"
                              : "gray"
                          }
                          style={{ marginRight: 4 }}
                        />
                        <Text
                          style={{
                            fontSize: 18,
                            color: !formValues.consultationConclusion
                              .followUpNeeded
                              ? "#F39300"
                              : "black",
                          }}
                        >
                          No
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {formValues.consultationConclusion.followUpNeeded ===
                      true && (
                      <>
                        <Text
                          style={{
                            color: "#333",
                            fontWeight: "bold",
                            fontSize: 16,
                            marginBottom: 4,
                          }}
                        >
                          Follow-up Notes:
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            marginVertical: 4,
                            backgroundColor: "#ededed",
                            borderRadius: 10,
                            borderColor: "gray",
                            borderWidth: 1,
                          }}
                        >
                          <TextInput
                            style={{
                              flex: 1,
                              fontSize: 18,
                              opacity: 0.8,
                            }}
                            placeholder="Input here"
                            value={
                              formValues.consultationConclusion.followUpNotes
                            }
                            onChangeText={(text) =>
                              setFormValues((prevFormValues) => ({
                                ...prevFormValues,
                                consultationConclusion: {
                                  ...prevFormValues.consultationConclusion,
                                  followUpNotes: text,
                                },
                              }))
                            }
                          />
                          {formValues.consultationConclusion.followUpNotes !==
                            "" && (
                            <TouchableOpacity
                              onPress={() =>
                                setFormValues((prevFormValues) => ({
                                  ...prevFormValues,
                                  consultationConclusion: {
                                    ...prevFormValues.consultationConclusion,
                                    followUpNotes: "",
                                  },
                                }))
                              }
                            >
                              <Ionicons
                                name="close"
                                size={28}
                                style={{
                                  color: "#F39300",
                                  opacity: 0.7,
                                }}
                              />
                            </TouchableOpacity>
                          )}
                        </View>
                      </>
                    )}
                  </View>
                </ScrollView>
                <TouchableOpacity
                  disabled={
                    formValues.intervention.type === "" ||
                    formValues.intervention.description === "" ||
                    formValues.consultationGoal.specificGoal === "" ||
                    formValues.consultationGoal.reason === "" ||
                    formValues.consultationContent.summaryOfDiscussion === "" ||
                    formValues.consultationContent.mainIssues === "" ||
                    formValues.consultationContent.studentEmotions === "" ||
                    formValues.consultationContent.studentReactions === "" ||
                    formValues.consultationConclusion.counselorConclusion === ""
                  }
                  style={{
                    backgroundColor:
                      formValues.intervention.type === "" ||
                      formValues.intervention.description === "" ||
                      formValues.consultationGoal.specificGoal === "" ||
                      formValues.consultationGoal.reason === "" ||
                      formValues.consultationContent.summaryOfDiscussion ===
                        "" ||
                      formValues.consultationContent.mainIssues === "" ||
                      formValues.consultationContent.studentEmotions === "" ||
                      formValues.consultationContent.studentReactions === "" ||
                      formValues.consultationConclusion.counselorConclusion ===
                        ""
                        ? "#e3e3e3"
                        : "#F39300",
                    marginHorizontal: 20,
                    marginVertical: 12,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 10,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={() => handleCreateAppointmentReport()}
                >
                  <Text
                    style={{
                      color:
                        formValues.intervention.type === "" ||
                        formValues.intervention.description === "" ||
                        formValues.consultationGoal.specificGoal === "" ||
                        formValues.consultationGoal.reason === "" ||
                        formValues.consultationContent.summaryOfDiscussion ===
                          "" ||
                        formValues.consultationContent.mainIssues === "" ||
                        formValues.consultationContent.studentEmotions === "" ||
                        formValues.consultationContent.studentReactions ===
                          "" ||
                        formValues.consultationConclusion
                          .counselorConclusion === ""
                          ? "gray"
                          : "white",
                      fontWeight: "bold",
                      fontSize: 20,
                    }}
                  >
                    Send
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </>
  );
}
