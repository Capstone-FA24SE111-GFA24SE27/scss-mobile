import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Modal,
  Linking,
} from "react-native";
import axiosJWT, { BASE_URL } from "../../../config/Config";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { AuthContext } from "../../context/AuthContext";
import { SocketContext } from "../../context/SocketContext";
import { RequestSkeleton } from "../../layout/Skeleton";
import Toast from "react-native-toast-message";
import { CalendarProvider, WeekCalendar } from "react-native-calendars";
import { Dropdown } from "react-native-element-dropdown";
import Pagination from "../../layout/Pagination";
import { FilterAccordion, FilterToggle } from "../../layout/FilterSection";
import AlertModal from "../../layout/AlertModal";
import StudentInfoModal from "../../layout/StudentInfoModal";

export default function Appointment({ route }) {
  const navigation = useNavigation();
  const prevScreen = route?.params?.prevScreen;
  const { width, height } = Dimensions.get("screen");
  const [loading, setLoading] = useState(true);
  const { userData } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const [appointments, setAppointments] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    status: "",
    SortDirection: "",
  });
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState("");
  const statusList = [
    { name: "CANCELED" },
    { name: "ABSENT" },
    { name: "WAITING" },
    { name: "ATTEND" },
  ];
  const [sortDirection, setSortDirection] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [slots, setSlots] = useState({});
  const [selectedDate2, setSelectedDate2] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState("");
  const [online, isOnline] = useState(null);
  const [reason, setReason] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [openInfo, setOpenInfo] = useState(false);
  const [info, setInfo] = useState({});
  const [openStudentInfo, setOpenStudentInfo] = useState(false);
  const [selectedStudentInfo, setSelectedStudentInfo] = useState(null);
  const [openCancel, setOpenCancel] = useState(false);
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
  const [value2, setValue2] = useState("");

  const scrollViewRef = useRef(null);
  useFocusEffect(
    React.useCallback(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
      }
      fetchData(filters, { page: currentPage });
    }, [filters, currentPage])
  );

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const onFromDateChange = (e, selectedDate) => {
    if (e?.type === "dismissed") {
      setShowFromPicker(false);
      return;
    }
    const currentDate = selectedDate || new Date();
    setShowFromPicker(Platform.OS === "ios");
    if (new Date(currentDate) > new Date(dateTo)) {
      setModalMessage("The 'From' date cannot be later than the 'To' date.");
      setShowModal(true);
    } else {
      setDateFrom(formatDate(currentDate));
    }
  };

  const onToDateChange = (e, selectedDate) => {
    if (e?.type === "dismissed") {
      setShowToPicker(false);
      return;
    }
    const currentDate = selectedDate || new Date();
    setShowToPicker(Platform.OS === "ios");
    if (new Date(currentDate) < new Date(dateFrom)) {
      setModalMessage("The 'To' date cannot be earlier than the 'From' date.");
      setShowModal(true);
    } else {
      setDateTo(formatDate(currentDate));
    }
  };

  const fetchData = async (filters = {}) => {
    try {
      const appointmentsRes = await axiosJWT.get(
        `${BASE_URL}/appointments/counselor`,
        {
          params: {
            ...filters,
            page: currentPage,
          },
        }
      );
      const appointmentsData = appointmentsRes?.data?.content || [];
      setAppointments(appointmentsData);
      setLoading(false);
    } catch (err) {
      console.log("Can't fetch appointment", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    socket.on(`/user/${userData?.id}/private/notification`, () => {
      fetchData(filters);
    });
  }, [filters]);

  useEffect(() => {
    fetchData({ ...filters, page: currentPage });
  }, [currentPage]);

  const applyFilters = () => {
    setLoading(true);
    setCurrentPage(1);
    const newFilters = {
      fromDate: dateFrom,
      toDate: dateTo,
      status: status,
      SortDirection: sortDirection,
    };
    setFilters(newFilters);
    fetchData(newFilters);
    setIsExpanded(false);
  };

  const cancelFilters = () => {
    setLoading(true);
    setCurrentPage(1);
    const resetFilters = {
      fromDate: "",
      toDate: "",
      status: "",
      SortDirection: "",
    };
    setDateFrom(resetFilters.fromDate);
    setDateTo(resetFilters.toDate);
    setStatus(resetFilters.status);
    setSortDirection(resetFilters.SortDirection);
    setFilters(resetFilters);
    fetchData(resetFilters);
    setIsExpanded(false);
  };

  const handleOpenCreate = async () => {
    setOpenCreate(true);
    const startOfWeek = new Date(selectedDate2);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 31);
    startOfWeek.setDate(startOfWeek.getDate() - 31);
    const from = startOfWeek.toISOString().split("T")[0];
    const to = endOfWeek.toISOString().split("T")[0];
    await fetchSlots(userData?.id, from, to);
  };

  const onDateChange = (e, newDate) => {
    if (e?.type === "dismissed") {
      setShowDatePicker(false);
      return;
    }
    const currentDate = newDate || new Date();
    setShowDatePicker(Platform.OS === "ios");
    const formattedDate = formatDate(currentDate);
    setSelectedDate2(formattedDate);
  };

  const fetchSlots = async (counselorId, from, to) => {
    try {
      const response = await axiosJWT.get(
        `${BASE_URL}/counselors/daily-slots/${counselorId}?from=${from}&to=${to}`
      );
      setSlots(response.data.content);
    } catch (err) {
      console.log("Can't fetch slot on this day", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Can't fetch slot on this day",
      });
    }
  };

  const handleMonthChange = (newDate) => {
    const startOfWeek = new Date(newDate);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 31);
    startOfWeek.setDate(startOfWeek.getDate() - 31);
    const from = startOfWeek.toISOString().split("T")[0];
    const to = endOfWeek.toISOString().split("T")[0];

    if (userData?.id) {
      fetchSlots(userData.id, from, to);
    }
  };

  const renderSlotsForSelectedDate = () => {
    const daySlots = slots[selectedDate2] || [];
    if (!daySlots.length) {
      return (
        <Text
          style={{
            fontWeight: "400",
            fontSize: 18,
            fontStyle: "italic",
            fontWeight: "600",
            textAlign: "center",
            color: "gray",
            opacity: 0.7,
            marginVertical: 8,
          }}
        >
          No available slots for {selectedDate2}
        </Text>
      );
    }

    return (
      <View
        style={{
          flexWrap: "wrap",
          flexDirection: "row",
          justifyContent: "flex-start",
          marginTop: 4,
        }}
      >
        {daySlots.map((slot, index) => (
          <TouchableOpacity
            key={`${selectedDate2}-${slot.slotCode}-${index}`}
            onPress={() => (
              console.log(selectedDate2, slot), setSelectedSlot(slot)
            )}
            disabled={
              slot.status === "EXPIRED" ||
              slot.myAppointment === true ||
              slot.status === "UNAVAILABLE"
            }
            style={{
              width: "auto",
              padding: 8,
              marginVertical: 6,
              marginRight: 6,
              backgroundColor:
                slot.myAppointment === true
                  ? "#ededed"
                  : selectedSlot?.slotCode === slot.slotCode &&
                    slot.status !== "EXPIRED"
                  ? "white"
                  : slot.status === "EXPIRED"
                  ? "#ededed"
                  : slot.status === "AVAILABLE"
                  ? "white"
                  : "#ededed",
              alignItems: "center",
              borderRadius: 10,
              borderWidth: 1.5,
              borderColor:
                slot.myAppointment === true
                  ? "transparent"
                  : selectedSlot?.slotCode === slot.slotCode &&
                    slot.status !== "EXPIRED"
                  ? "#F39300"
                  : slot.status === "EXPIRED"
                  ? "transparent"
                  : slot.status === "AVAILABLE"
                  ? "black"
                  : "transparent",
            }}
          >
            {selectedSlot?.slotCode === slot.slotCode &&
              slot.status !== "EXPIRED" &&
              slot.status !== "UNAVAILABLE" &&
              slot.myAppointment !== true && (
                <View style={{ position: "absolute", top: -12, right: -8 }}>
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    style={{ color: "#F39300" }}
                  />
                </View>
              )}
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color:
                  slot.myAppointment === true
                    ? "gray"
                    : selectedSlot?.slotCode === slot.slotCode &&
                      slot.status !== "EXPIRED"
                    ? "#F39300"
                    : slot.status === "EXPIRED"
                    ? "gray"
                    : slot.status === "AVAILABLE"
                    ? "black"
                    : "gray",
              }}
            >
              {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  useEffect(() => {}, [socket, selectedDate]);

  const handleSocketChange = useCallback(
    (day) => {
      const handleSlotRender = (data) => {
        try {
          setSlots((prevSlots) => {
            let updatedSlots = { ...prevSlots };
            let newSlot = updatedSlots[data.dateChange].map((item) => {
              if (item.slotId === data.slotId) {
                return {
                  ...item,
                  status: data.newStatus,
                  myAppointment:
                    data.counselorId === userData?.id ? true : false,
                };
              }
              return item;
            });
            updatedSlots[data.dateChange] = newSlot;
            return updatedSlots;
          });
        } catch (err) {
          console.log("Error parsing notification:", err);
        }
      };
      setSelectedDate(day.dateString);
      setSelectedSlot("");
      console.log(`/user/${day.dateString}/${userData?.id}/slot`);
      if (socket) {
        socket.off(`/user/${selectedDate}/${userData?.id}/slot`);
        socket.on(
          `/user/${day.dateString}/${userData?.id}/slot`,
          handleSlotRender
        );
      }
    },
    [socket, selectedDate, userData]
  );

  const fetchStudent = async (studentId) => {
    try {
      const response = await axiosJWT.get(
        `${BASE_URL}/students/code/${studentId}`
      );
      setSelectedStudent(response.data.content);
    } catch (err) {
      console.log("Can't fetch students", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Can't fetch students",
      });
    }
  };

  const handleCreateAppointment = async () => {
    try {
      const response = await axiosJWT.post(
        `${BASE_URL}/appointments/create/${selectedStudent?.id}`,
        {
          slotCode: selectedSlot?.slotCode,
          date: selectedDate2,
          isOnline: online,
          reason: reason,
          ...(online ? { meetURL: value } : { address: value }),
        }
      );
      const data = await response.data;
      if (data && data.status == 200) {
        handleCloseCreate();
        fetchData(filters, { page: currentPage });
        Toast.show({
          type: "success",
          text1: "Success",
          text2: `New appointment with ${selectedStudent.profile.fullName} created`,
        });
      }
    } catch (err) {
      console.log("Can't create appointment", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Can't create appointment",
      });
    }
  };

  const handleCloseCreate = () => {
    setSelectedStudent(null);
    setSelectedSlot(null);
    isOnline(null);
    setReason(null);
    setValue(null);
    setValue2("");
    setOpenCreate(false);
  };

  const handleCancelAppointment = async () => {
    try {
      const response = await axiosJWT.post(
        `${BASE_URL}/booking-counseling/counselor/cancel/${selectedAppointment}`,
        {
          reason: value,
        }
      );
      const data = await response.data;
      if (data && data.status == 200) {
        fetchData(filters, { page: currentPage });
        setOpenCancel(false);
        setSelectedAppointment(null);
        setValue("");
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Appointment canceled.",
          onPress: () => {
            Toast.hide();
          },
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to cancel appointment.",
          onPress: () => {
            Toast.hide();
          },
        });
      }
    } catch (err) {
      console.log("Can't cancel appointment", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Can't cancel appointment",
      });
    }
  };

  const handleCloseCancel = () => {
    setOpenCancel(false);
    setSelectedAppointment(null);
    setValue("");
  };

  const handleOpenUpdateAppointment = async (id, method, value) => {
    setOpenUpdate(true);
    setSelectedAppointment(id);
    setMethod(method);
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
        method === "ONLINE" ? { meetUrl: value } : { address: value };
      const response = await axiosJWT.put(
        `${BASE_URL}/booking-counseling/${selectedAppointment}/update-details`,
        dataToSend
      );
      const data = await response.data;
      if (data && data.status == 200) {
        setInfo({
          ...info,
          [method === "ONLINE" ? "meetUrl" : "address"]: value,
        });
        Toast.show({
          type: "success",
          text1: "Appointment Updated",
          text2: "Appointment updated successfully",
          onPress: () => {
            Toast.hide();
          },
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
        setSelectedAppointment(null);
        setOpenAttendance(false);
        setValue("");
      }
    } catch (err) {
      console.log("Can't take attendance", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Can't take attendance",
      });
    }
  };

  const handleCloseUpdateAppointment = () => {
    setValue("");
    setMethod("");
    setSelectedAppointment(null);
    setOpenUpdate(false);
    fetchData(filters);
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

  return (
    <>
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
              onPress={() => navigation.navigate(prevScreen || "Personal")}
            >
              <Ionicons name="return-up-back" size={36} />
            </TouchableOpacity>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontWeight: "bold", fontSize: 24 }}>
              Your Appointments
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: "flex-end" }} />
        </View>
        <View
          style={{
            marginHorizontal: 20,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={{ alignItems: "flex-start" }}>
              {!loading ? (
                <Text
                  style={{
                    fontSize: 20,
                    opacity: 0.8,
                    color: "#333",
                    fontWeight: "bold",
                  }}
                >
                  {appointments.totalElements} Appointments{" "}
                  <Text
                    style={{
                      fontSize: 20,
                      opacity: 0.8,
                      fontWeight: "400",
                      color: "#333",
                    }}
                  >
                    found
                  </Text>
                </Text>
              ) : (
                <View
                  style={{
                    width: width * 0.6,
                    height: 20,
                    backgroundColor: "#ededed",
                    borderRadius: 20,
                  }}
                />
              )}
            </View>
            <View
              style={{
                alignItems: "flex-end",
                justifyContent: "center",
                flexDirection: "row",
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: "#F39300",
                  borderRadius: 40,
                  padding: 8,
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "row",
                  marginRight: 8,
                }}
                onPress={handleOpenCreate}
              >
                <Ionicons name="add" size={26} style={{ color: "white" }} />
              </TouchableOpacity>
              <FilterToggle
                isExpanded={isExpanded}
                toggleExpanded={() => setIsExpanded((prev) => !prev)}
              />
            </View>
          </View>
          <FilterAccordion isExpanded={isExpanded}>
            <View style={{ paddingHorizontal: 10 }}>
              <View
                style={{
                  paddingVertical: 8,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginLeft: 4,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      marginBottom: 8,
                    }}
                  >
                    From Date:
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      borderRadius: 20,
                      paddingHorizontal: 12,
                      alignItems: "center",
                      backgroundColor: "white",
                      height: 40,
                      borderWidth: 1,
                      borderColor: "gray",
                    }}
                  >
                    <Text style={{ fontSize: 16, opacity: 0.8, flex: 1 }}>
                      {dateFrom !== "" ? dateFrom : "xxxx-xx-xx"}
                    </Text>
                    <TouchableOpacity onPress={() => setShowFromPicker(true)}>
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color="#F39300"
                      />
                    </TouchableOpacity>
                  </View>
                  {showFromPicker && (
                    <RNDateTimePicker
                      value={selectedDate}
                      mode="date"
                      display="default"
                      onChange={onFromDateChange}
                    />
                  )}
                </View>
                <View style={{ flex: 1, paddingLeft: 10 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      marginBottom: 8,
                    }}
                  >
                    To Date:
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      borderRadius: 20,
                      paddingHorizontal: 12,
                      alignItems: "center",
                      backgroundColor: "white",
                      height: 40,
                      borderWidth: 1,
                      borderColor: "gray",
                    }}
                  >
                    <Text style={{ fontSize: 16, opacity: 0.8, flex: 1 }}>
                      {dateTo !== "" ? dateTo : "xxxx-xx-xx"}
                    </Text>
                    <TouchableOpacity onPress={() => setShowToPicker(true)}>
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color="#F39300"
                      />
                    </TouchableOpacity>
                  </View>
                  {showToPicker && (
                    <RNDateTimePicker
                      value={selectedDate}
                      mode="date"
                      display="default"
                      onChange={onToDateChange}
                    />
                  )}
                </View>
                <AlertModal
                  showModal={showModal}
                  setShowModal={setShowModal}
                  modalMessage={modalMessage}
                  setModalMessage={setModalMessage}
                />
              </View>
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  marginVertical: 4,
                  marginLeft: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "#333",
                    minWidth: "30%",
                  }}
                >
                  Sort:
                </Text>
                <View style={{ flexDirection: "row" }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginHorizontal: 16,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => setSortDirection("ASC")}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Ionicons
                        name={
                          sortDirection == "ASC"
                            ? "radio-button-on"
                            : "radio-button-off"
                        }
                        size={20}
                        color={sortDirection == "ASC" ? "#F39300" : "gray"}
                        style={{ marginRight: 4 }}
                      />
                      <Ionicons
                        name="arrow-up"
                        size={20}
                        style={{
                          color: sortDirection == "ASC" ? "#F39300" : "black",
                        }}
                      />
                    </TouchableOpacity>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginHorizontal: 4,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => setSortDirection("DESC")}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Ionicons
                        name={
                          sortDirection == "DESC"
                            ? "radio-button-on"
                            : "radio-button-off"
                        }
                        size={20}
                        color={sortDirection == "DESC" ? "#F39300" : "gray"}
                        style={{ marginRight: 4 }}
                      />
                      <Ionicons
                        name="arrow-down"
                        size={20}
                        style={{
                          color: sortDirection == "DESC" ? "#F39300" : "black",
                        }}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  marginVertical: 4,
                  marginLeft: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "#333",
                    minWidth: "30%",
                  }}
                >
                  Status:
                </Text>
                <Dropdown
                  style={{
                    backgroundColor: "white",
                    borderColor: expanded ? "#F39300" : "black",
                    flex: 1,
                    height: 30,
                    borderWidth: 1,
                    borderColor: "grey",
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    marginLeft: 16,
                  }}
                  placeholderStyle={{ fontSize: 14 }}
                  selectedTextStyle={{
                    fontSize: 14,
                    color: status ? "black" : "white",
                  }}
                  maxHeight={250}
                  data={statusList}
                  labelField="name"
                  value={status}
                  placeholder={status != "" ? status : "Select Status"}
                  onFocus={() => setExpanded(true)}
                  onBlur={() => setExpanded(false)}
                  onChange={(item) => {
                    setStatus(item.name);
                    setExpanded(false);
                    console.log(status);
                  }}
                  renderRightIcon={() => (
                    <Ionicons
                      color={expanded ? "#F39300" : "black"}
                      name={expanded ? "caret-up" : "caret-down"}
                      size={20}
                    />
                  )}
                  renderItem={(item) => {
                    return (
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          backgroundColor:
                            item.name == status ? "#F39300" : "white",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "500",
                            color: item.name == status ? "white" : "black",
                          }}
                        >
                          {item.name}
                        </Text>
                        {status == item.name && (
                          <Ionicons color="white" name="checkmark" size={20} />
                        )}
                      </View>
                    );
                  }}
                />
              </View>
              <View
                style={{
                  margin: 8,
                  flex: 1,
                  justifyContent: "flex-end",
                  alignItems: "flex-end",
                  flexDirection: "row",
                }}
              >
                <TouchableOpacity
                  onPress={cancelFilters}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    backgroundColor: "white",
                    borderRadius: 10,
                    elevation: 2,
                    marginHorizontal: 4,
                  }}
                >
                  <Text
                    style={{
                      color: "#333",
                      fontSize: 16,
                      fontWeight: "600",
                      opacity: 0.7,
                    }}
                  >
                    Clear
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={applyFilters}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    backgroundColor: "#F39300",
                    borderRadius: 10,
                    elevation: 2,
                    marginHorizontal: 4,
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  >
                    Apply
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </FilterAccordion>
        </View>
        <ScrollView
          ref={scrollViewRef}
          style={{ marginHorizontal: 20, marginVertical: 12 }}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <>
              <RequestSkeleton />
              <RequestSkeleton />
              <RequestSkeleton />
              <RequestSkeleton />
              <RequestSkeleton />
            </>
          ) : (
            appointments?.data?.map((appointment) => (
              <View
                key={appointment.id}
                style={{
                  padding: 16,
                  marginBottom: 16,
                  backgroundColor: "white",
                  borderRadius: 20,
                  elevation: 1,
                  position: "relative",
                  borderWidth: 1.5,
                  borderColor: "#F39300",
                }}
              >
                <View style={{ flexDirection: "row", marginBottom: 16 }}>
                  <Image
                    source={{ uri: appointment.studentInfo.profile.avatarLink }}
                    style={{
                      width: width * 0.14,
                      height: width * 0.14,
                      borderRadius: 40,
                      borderColor: "#F39300",
                      borderWidth: 2,
                    }}
                  />
                  <View style={{ marginLeft: 12, maxWidth: "80%" }}>
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: 18,
                        color: "#333",
                      }}
                    >
                      {appointment.studentInfo.profile.fullName}
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
                        {appointment.meetingType}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => (
                      setInfo(appointment),
                      setOpenInfo(true),
                      setSelectedAppointment(appointment.id)
                    )}
                    style={{ position: "absolute", top: 0, right: -4 }}
                  >
                    <Ionicons
                      name="ellipsis-vertical"
                      size={24}
                      color="#F39300"
                    />
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons name="calendar" size={20} color="#F39300" />
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        marginLeft: 8,
                        color: "#333",
                      }}
                    >
                      {
                        new Date(appointment.startDateTime)
                          .toISOString()
                          .split("T")[0]
                      }
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons name="time" size={20} color="#F39300" />
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        marginLeft: 8,
                        color: "#333",
                      }}
                    >
                      {appointment?.startDateTime?.split("T")[1].slice(0, 5)} -{" "}
                      {appointment?.endDateTime?.split("T")[1].slice(0, 5)}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        color: "#333",
                      }}
                    >
                      Status:{" "}
                      <Text
                        style={[
                          appointment.status === "ATTEND" && { color: "green" },
                          appointment.status === "WAITING" && {
                            color: "#F39300",
                          },
                          appointment.status === "ABSENT" && { color: "red" },
                          appointment.status === "CANCELED" && {
                            color: "gray",
                          },
                        ]}
                      >
                        {appointment.status}
                      </Text>
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignSelf: "flex-end",
                    alignItems: "center",
                  }}
                >
                  {appointment.status === "WAITING" && (
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "flex-end",
                      }}
                    >
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => (
                          setOpenCancel(true),
                          setSelectedAppointment(appointment.id)
                        )}
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          backgroundColor: "#e3e3e3",
                          borderRadius: 10,
                          flexDirection: "row",
                          alignItems: "center",
                          borderWidth: 1.5,
                          borderColor: "#e3e3e3",
                        }}
                      >
                        <Text
                          style={{
                            fontWeight: "500",
                            color: "#333",
                            fontSize: 16,
                          }}
                        >
                          Cancel
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {appointment.status !== "CANCELED" &&
                    new Date(appointment.startDateTime)
                      .toISOString()
                      .split("T")[0] >=
                      new Date().toISOString().split("T")[0] && (
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedAppointment(appointment.id);
                          setOpenAttendance(true);
                          setValue(appointment.status);
                        }}
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          marginLeft: 8,
                          backgroundColor: "#F39300",
                          borderRadius: 10,
                          flexDirection: "row",
                          alignItems: "center",
                          borderWidth: 1.5,
                          borderColor: "#F39300",
                        }}
                      >
                        <MaterialIcons
                          name="edit-calendar"
                          size={18}
                          color="white"
                        />

                        <Text
                          style={{
                            fontWeight: "500",
                            color: "white",
                            fontSize: 16,
                            marginLeft: 4,
                          }}
                        >
                          Check
                        </Text>
                      </TouchableOpacity>
                    )}
                </View>
              </View>
            ))
          )}
        </ScrollView>
        {!loading && (
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            length={appointments?.data?.length}
            totalPages={appointments?.totalPages}
          />
        )}
        <Modal
          transparent={true}
          visible={openCreate}
          animationType="slide"
          onRequestClose={handleCloseCreate}
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
                onPress={handleCloseCreate}
              >
                <Ionicons name="chevron-back" size={28} />
              </TouchableOpacity>
              <CalendarProvider
                date={selectedDate2}
                onDateChanged={(date) => (
                  setSelectedDate2(date), setSelectedSlot("")
                )}
                onMonthChange={(newDate) =>
                  handleMonthChange(newDate.dateString)
                }
              >
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={{ marginVertical: 12 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingHorizontal: 20,
                        marginBottom: 12,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "600",
                        }}
                      >
                        Available Time
                      </Text>
                      <View
                        style={{
                          flex: 0.65,
                          flexDirection: "row",
                          justifyContent: "space-between",
                          borderRadius: 20,
                          paddingHorizontal: 12,
                          alignItems: "center",
                          backgroundColor: "white",
                          height: 30,
                          borderWidth: 1,
                          borderColor: "gray",
                        }}
                      >
                        <Text style={{ fontSize: 16, opacity: 0.8 }}>
                          {selectedDate2 !== "" ? selectedDate2 : "xxxx-xx-xx"}
                        </Text>
                        <TouchableOpacity
                          onPress={() => setShowDatePicker(true)}
                        >
                          <Ionicons
                            name="calendar-outline"
                            size={20}
                            color="#F39300"
                          />
                        </TouchableOpacity>
                      </View>
                      {showDatePicker && (
                        <RNDateTimePicker
                          value={tempDate}
                          mode="date"
                          display="default"
                          onChange={onDateChange}
                        />
                      )}
                    </View>
                    <WeekCalendar
                      hideKnob
                      initialPosition="close"
                      theme={{
                        selectedDayBackgroundColor: "#F39300",
                        selectedDayTextColor: "white",
                        arrowColor: "#F39300",
                        textDayHeaderFontSize: 14,
                        textDayFontSize: 16,
                        todayTextColor: "#F39300",
                      }}
                      style={{
                        justifyContent: "center",
                        elevation: 1,
                      }}
                      renderArrow={(direction) => {
                        return direction === "left" ? (
                          <Ionicons
                            name="chevron-back"
                            size={22}
                            color="#F39300"
                          />
                        ) : (
                          <Ionicons
                            name="chevron-forward"
                            size={22}
                            color="#F39300"
                          />
                        );
                      }}
                      onDayPress={handleSocketChange}
                    />
                    <View
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 20,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "600",
                        }}
                      >
                        Select a slot{" "}
                        <Text style={{ color: "#F39300" }}>*</Text>
                      </Text>
                      {renderSlotsForSelectedDate()}
                    </View>
                    {slots[selectedDate2]?.length !== 0 &&
                      slots[selectedDate2]?.some(
                        (item) =>
                          item.status !== "EXPIRED" &&
                          item.status !== "UNAVAILABLE"
                      ) && (
                        <>
                          <View
                            style={{
                              paddingVertical: 12,
                              paddingHorizontal: 20,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 18,
                                fontWeight: "600",
                              }}
                            >
                              Form of counseling{" "}
                              <Text style={{ color: "#F39300" }}>*</Text>
                            </Text>
                            <View
                              style={{
                                flexDirection: "row",
                                flexWrap: "wrap",
                              }}
                            >
                              <View
                                style={{
                                  flexDirection: "row",
                                  width: "50%",
                                  alignItems: "center",
                                }}
                              >
                                <TouchableOpacity
                                  onPress={() => isOnline(true)}
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    backgroundColor:
                                      online == true ? "white" : "#ededed",
                                    borderRadius: 10,
                                    paddingHorizontal: 12,
                                    paddingVertical: 4,
                                    marginTop: 10,
                                    borderWidth: 1.5,
                                    borderColor:
                                      online == true
                                        ? "#F39300"
                                        : "transparent",
                                  }}
                                >
                                  <Ionicons
                                    name={
                                      online == true
                                        ? "checkmark-circle"
                                        : "radio-button-off"
                                    }
                                    size={24}
                                    color={online == true ? "#F39300" : "gray"}
                                    style={{ marginRight: 8 }}
                                  />
                                  <Text
                                    style={{
                                      fontSize: 20,
                                      color:
                                        online == true ? "#F39300" : "black",
                                      fontWeight: online == true ? "600" : "0",
                                    }}
                                  >
                                    Online
                                  </Text>
                                </TouchableOpacity>
                              </View>
                              <View
                                style={{
                                  flexDirection: "row",
                                  width: "50%",
                                  alignItems: "center",
                                }}
                              >
                                <TouchableOpacity
                                  onPress={() => isOnline(false)}
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    backgroundColor:
                                      online == false ? "white" : "#ededed",
                                    borderRadius: 10,
                                    paddingHorizontal: 12,
                                    paddingVertical: 4,
                                    marginTop: 10,
                                    borderWidth: 1.5,
                                    borderColor:
                                      online == false
                                        ? "#F39300"
                                        : "transparent",
                                  }}
                                >
                                  <Ionicons
                                    name={
                                      online == false
                                        ? "checkmark-circle"
                                        : "radio-button-off"
                                    }
                                    size={24}
                                    color={online == false ? "#F39300" : "gray"}
                                    style={{ marginRight: 8 }}
                                  />
                                  <Text
                                    style={{
                                      fontSize: 20,
                                      color:
                                        online == false ? "#F39300" : "black",
                                      fontWeight: online == false ? "600" : "0",
                                    }}
                                  >
                                    Offline
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          </View>
                          {online !== null && (
                            <View
                              style={{
                                paddingVertical: 12,
                                paddingHorizontal: 20,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 18,
                                  fontWeight: "600",
                                  marginBottom: 12,
                                }}
                              >
                                {online === true
                                  ? "Enter Meet URL"
                                  : "Enter Address"}{" "}
                                <Text style={{ color: "#F39300" }}>*</Text>
                              </Text>
                              <View>
                                <TextInput
                                  placeholder="Input here"
                                  value={value}
                                  onChangeText={(value) => setValue(value)}
                                  style={{
                                    flex: 1,
                                    fontWeight: "600",
                                    fontSize: 16,
                                    opacity: 0.8,
                                    paddingVertical: 8,
                                    paddingHorizontal: 12,
                                    backgroundColor: "#ededed",
                                    borderColor: "gray",
                                    borderWidth: 1,
                                    borderRadius: 10,
                                  }}
                                />
                              </View>
                            </View>
                          )}
                          <View
                            style={{
                              paddingVertical: 12,
                              paddingHorizontal: 20,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 18,
                                fontWeight: "600",
                                marginBottom: 12,
                              }}
                            >
                              What is the purpose of this appointment?{" "}
                              <Text style={{ color: "#F39300" }}>*</Text>
                            </Text>
                            <View>
                              <TextInput
                                placeholder="Input here"
                                value={reason}
                                onChangeText={(value) => setReason(value)}
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
                          </View>
                          <View
                            style={{
                              paddingVertical: 12,
                              paddingHorizontal: 20,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 18,
                                fontWeight: "600",
                                marginBottom: 12,
                              }}
                            >
                              Assign student{" "}
                              <Text style={{ color: "#F39300" }}>*</Text>
                            </Text>
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <View
                                style={{
                                  flex: 1,
                                  flexDirection: "row",
                                  paddingVertical: 8,
                                  paddingHorizontal: 12,
                                  backgroundColor: "#ededed",
                                  borderColor: "gray",
                                  borderWidth: 1,
                                  borderRadius: 10,
                                  alignItems: "center",
                                }}
                              >
                                <TextInput
                                  placeholder="Input Student Code"
                                  value={value2}
                                  onChangeText={(value) => setValue2(value)}
                                  style={{
                                    flex: 1,
                                    fontWeight: "600",
                                    fontSize: 16,
                                    opacity: 0.8,
                                  }}
                                />
                                {value2 !== "" && (
                                  <TouchableOpacity
                                    onPress={() => (
                                      setValue2(""), setSelectedStudent(null)
                                    )}
                                  >
                                    <Ionicons
                                      name="close"
                                      size={28}
                                      style={{ color: "#F39300", opacity: 0.7 }}
                                    />
                                  </TouchableOpacity>
                                )}
                              </View>
                              <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() =>
                                  fetchStudent(value2.toUpperCase())
                                }
                                style={{
                                  backgroundColor: "#F39300",
                                  borderRadius: 40,
                                  padding: 8,
                                  marginLeft: 8,
                                  borderWidth: 1.5,
                                  borderColor: "#F39300",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  flexDirection: "row",
                                }}
                              >
                                <Ionicons
                                  name="search"
                                  color="white"
                                  size={24}
                                />
                              </TouchableOpacity>
                            </View>
                            {selectedStudent && (
                              <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => (
                                  setOpenStudentInfo(true),
                                  setSelectedStudentInfo(selectedStudent?.id)
                                )}
                                style={{
                                  flexDirection: "row",
                                  alignItems: "stretch",
                                  backgroundColor: "#F39300",
                                  borderRadius: 20,
                                  marginVertical: 12,
                                }}
                              >
                                <View
                                  style={{
                                    backgroundColor: "#fff0e0",
                                    justifyContent: "flex-start",
                                    padding: 12,
                                    marginLeft: 4,
                                    marginRight: 2,
                                    marginVertical: 4,
                                    borderTopLeftRadius: 18,
                                    borderBottomLeftRadius: 18,
                                  }}
                                >
                                  <Image
                                    source={{
                                      uri: selectedStudent.profile.avatarLink,
                                    }}
                                    style={{
                                      width: 70,
                                      height: 70,
                                      borderRadius: 40,
                                      borderColor: "#F39300",
                                      borderWidth: 2,
                                    }}
                                  />
                                </View>
                                <View
                                  style={{
                                    flex: 1,
                                    backgroundColor: "white",
                                    borderTopRightRadius: 18,
                                    borderBottomRightRadius: 18,
                                    padding: 8,
                                    marginVertical: 4,
                                    marginRight: 4,
                                  }}
                                >
                                  <View
                                    style={{
                                      flexDirection: "row",
                                      marginBottom: 8,
                                    }}
                                  >
                                    <Text
                                      style={{
                                        color: "#F39300",
                                        fontSize: 20,
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {selectedStudent.profile.fullName}
                                    </Text>
                                  </View>
                                  <View
                                    style={{
                                      flexDirection: "row",
                                      flexWrap: "wrap",
                                      marginBottom: 4,
                                    }}
                                  >
                                    <View
                                      style={{
                                        flexDirection: "row",
                                        width: "50%",
                                      }}
                                    >
                                      <Ionicons
                                        name="id-card"
                                        size={16}
                                        color="#F39300"
                                      />
                                      <Text
                                        style={{
                                          fontSize: 14,
                                          marginLeft: 4,
                                          color: "#333",
                                          maxWidth: "80%",
                                        }}
                                      >
                                        {selectedStudent.studentCode}
                                      </Text>
                                    </View>
                                    <View
                                      style={{
                                        flexDirection: "row",
                                        width: "50%",
                                      }}
                                    >
                                      <Ionicons
                                        name="briefcase"
                                        size={16}
                                        color="#F39300"
                                      />
                                      <Text
                                        style={{
                                          fontSize: 14,
                                          marginLeft: 4,
                                          color: "#333",
                                          maxWidth: "80%",
                                        }}
                                      >
                                        {selectedStudent?.major?.name || "N/A"}
                                      </Text>
                                    </View>
                                  </View>
                                  <View
                                    style={{
                                      flexDirection: "row",
                                      flexWrap: "wrap",
                                    }}
                                  >
                                    <View
                                      style={{
                                        flexDirection: "row",
                                        width: "50%",
                                      }}
                                    >
                                      <Ionicons
                                        name="call"
                                        size={16}
                                        color="#F39300"
                                      />
                                      <Text
                                        style={{
                                          fontSize: 14,
                                          marginLeft: 4,
                                          color: "#333",
                                          maxWidth: "80%",
                                        }}
                                      >
                                        {selectedStudent.profile.phoneNumber}
                                      </Text>
                                    </View>
                                    <View
                                      style={{
                                        flexDirection: "row",
                                        width: "50%",
                                      }}
                                    >
                                      <MaterialIcons
                                        name="cake"
                                        size={16}
                                        color="#F39300"
                                      />
                                      <Text
                                        style={{
                                          fontSize: 14,
                                          marginLeft: 4,
                                          color: "#333",
                                          maxWidth: "80%",
                                        }}
                                      >
                                        {formatDate(
                                          selectedStudent.profile.dateOfBirth
                                        )}
                                      </Text>
                                    </View>
                                  </View>
                                </View>
                              </TouchableOpacity>
                            )}
                          </View>
                        </>
                      )}
                  </View>
                </ScrollView>
                <TouchableOpacity
                  disabled={
                    slots[selectedDate2]?.length === 0 ||
                    slots[selectedDate2]?.every(
                      (item) => item.status === "EXPIRED"
                    ) ||
                    selectedSlot === "" ||
                    online === null ||
                    setValue === "" ||
                    setValue2 === "" ||
                    reason === "" ||
                    selectedStudent === null
                  }
                  activeOpacity={0.7}
                  onPress={handleCreateAppointment}
                  style={{
                    backgroundColor:
                      slots[selectedDate2]?.length === 0 ||
                      slots[selectedDate2]?.every(
                        (item) => item.status === "EXPIRED"
                      ) ||
                      selectedSlot === "" ||
                      online === null ||
                      setValue === "" ||
                      setValue2 === "" ||
                      reason === "" ||
                      selectedStudent === null
                        ? "#ededed"
                        : "#F39300",
                    borderRadius: 20,
                    paddingVertical: 12,
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "row",
                    marginHorizontal: 20,
                    marginVertical: 16,
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "600",
                      color:
                        slots[selectedDate2]?.length === 0 ||
                        slots[selectedDate2]?.every(
                          (item) => item.status === "EXPIRED"
                        ) ||
                        selectedSlot === "" ||
                        online === null ||
                        setValue === "" ||
                        setValue2 === "" ||
                        reason === "" ||
                        selectedStudent === null
                          ? "gray"
                          : "white",
                      fontSize: 20,
                      marginRight: 8,
                    }}
                  >
                    Create Appointment
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={24}
                    style={{
                      color:
                        slots[selectedDate2]?.length === 0 ||
                        slots[selectedDate2]?.every(
                          (item) => item.status === "EXPIRED"
                        ) ||
                        selectedSlot === "" ||
                        online === null ||
                        setValue === "" ||
                        setValue2 === "" ||
                        reason === "" ||
                        selectedStudent === null
                          ? "gray"
                          : "white",
                    }}
                  />
                </TouchableOpacity>
              </CalendarProvider>
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
                  {info?.havingReport == false && info?.status == "ATTEND" && (
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
                      setSelectedStudentInfo(info?.studentInfo?.id)
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
                          source={{
                            uri: info?.studentInfo?.profile?.avatarLink,
                          }}
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
                              info?.studentInfo?.profile?.gender == "MALE"
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
                        {info?.studentInfo?.profile?.fullName}
                      </Text>
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: "500",
                          color: "#333",
                          marginBottom: 2,
                        }}
                      >
                        {info?.studentInfo?.major?.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          color: "grey",
                          marginBottom: 2,
                        }}
                      >
                        ID: {info?.studentInfo?.studentCode}
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          color: "grey",
                        }}
                      >
                        Phone: {info?.studentInfo?.profile?.phoneNumber}
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
                        marginBottom: 16,
                      }}
                    >
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Ionicons name="calendar" size={22} color="#F39300" />
                        <Text
                          style={{
                            fontSize: 18,
                            color: "grey",
                            fontWeight: "600",
                            marginLeft: 8,
                          }}
                        >
                          Date
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "bold",
                          color: "#333",
                        }}
                      >
                        {info?.startDateTime?.split("T")[0]}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 16,
                      }}
                    >
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Ionicons name="time" size={22} color="#F39300" />
                        <Text
                          style={{
                            fontSize: 18,
                            color: "grey",
                            fontWeight: "600",
                            marginLeft: 8,
                          }}
                        >
                          Time
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "bold",
                          color: "#333",
                        }}
                      >
                        {info?.startDateTime?.split("T")[1].slice(0, 5)} -{" "}
                        {info?.endDateTime?.split("T")[1].slice(0, 5)}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 16,
                      }}
                    >
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <MaterialIcons
                          name="meeting-room"
                          size={22}
                          color="#F39300"
                        />
                        <Text
                          style={{
                            fontSize: 18,
                            color: "grey",
                            fontWeight: "600",
                            marginLeft: 8,
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
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        {info.meetingType === "ONLINE" && (
                          <Ionicons name="videocam" size={22} color="#F39300" />
                        )}
                        {info.meetingType === "OFFLINE" && (
                          <MaterialIcons
                            name="place"
                            size={22}
                            color="#F39300"
                          />
                        )}
                        <Text
                          style={{
                            fontSize: 18,
                            color: "grey",
                            fontWeight: "600",
                            marginLeft: 8,
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
                        {info?.startDateTime > new Date().toISOString() &&
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
                                    info.meetingType === "ONLINE"
                                      ? info.meetUrl
                                      : info.address
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
                              new Date(info?.startDateTime) <= new Date() &&
                              new Date() <= new Date(info?.endDateTime)
                            ) {
                              Linking.openURL(`${info?.meetUrl}`).catch(
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
                                text2: "This isn't meeting time",
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
                                (new Date(info?.startDateTime) > new Date() ||
                                  new Date() > new Date(info?.endDateTime))
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
                              ? "Meet URL" || "N/A"
                              : info?.address || "N/A"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                  {info?.cancelReason !== null && (
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
                        Canceled By
                      </Text>
                      <Text
                        style={{
                          fontSize: 20,
                          color: "#333",
                          fontWeight: "500",
                          opacity: 0.7,
                        }}
                      >
                        {info?.cancelReason}
                      </Text>
                    </View>
                  )}
                  {info?.appointmentFeedback !== null ? (
                    <View
                      style={{
                        marginBottom: 20,
                        borderRadius: 10,
                        backgroundColor: "white",
                        padding: 16,
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
                            {info?.studentInfo?.profile?.fullName}
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
                            {info?.appointmentFeedback?.rating.toFixed(1)}
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
                            {formatDate(info?.appointmentFeedback?.createdAt)}
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
                        {info?.appointmentFeedback?.comment}
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={{
                        marginBottom: 20,
                        borderRadius: 10,
                        backgroundColor: "white",
                        padding: 16,
                        elevation: 1,
                        borderWidth: 1.5,
                        borderColor: "#e3e3e3",
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
          visible={openAttendance}
          animationType="slide"
          onRequestClose={() => setOpenAttendance(false)}
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
                  onPress={() => (
                    setOpenAttendance(false),
                    setSelectedAppointment(null),
                    setValue("")
                  )}
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
          visible={openCancel}
          animationType="fade"
          onRequestClose={handleCloseCancel}
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
                Cancel Appointment Confirmation
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  marginBottom: 30,
                  textAlign: "center",
                }}
              >
                Are you sure you want to cancel this appointment?
                {"\n"}
                You need to provide your reason
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  marginBottom: 10,
                  fontWeight: "600",
                }}
              >
                Reason <Text style={{ color: "#F39300", fontSize: 20 }}>*</Text>
              </Text>
              <View>
                <TextInput
                  placeholder="Input here"
                  value={value}
                  onChangeText={(value) => setValue(value)}
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
                  onPress={handleCloseCancel}
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
                  onPress={handleCancelAppointment}
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
                      <Text style={{ fontWeight: "600" }}>• Description:</Text>
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
                      <Text style={{ fontWeight: "600" }}>• Main Issues:</Text>
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
                      value={formValues.consultationContent.summaryOfDiscussion}
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
                    {formValues.consultationContent.studentEmotions !== "" && (
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
                    {formValues.consultationContent.studentReactions !== "" && (
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
                    formValues.consultationContent.summaryOfDiscussion === "" ||
                    formValues.consultationContent.mainIssues === "" ||
                    formValues.consultationContent.studentEmotions === "" ||
                    formValues.consultationContent.studentReactions === "" ||
                    formValues.consultationConclusion.counselorConclusion === ""
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
                      formValues.consultationContent.studentReactions === "" ||
                      formValues.consultationConclusion.counselorConclusion ===
                        ""
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
    </>
  );
}
