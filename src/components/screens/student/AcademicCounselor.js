import {
  View,
  Text,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  Platform,
  Modal,
  Dimensions,
} from "react-native";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import axiosJWT, { BASE_URL } from "../../../config/Config";
import { CalendarProvider, WeekCalendar } from "react-native-calendars";
import { SocketContext } from "../../context/SocketContext";
import { AuthContext } from "../../context/AuthContext";
import { CounselorSkeleton } from "../../layout/Skeleton";
import Toast from "react-native-toast-message";
import { Dropdown } from "react-native-element-dropdown";
import ErrorModal from "../../layout/ErrorModal";
import Pagination from "../../layout/Pagination";
import { FilterAccordion, FilterToggle } from "../../layout/FilterSection";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import AlertModal from "../../layout/AlertModal";
import ExtendInfoModal from "../../layout/ExtendInfoModal";
import ConfirmBookingModal from "../../layout/ConfirmBookingModal";

export default function AcademicCounselor() {
  const navigation = useNavigation();
  const { width, height } = Dimensions.get("screen");
  const [loading, setLoading] = useState(true);
  const { userData } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const scrollViewRef = useRef(null);
  const [counselors, setCounselors] = useState([]);
  const [filters, setFilters] = useState({
    availableFrom: "",
    availableTo: "",
    ratingFrom: 0,
    ratingTo: 5,
    SortDirection: "",
    gender: "",
    departmentId: "",
    majorId: "",
    specializationId: "",
  });
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableTo, setAvailableTo] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [selectedFrom, setSelectedFrom] = useState(0);
  const [selectedTo, setSelectedTo] = useState(5);
  const ratings = [0, 1, 2, 3, 4, 5];
  const [sortDirection, setSortDirection] = useState("");
  const [gender, setGender] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [expanded2, setExpanded2] = useState(false);
  const [expanded3, setExpanded3] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [majors, setMajors] = useState([]);
  const [selectedMajor, setSelectedMajor] = useState("");
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCounselor, setSelectedCounselor] = useState({});
  const [openBooking, setOpenBooking] = useState(false);
  const [openExtendInfo, setOpenExtendInfo] = useState(false);
  const [extendInfo, setExtendInfo] = useState(null);
  const [slots, setSlots] = useState({});
  const [selectedDate2, setSelectedDate2] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState("");
  const [online, isOnline] = useState(null);
  const [reason, setReason] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useFocusEffect(
    React.useCallback(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
      }
      fetchData(filters, { page: currentPage });
      fetchDepartment();
    }, [debouncedKeyword, filters, currentPage])
  );

  const fetchData = async (filters = {}) => {
    try {
      const counselorRes = await axiosJWT.get(
        `${BASE_URL}/counselors/academic`,
        {
          params: {
            search: debouncedKeyword,
            ...filters,
            page: currentPage,
          },
        }
      );
      const counselorData = counselorRes?.data?.content || [];
      setCounselors(counselorData);
      setLoading(false);
    } catch (err) {
      console.log("Can't fetch academic counselors");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartment = async () => {
    try {
      const departmentsRes = await axiosJWT.get(
        `${BASE_URL}/academic/departments`
      );
      const departmentsData = departmentsRes?.data || [];
      setDepartments(departmentsData);
    } catch (err) {
      console.log("Can't fetch departments");
    }
  };

  const fetchMajor = async () => {
    try {
      const majorsRes = await axiosJWT.get(
        `${BASE_URL}/academic/departments/${selectedDepartment?.id}/majors`
      );
      const majorsData = majorsRes?.data || [];
      setMajors(majorsData);
    } catch (err) {
      console.log("Can't fetch majors");
    }
  };

  const fetchSpecialization = async () => {
    try {
      const specializationsRes = await axiosJWT.get(
        `${BASE_URL}/academic/majors/${selectedMajor?.id}/specializations`
      );
      const specializationsData = specializationsRes?.data || [];
      setSpecializations(specializationsData);
    } catch (err) {
      console.log("Can't fetch specializations");
    }
  };

  useEffect(() => {
    fetchDepartment();
    if (selectedDepartment !== "") {
      fetchMajor();
      if (selectedMajor !== "") {
        fetchSpecialization();
      }
    }
  }, [selectedDepartment, selectedMajor, selectedSpecialization]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 1000);
    return () => clearTimeout(timer);
  }, [keyword]);

  const applyFilters = () => {
    setLoading(true);
    setCurrentPage(1);
    const newFilters = {
      availableFrom: availableFrom,
      availableTo: availableTo,
      ratingFrom: selectedFrom,
      ratingTo: selectedTo,
      SortDirection: sortDirection,
      gender: gender,
      departmentId: selectedDepartment.id,
      majorId: selectedMajor.id,
      specializationId: selectedSpecialization.id,
    };
    setFilters(newFilters);
    fetchData(newFilters);
    setIsExpanded(false);
  };

  const cancelFilters = () => {
    setLoading(true);
    setCurrentPage(1);
    const resetFilters = {
      availableFrom: "",
      availableTo: "",
      ratingFrom: 0,
      ratingTo: 5,
      SortDirection: "",
      gender: "",
      departmentId: "",
      majorId: "",
      specializationId: "",
    };
    setKeyword("");
    setAvailableFrom(resetFilters.availableFrom);
    setAvailableTo(resetFilters.availableTo);
    setSelectedFrom(resetFilters.ratingFrom);
    setSelectedTo(resetFilters.ratingTo);
    setSortDirection(resetFilters.SortDirection);
    setGender(resetFilters.gender);
    setSelectedDepartment(resetFilters.departmentId);
    setSelectedMajor(resetFilters.majorId);
    setSelectedSpecialization(resetFilters.specializationId);
    setFilters(resetFilters);
    fetchData(resetFilters);
    setIsExpanded(false);
  };

  useEffect(() => {
    // if (debouncedKeyword) {
    fetchData();
    // }
  }, [debouncedKeyword]);

  useEffect(() => {
    setLoading(true);
    fetchData({ ...filters, page: currentPage });
    setTimeout(() => setLoading(false), 1500);
  }, [currentPage]);

  const [isExpanded, setIsExpanded] = useState(false);
  // const layoutHeight = useRef({ container: 0, text: 0 });
  // const accordionHeight = useRef(new Animated.Value(-1)).current;
  // const iconRotation = useRef(new Animated.Value(0)).current;

  // useEffect(() => {
  //   Animated.parallel([
  //     Animated.spring(accordionHeight, {
  //       toValue:
  //         layoutHeight.current.container + isExpanded
  //           ? layoutHeight.current.text
  //           : 0,
  //       useNativeDriver: false,
  //     }),
  //     Animated.spring(iconRotation, {
  //       toValue: isExpanded ? 180 : 0,
  //       useNativeDriver: true,
  //     }),
  //   ]).start();
  // }, [isExpanded]);

  // const calculateLayout = (e) => {
  //   if (Platform.OS === "web" || layoutHeight.current.container === 0) {
  //     layoutHeight.current.container = 0;
  //     setInitHeight();
  //   }
  // };

  // const setInitHeight = () => {
  //   const newHeight = layoutHeight.current.container;
  //   if (newHeight > 0) {
  //     accordionHeight.setValue(
  //       newHeight + (isExpanded ? layoutHeight.current.text : 0)
  //     );
  //   }
  // };

  // const rotateIcon = iconRotation.interpolate({
  //   inputRange: [0, 180],
  //   outputRange: ["0deg", "90deg"],
  // });

  const handleOpenBooking = async (counselorId) => {
    try {
      const counselorRes = await axiosJWT.get(
        `${BASE_URL}/counselors/academic/${counselorId}`
      );
      const counselorData = counselorRes?.data || [];
      setSelectedCounselor(counselorData);
      // setSelectedDate2(new Date().toISOString().split("T")[0]);
      setSelectedDate2((prev) => {
        return selectedDate2 || prev;
      });
      const startOfWeek = new Date(selectedDate2);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 31);
      startOfWeek.setDate(startOfWeek.getDate() - 31);
      const from = startOfWeek.toISOString().split("T")[0];
      const to = endOfWeek.toISOString().split("T")[0];

      await fetchSlots(counselorId, from, to);
      setOpenBooking(true);
    } catch (err) {
      console.log("Failed to open booking site");
    }
  };

  const formatDate = (value) => {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  };

  const onFromDateChange = (e, selectedDate) => {
    if (e?.type === "dismissed") {
      setShowFromPicker(false);
      return;
    }
    const currentDate = selectedDate || new Date();
    setShowFromPicker(Platform.OS === "ios");
    if (new Date(currentDate) > new Date(availableTo)) {
      setModalMessage("The 'From' date cannot be later than the 'To' date.");
      setShowModal(true);
    } else {
      setAvailableFrom(formatDate(currentDate));
    }
  };

  const onToDateChange = (e, selectedDate) => {
    if (e?.type === "dismissed") {
      setShowToPicker(false);
      return;
    }
    const currentDate = selectedDate || new Date();
    setShowToPicker(Platform.OS === "ios");
    if (new Date(currentDate) < new Date(availableFrom)) {
      setModalMessage("The 'To' date cannot be earlier than the 'From' date.");
      setShowModal(true);
    } else {
      setAvailableTo(formatDate(currentDate));
    }
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

  const handleCloseBooking = () => {
    setSelectedCounselor({});
    setSelectedSlot(null);
    isOnline(null);
    setOpenBooking(false);
  };

  const error = console.error;
  console.error = (...args) => {
    if (/defaultProps/.test(args[0])) return;
    error(...args);
  };

  const fetchSlots = async (counselorId, from, to) => {
    try {
      const response = await axiosJWT.get(
        `${BASE_URL}/counselors/daily-slots/${counselorId}?from=${from}&to=${to}`
      );
      setSlots(response.data.content);
    } catch (err) {
      console.log("Can't fetch slots on this day", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Can't fetch slots on this day",
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

    if (selectedCounselor?.id) {
      fetchSlots(selectedCounselor.id, from, to);
    }
  };

  const renderSlotsForSelectedDate2 = () => {
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
                  ? "#F39300"
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
                  ? "white"
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
                    ? "white"
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
              {/* {slot.slotCode}{"\n"} */}
              {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  useEffect(() => {}, [socket, selectedDate2]);

  const handleSocketChange = useCallback(
    (day) => {
      const handleSlotRender = (data) => {
        console.log(data);
        try {
          setSlots((prevSlots) => {
            let updatedSlots = { ...prevSlots };
            let newSlot = updatedSlots[data.dateChange].map((item) => {
              if (item.slotId === data.slotId) {
                return {
                  ...item,
                  status: data.newStatus,
                  myAppointment: data.studentId === userData?.id ? true : false,
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

      setSelectedDate2(day.dateString);
      setSelectedSlot("");
      console.log(`/user/${day.dateString}/${selectedCounselor?.id}/slot`);
      if (socket) {
        socket.off(`/user/${selectedDate2}/${selectedCounselor?.id}/slot`);
        console.log("Begin");
        socket.on(
          `/user/${day.dateString}/${selectedCounselor?.id}/slot`,
          handleSlotRender
        );
      }
    },
    [socket, selectedDate2, selectedCounselor, userData]
  );

  const handleCreateRequest = async () => {
    try {
      const response = await axiosJWT.post(
        `${BASE_URL}/booking-counseling/${selectedCounselor?.id}/appointment-request/create`,
        {
          slotCode: selectedSlot?.slotCode,
          date: selectedDate2,
          isOnline: online,
          reason: reason,
        }
      );
      const data = await response.data;
      if (data && data.status == 200) {
        setOpenConfirm(false);
        const startOfWeek = new Date(selectedDate2);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 31);
        startOfWeek.setDate(startOfWeek.getDate() - 31);
        const from = startOfWeek.toISOString().split("T")[0];
        const to = endOfWeek.toISOString().split("T")[0];
        renderSlotsForSelectedDate2();
        fetchSlots(selectedCounselor?.id, from, to);
        fetchData();
        setOpenSuccess(true);
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to request",
        });
      }
    } catch (err) {
      console.log("Something error when booking", err);
      setIsError(true);
      setErrorMessage(
        "You already created a request that have the same chosen slot on this day. Please choose a different slot"
      );
    }
  };

  const handleCloseSuccess = () => {
    setOpenSuccess(false);
    setSelectedSlot(null);
    isOnline(null);
    setReason("");
  };

  return (
    <>
      <View style={{ backgroundColor: "#f5f7fd", flex: 1 }}>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            paddingHorizontal: 20,
            // paddingTop: height * 0.005,
            paddingTop: height * 0.095,
            paddingBottom: height * 0.01,
            justifyContent: "flex-start",
          }}
        />
        <>
          <View
            style={{
              flexDirection: "row",
              borderRadius: 30,
              marginHorizontal: 20,
              paddingHorizontal: 16,
              marginBottom: 10,
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
              placeholder="Search by Counselor's name"
              placeholderTextColor="#F39300"
              value={keyword}
              onChangeText={(value) => setKeyword(value)}
              style={{
                flex: 1,
                fontSize: 18,
                opacity: 0.8,
                marginHorizontal: 4,
              }}
            />
            {keyword !== "" && (
              <TouchableOpacity onPress={() => setKeyword("")}>
                <Ionicons
                  name="close"
                  size={28}
                  style={{ color: "#F39300", opacity: 0.7 }}
                />
              </TouchableOpacity>
            )}
          </View>
          <View
            style={{
              marginHorizontal: 20,
            }}
          >
            <View
              style={{
                display: "flex",
                flexDirection: "row",
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
                    {counselors.totalElements} Counselors{" "}
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
                      width: width * 0.7,
                      height: 20,
                      backgroundColor: "#ededed",
                      borderRadius: 20,
                    }}
                  />
                )}
              </View>
              <View
                style={{
                  flex: 1,
                  alignItems: "flex-end",
                  justifyContent: "center",
                }}
              >
                {/* <TouchableOpacity
                  onPress={() => setIsExpanded(!isExpanded)}
                  onLayout={calculateLayout}
                  style={{
                    backgroundColor: isExpanded ? "#F39300" : "#e3e3e3",
                    borderRadius: 40,
                    padding: 8,
                  }}
                >
                  <Animated.View
                    style={{ transform: [{ rotate: rotateIcon }] }}
                  >
                    <Ionicons
                      name="filter"
                      size={26}
                      style={{ color: isExpanded ? "white" : "black" }}
                    />
                  </Animated.View>
                </TouchableOpacity> */}
                <FilterToggle
                  isExpanded={isExpanded}
                  toggleExpanded={() => setIsExpanded((prev) => !prev)}
                />
              </View>
            </View>
            {/* <Animated.View
              style={{
                height: accordionHeight,
                marginTop: 8,
                overflow: "hidden",
                backgroundColor: "#ededed",
                borderRadius: 20,
              }}
            >
              <View
                style={{
                  position: "absolute",
                  width: "100%",
                  paddingVertical: 4,
                }}
                onLayout={(e) =>
                  (layoutHeight.current.text = e.nativeEvent.layout.height)
                }
              > */}
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
                      Available From:
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
                        {availableFrom !== "" ? availableFrom : "xxxx-xx-xx"}
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
                      Available To:
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
                        {availableTo !== "" ? availableTo : "xxxx-xx-xx"}
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
                    paddingVertical: 12,
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
                        marginRight: 4,
                      }}
                    >
                      Rating From:
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                      }}
                    >
                      {ratings.map((item, index) => (
                        <View key={index}>
                          {item < selectedTo && (
                            <TouchableOpacity
                              key={`From: ${index}`}
                              onPress={() => {
                                if (item < selectedTo) setSelectedFrom(item);
                              }}
                              disabled={item >= selectedTo}
                              style={[
                                {
                                  paddingHorizontal: 10,
                                  paddingVertical: 4,
                                  borderRadius: 20,
                                  marginRight: 3,
                                  backgroundColor: "white",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  elevation: 2,
                                  opacity: item >= selectedTo ? 0.6 : 1,
                                },
                                selectedFrom === item && {
                                  backgroundColor: "#F39300",
                                },
                              ]}
                            >
                              <Text
                                style={{
                                  color:
                                    selectedFrom === item ? "white" : "black",
                                  fontSize: 14,
                                  fontWeight: "600",
                                }}
                              >
                                {item}
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      ))}
                    </View>
                  </View>
                  <View style={{ flex: 1, paddingLeft: 10 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        marginBottom: 8,
                        marginRight: 4,
                      }}
                    >
                      Rating To:
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                      }}
                    >
                      {ratings.map((item, index) => (
                        <View key={index}>
                          {item > selectedFrom && (
                            <TouchableOpacity
                              key={`To: ${index}`}
                              onPress={() => {
                                if (item > selectedFrom) setSelectedTo(item);
                              }}
                              disabled={item <= selectedFrom}
                              style={[
                                {
                                  paddingHorizontal: 10,
                                  paddingVertical: 4,
                                  borderRadius: 20,
                                  marginRight: 3,
                                  backgroundColor: "white",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  elevation: 2,
                                  // opacity: item <= selectedFrom ? 0.6 : 1
                                },
                                selectedTo === item && {
                                  backgroundColor: "#F39300",
                                },
                              ]}
                            >
                              <Text
                                style={{
                                  color:
                                    selectedTo === item ? "white" : "black",
                                  fontSize: 14,
                                  fontWeight: "600",
                                }}
                              >
                                {item}
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      ))}
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
                    Sort:
                  </Text>
                  <View style={{ flexDirection: "row" }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginHorizontal: 8,
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
                        marginHorizontal: 8,
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
                            color:
                              sortDirection == "DESC" ? "#F39300" : "black",
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
                    Gender:
                  </Text>
                  <View style={{ flexDirection: "row" }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginHorizontal: 8,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => setGender("MALE")}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <Ionicons
                          name={
                            gender == "MALE"
                              ? "radio-button-on"
                              : "radio-button-off"
                          }
                          size={20}
                          color={gender == "MALE" ? "#F39300" : "gray"}
                          style={{ marginRight: 4 }}
                        />
                        <Ionicons
                          name="male"
                          size={20}
                          style={{
                            color: gender == "MALE" ? "#F39300" : "black",
                          }}
                        />
                      </TouchableOpacity>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginHorizontal: 8,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => setGender("FEMALE")}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <Ionicons
                          name={
                            gender == "FEMALE"
                              ? "radio-button-on"
                              : "radio-button-off"
                          }
                          size={20}
                          color={gender == "FEMALE" ? "#F39300" : "gray"}
                          style={{ marginRight: 4 }}
                        />
                        <Ionicons
                          name="female"
                          size={20}
                          style={{
                            color: gender == "FEMALE" ? "#F39300" : "black",
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
                    }}
                  >
                    Academic Fields:
                  </Text>
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
                  {/* <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: "#333",
                      minWidth: "35%",
                    }}
                  >
                    Department:
                  </Text> */}
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
                      // marginLeft: 8,
                    }}
                    placeholderStyle={{ fontSize: 14 }}
                    selectedTextStyle={{
                      fontSize: 14,
                      color: selectedDepartment ? "black" : "white",
                    }}
                    inputSearchStyle={{ height: 40, fontSize: 16 }}
                    maxHeight={250}
                    data={departments}
                    labelField="name"
                    search
                    value={
                      selectedDepartment !== ""
                        ? selectedDepartment?.name
                        : "Select Department"
                    }
                    placeholder={
                      selectedDepartment !== ""
                        ? selectedDepartment?.name
                        : "Select Department"
                    }
                    searchPlaceholder="Search Department"
                    onFocus={() => setExpanded(true)}
                    onBlur={() => setExpanded(false)}
                    onChange={(item) => {
                      setSelectedDepartment(item);
                      setExpanded(false);
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
                              item?.name == selectedDepartment?.name
                                ? "#F39300"
                                : "white",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "500",
                              color:
                                item?.name == selectedDepartment?.name
                                  ? "white"
                                  : "black",
                            }}
                          >
                            {item?.name}
                          </Text>
                          {selectedDepartment?.name === item?.name && (
                            <Ionicons
                              color="white"
                              name="checkmark"
                              size={20}
                            />
                          )}
                        </View>
                      );
                    }}
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
                  {/* <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: "#333",
                      minWidth: "35%",
                    }}
                  >
                    Major:
                  </Text> */}
                  <Dropdown
                    disable={selectedDepartment === ""}
                    style={{
                      backgroundColor: "white",
                      borderColor: expanded2 ? "#F39300" : "black",
                      flex: 1,
                      height: 30,
                      borderWidth: 1,
                      borderColor: "grey",
                      borderRadius: 10,
                      paddingHorizontal: 12,
                      // marginLeft: 8,
                    }}
                    placeholderStyle={{ fontSize: 14 }}
                    selectedTextStyle={{
                      fontSize: 14,
                      color: selectedMajor ? "black" : "white",
                    }}
                    inputSearchStyle={{ height: 40, fontSize: 16 }}
                    maxHeight={250}
                    data={majors}
                    labelField="name"
                    search
                    value={
                      selectedMajor !== ""
                        ? selectedMajor?.name
                        : "Select Major"
                    }
                    placeholder={
                      selectedMajor !== ""
                        ? selectedMajor?.name
                        : "Select Major"
                    }
                    searchPlaceholder="Search Major"
                    onFocus={() => setExpanded2(true)}
                    onBlur={() => setExpanded2(false)}
                    onChange={(item) => {
                      setSelectedMajor(item);
                      setExpanded2(false);
                    }}
                    renderRightIcon={() => (
                      <Ionicons
                        color={expanded2 ? "#F39300" : "black"}
                        name={expanded2 ? "caret-up" : "caret-down"}
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
                              item?.name == selectedMajor?.name
                                ? "#F39300"
                                : "white",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "500",
                              color:
                                item?.name == selectedMajor?.name
                                  ? "white"
                                  : "black",
                            }}
                          >
                            {item?.name}
                          </Text>
                          {selectedMajor?.name === item?.name && (
                            <Ionicons
                              color="white"
                              name="checkmark"
                              size={20}
                            />
                          )}
                        </View>
                      );
                    }}
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
                  {/* <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: "#333",
                      minWidth: "35%",
                    }}
                  >
                    Specialization:
                  </Text> */}
                  {/* <Dropdown
                    disable={selectedDepartment === "" || selectedMajor === ""}
                    style={{
                      backgroundColor: "white",
                      borderColor: expanded3 ? "#F39300" : "black",
                      flex: 1,
                      height: 30,
                      borderWidth: 1,
                      borderColor: "grey",
                      borderRadius: 10,
                      paddingHorizontal: 12,
                      // marginLeft: 8,
                    }}
                    placeholderStyle={{ fontSize: 14 }}
                    selectedTextStyle={{
                      fontSize: 14,
                      color: selectedSpecialization ? "black" : "white",
                    }}
                    inputSearchStyle={{ height: 40, fontSize: 16 }}
                    maxHeight={250}
                    data={specializations}
                    labelField="name"
                    search
                    value={
                      selectedSpecialization !== ""
                        ? selectedSpecialization?.name
                        : "Select Specialization"
                    }
                    placeholder={
                      selectedSpecialization !== ""
                        ? selectedSpecialization?.name
                        : "Select Specialization"
                    }
                    searchPlaceholder="Search Specialization"
                    onFocus={() => setExpanded3(true)}
                    onBlur={() => setExpanded3(false)}
                    onChange={(item) => {
                      setSelectedSpecialization(item);
                      setExpanded3(false);
                    }}
                    renderRightIcon={() => (
                      <Ionicons
                        color={expanded3 ? "#F39300" : "black"}
                        name={expanded3 ? "caret-up" : "caret-down"}
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
                              item?.name == selectedSpecialization?.name
                                ? "#F39300"
                                : "white",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "500",
                              color:
                                item?.name == selectedSpecialization?.name
                                  ? "white"
                                  : "black",
                            }}
                          >
                            {item?.name}
                          </Text>
                          {selectedSpecialization?.name === item?.name && (
                            <Ionicons
                              color="white"
                              name="checkmark"
                              size={20}
                            />
                          )}
                        </View>
                      );
                    }}
                  /> */}
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
            {/* </View>
            </Animated.View> */}
          </View>
        </>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          style={{ marginHorizontal: 20 }}
        >
          {loading ? (
            <>
              <CounselorSkeleton />
              <CounselorSkeleton />
              <CounselorSkeleton />
              <CounselorSkeleton />
            </>
          ) : (
            counselors?.data?.map((item, index) => (
              <View
                key={item.id}
                style={{
                  backgroundColor: "white",
                  borderRadius: 20,
                  paddingHorizontal: 8,
                  paddingVertical: 12,
                  marginVertical: 10,
                  elevation: 1,
                  borderWidth: 0.75,
                  borderColor: "#e3e3e3",
                }}
              >
                <View style={{ flexDirection: "row", marginHorizontal: 8 }}>
                  <View>
                    <Image
                      source={{ uri: item.profile.avatarLink }}
                      style={{
                        width: 60,
                        height: 60,
                        marginRight: 8,
                        borderRadius: 40,
                      }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: "bold",
                          color: "#333",
                        }}
                      >
                        {item.profile.fullName}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: "#F39300",
                          paddingHorizontal: 12,
                          paddingVertical: 2,
                          borderRadius: 20,
                        }}
                      >
                        <Ionicons name="star" size={16} color="white" />
                        <Text
                          style={{
                            fontSize: 16,
                            marginLeft: 4,
                            fontWeight: "bold",
                            color: "white",
                          }}
                        >
                          {item.rating}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={{
                        fontSize: 18,
                        color: "gray",
                        marginVertical: 2,
                      }}
                    >
                      {item.major?.name}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    backgroundColor: "#f0f0f0",
                    borderRadius: 10,
                    paddingVertical: 8,
                    marginTop: 8,
                    marginHorizontal: 8,
                    flexDirection: "row",
                    justifyContent: "center",
                  }}
                >
                  <View
                    style={{
                      flex: 1.35,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                    }}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Ionicons name="mail" size={20} color="black" />
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          marginLeft: 8,
                        }}
                      >
                        Email
                      </Text>
                    </View>
                    <Text style={{ marginTop: 8, color: "#555" }}>
                      {item.email}
                    </Text>
                  </View>
                  <View
                    style={{
                      borderLeftWidth: 0.75,
                      borderColor: "#ccc",
                      height: "90%",
                      marginVertical: 4,
                    }}
                  />
                  <View
                    style={{
                      flex: 1,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                    }}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Ionicons name="call" size={20} color="black" />
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          marginLeft: 8,
                        }}
                      >
                        Contact
                      </Text>
                    </View>
                    <Text style={{ marginTop: 8, color: "#555" }}>
                      {item.profile.phoneNumber}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={{
                    backgroundColor: "#F39300",
                    borderRadius: 10,
                    paddingVertical: 8,
                    marginTop: 12,
                    marginHorizontal: 8,
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "row",
                  }}
                  onPress={() => handleOpenBooking(item.id)}
                >
                  <Text
                    style={{
                      fontWeight: "500",
                      color: "white",
                      fontSize: 18,
                      marginRight: 8,
                    }}
                  >
                    Book Appointment
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={24}
                    style={{ color: "white" }}
                  />
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
        {!loading && (
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            length={counselors?.data?.length}
            totalPages={counselors?.totalPages}
          />
        )}
        <Modal
          transparent={true}
          visible={openBooking}
          animationType="slide"
          onRequestClose={handleCloseBooking}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              alignItems: "center",
              backgroundColor: "rgba(0, 0, 0, 0.2)",
            }}
          >
            {selectedCounselor && (
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
                    marginHorizontal: 20,
                    marginTop: 16,
                    marginBottom: 8,
                  }}
                >
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#ededed",
                      padding: 4,
                      borderRadius: 20,
                      alignSelf: "flex-start",
                      alignItems: "flex-start",
                    }}
                    onPress={handleCloseBooking}
                  >
                    <Ionicons name="chevron-back" size={28} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#ededed",
                      padding: 4,
                      padding: 4,
                      borderRadius: 20,
                      alignSelf: "flex-end",
                      alignItems: "flex-end",
                    }}
                    onPress={() => (
                      setOpenExtendInfo(true), setExtendInfo(selectedCounselor)
                    )}
                  >
                    <Ionicons name="information" size={28} />
                  </TouchableOpacity>
                  {/* <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "white",
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                      borderWidth: 1.5,
                      borderColor: "#F39300",
                      borderRadius: 20,
                    }}
                  >
                    <Ionicons name="star" size={16} color="#F39300" />
                    <Text
                      style={{
                        fontSize: 16,
                        marginLeft: 4,
                        fontWeight: "bold",
                        color: "#F39300",
                      }}
                    >
                      {selectedCounselor?.rating}
                    </Text>
                  </View> */}
                </View>
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
                    <View>
                      <View
                        style={{
                          alignItems: "center",
                        }}
                      >
                        <View
                          style={{ position: "relative", marginBottom: 12 }}
                        >
                          <Image
                            source={{
                              uri: selectedCounselor.profile?.avatarLink,
                            }}
                            style={{
                              width: width * 0.32,
                              height: width * 0.32,
                              borderRadius: 100,
                              backgroundColor: "white",
                              borderColor: "#F39300",
                              borderWidth: 2,
                            }}
                          />
                          <Ionicons
                            name={
                              selectedCounselor.profile?.gender == "MALE"
                                ? "male"
                                : "female"
                            }
                            size={26}
                            style={{
                              position: "absolute",
                              right: 4,
                              bottom: 0,
                              backgroundColor: "#F39300",
                              color: "white",
                              // color:
                              //   selectedCounselor.profile?.gender == "MALE"
                              //     ? "#0000fa"
                              //     : "#ff469e",
                              padding: 5,
                              // borderWidth: 1.5,
                              // borderColor: "#ededed",
                              borderRadius: 40,
                            }}
                          />
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 24,
                              fontWeight: "bold",
                              marginBottom: 16,
                            }}
                          >
                            {selectedCounselor.profile?.fullName}
                          </Text>
                        </View>
                        {/* <Text
                            style={{
                              fontSize: 18,
                              color: "gray",
                              marginBottom: 16,
                            }}
                          >
                            {selectedCounselor.specialization?.name}
                          </Text> */}
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          backgroundColor: "white",
                          paddingVertical: 8,
                          marginHorizontal: 20,
                          borderRadius: 10,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            width: "50%",
                          }}
                        >
                          <MaterialIcons
                            name="cake"
                            size={24}
                            color="#F39300"
                            style={{ marginHorizontal: 12 }}
                          />
                          <View>
                            <Text
                              style={{
                                fontSize: 14,
                                fontWeight: "600",
                                color: "gray",
                              }}
                            >
                              Date of Birth
                            </Text>
                            <Text
                              style={{
                                fontSize: 18,
                                fontWeight: "bold",
                                opacity: 0.7,
                              }}
                            >
                              {formatDate(
                                selectedCounselor.profile?.dateOfBirth
                              )}
                            </Text>
                          </View>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            width: "50%",
                          }}
                        >
                          <MaterialCommunityIcons
                            name="certificate"
                            size={24}
                            color="#F39300"
                            style={{ marginHorizontal: 12 }}
                          />
                          <View>
                            <Text
                              style={{
                                fontSize: 14,
                                fontWeight: "600",
                                color: "gray",
                              }}
                            >
                              Degree
                            </Text>
                            <Text
                              style={{
                                fontSize: 18,
                                fontWeight: "bold",
                                opacity: 0.7,
                              }}
                            >
                              {selectedCounselor.academicDegree}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          backgroundColor: "white",
                          paddingVertical: 8,
                          marginHorizontal: 20,
                          borderRadius: 10,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <Ionicons
                            name="briefcase"
                            size={24}
                            color="#F39300"
                            style={{ marginHorizontal: 12 }}
                          />
                          <View>
                            <Text
                              style={{
                                fontSize: 14,
                                fontWeight: "600",
                                color: "gray",
                              }}
                            >
                              Department
                            </Text>
                            <Text
                              style={{
                                fontSize: 18,
                                fontWeight: "bold",
                                opacity: 0.7,
                              }}
                            >
                              {selectedCounselor?.department?.name} (
                              {selectedCounselor?.department?.code})
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          backgroundColor: "white",
                          paddingVertical: 8,
                          marginHorizontal: 20,
                          borderRadius: 10,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <Ionicons
                            name="briefcase"
                            size={24}
                            color="#F39300"
                            style={{ marginHorizontal: 12 }}
                          />
                          <View>
                            <Text
                              style={{
                                fontSize: 14,
                                fontWeight: "600",
                                color: "gray",
                              }}
                            >
                              Major
                            </Text>
                            <Text
                              style={{
                                fontSize: 18,
                                fontWeight: "bold",
                                opacity: 0.7,
                              }}
                            >
                              {selectedCounselor?.major?.name} (
                              {selectedCounselor?.major?.code})
                            </Text>
                          </View>
                        </View>
                      </View>
                      {/* <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          backgroundColor: "white",
                          paddingVertical: 8,
                          marginHorizontal: 20,
                          borderRadius: 10,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <Ionicons
                            name="briefcase"
                            size={24}
                            color="#F39300"
                            style={{ marginHorizontal: 12 }}
                          />
                          <View>
                            <Text
                              style={{
                                fontSize: 14,
                                fontWeight: "600",
                                color: "gray",
                              }}
                            >
                              Specialization
                            </Text>
                            <Text
                              style={{
                                fontSize: 18,
                                fontWeight: "bold",
                                opacity: 0.7,
                              }}
                            >
                              {selectedCounselor?.specialization?.name}
                            </Text>
                          </View>
                        </View>
                      </View> */}
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
                              {selectedDate2 !== ""
                                ? selectedDate2
                                : "xxxx-xx-xx"}
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
                          {/* <Text
                              style={{
                                fontSize: 18,
                                marginHorizontal: 20,
                                fontWeight: "400",
                                marginBottom: 12,
                              }}
                            >
                              Date:{" "}
                              <Text
                                style={{ fontWeight: "600", color: "#F39300" }}
                              >
                                {selectedDate2}
                              </Text>
                            </Text> */}
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
                          // onWeekChange={(newWeek) => handleWeekChange(newWeek.dateString)}
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
                          {renderSlotsForSelectedDate2()}
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
                                  Meeting method{" "}
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
                                        color={
                                          online == true ? "#F39300" : "gray"
                                        }
                                        style={{ marginRight: 8 }}
                                      />
                                      <Text
                                        style={{
                                          fontSize: 20,
                                          color:
                                            online == true
                                              ? "#F39300"
                                              : "black",
                                          fontWeight:
                                            online == true ? "600" : "0",
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
                                        color={
                                          online == false ? "#F39300" : "gray"
                                        }
                                        style={{ marginRight: 8 }}
                                      />
                                      <Text
                                        style={{
                                          fontSize: 20,
                                          color:
                                            online == false
                                              ? "#F39300"
                                              : "black",
                                          fontWeight:
                                            online == false ? "600" : "0",
                                        }}
                                      >
                                        Offline
                                      </Text>
                                    </TouchableOpacity>
                                  </View>
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
                                  What are your concerns?{" "}
                                  <Text style={{ color: "#F39300" }}>*</Text>
                                </Text>
                                <View>
                                  <TextInput
                                    placeholder="Write here"
                                    placeholderTextColor="gray"
                                    keyboardType="default"
                                    multiline={true}
                                    numberOfLines={2}
                                    value={reason}
                                    onChangeText={(value) => setReason(value)}
                                    style={{
                                      flex: 1,
                                      fontWeight: "600",
                                      fontSize: 16,
                                      opacity: 0.8,
                                      paddingVertical: 8,
                                      textAlignVertical: "top",
                                      paddingHorizontal: 12,
                                      backgroundColor: "#ededed",
                                      borderColor: "gray",
                                      borderWidth: 1,
                                      borderRadius: 10,
                                    }}
                                  />
                                </View>
                              </View>
                            </>
                          )}
                      </View>
                    </View>
                  </ScrollView>
                  {/* <SectionList
                        showsVerticalScrollIndicator={false}
                        sections={[]}
                        renderItem={() => null}
                        ListHeaderComponent={() => ()}
                        keyExtractor={selectedCounselor}
                  /> */}
                </CalendarProvider>
                <View
                  style={{
                    width: "100%",
                    borderBottomWidth: 1,
                    borderColor: "lightgrey",
                  }}
                />
                <TouchableOpacity
                  style={{
                    backgroundColor:
                      slots[selectedDate2]?.length === 0 ||
                      slots[selectedDate2]?.every(
                        (item) => item.status === "EXPIRED"
                      ) ||
                      selectedSlot === "" ||
                      online === null ||
                      reason === ""
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
                  disabled={
                    slots[selectedDate2]?.length === 0 ||
                    slots[selectedDate2]?.every(
                      (item) => item.status === "EXPIRED"
                    ) ||
                    selectedSlot === "" ||
                    online === null ||
                    reason === ""
                  }
                  onPress={() => setOpenConfirm(true)}
                  activeOpacity={0.8}
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
                        reason === ""
                          ? "gray"
                          : "white",
                      fontSize: 20,
                      marginRight: 8,
                    }}
                  >
                    Book Appointment
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
                        reason === ""
                          ? "gray"
                          : "white",
                    }}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Modal>
        <ExtendInfoModal
          openExtendInfo={openExtendInfo}
          setOpenExtendInfo={setOpenExtendInfo}
          extendInfo={extendInfo}
          setExtendInfo={setExtendInfo}
        />
        <ConfirmBookingModal
          openConfirm={openConfirm}
          setOpenConfirm={setOpenConfirm}
          selectedDate={selectedDate2}
          selectedSlot={selectedSlot}
          online={online}
          reason={reason}
          selectedCounselor={selectedCounselor}
          onPress={handleCreateRequest}
        />
        <Modal
          transparent={true}
          visible={openSuccess}
          animationType="fade"
          onRequestClose={handleCloseSuccess}
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
                borderRadius: 20,
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: "#ededed",
                  padding: 4,
                  borderRadius: 30,
                  alignSelf: "flex-start",
                }}
                onPress={handleCloseSuccess}
              >
                <Ionicons name="chevron-back" size={28} color="black" />
              </TouchableOpacity>
              <View
                style={{
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Ionicons name="checkmark-circle" size={80} color="#F39300" />
                <Text
                  style={{
                    color: "#F39300",
                    fontSize: 30,
                    fontWeight: "bold",
                  }}
                >
                  Success!
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 18,
                  textAlign: "center",
                  marginBottom: 20,
                }}
              >
                Request has been sent successfully!{"\n"}
                Please wait while the counselor processes your request.
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: "#F39300",
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 30,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => (
                  handleCloseSuccess(),
                  handleCloseBooking(),
                  navigation.navigate("Request", {
                    prevScreen: "Academic",
                  })
                )}
                activeOpacity={0.8}
              >
                <Text
                  style={{
                    fontSize: 18,
                    color: "white",
                    fontWeight: "600",
                  }}
                >
                  See your request
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <ErrorModal
          isError={isError}
          setIsError={setIsError}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
        />
      </View>
    </>
  );
}
