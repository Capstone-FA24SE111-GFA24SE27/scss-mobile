import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  Animated,
  Platform,
  Modal,
  Dimensions,
  SectionList,
  Alert,
} from "react-native";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import axiosJWT, { BASE_URL } from "../../config/Config";
import {
  CalendarProvider,
  ExpandableCalendar,
  WeekCalendar,
} from "react-native-calendars";
import { SocketContext } from "../context/SocketContext";
import { AuthContext } from "../context/AuthContext";
import { CounselorSkeleton } from "../layout/Skeleton";
import Toast from "react-native-toast-message";
import { Dropdown } from "react-native-element-dropdown";
import ErrorModal from "../layout/ErrorModal";

export default function NonAcademicCounselor() {
  const navigation = useNavigation();
  const { width, height } = Dimensions.get("screen");
  const [loading, setLoading] = useState(true);
  const { userData } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const scrollViewRef = useRef(null);
  const [counselors, setCounselors] = useState([]);
  const [filters, setFilters] = useState({
    ratingFrom: 1,
    ratingTo: 5,
    SortDirection: "",
    expertiseId: "",
  });
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [selectedFrom, setSelectedFrom] = useState(1);
  const [selectedTo, setSelectedTo] = useState(5);
  const ratings = [1, 2, 3, 4, 5];
  const [sortDirection, setSortDirection] = useState("");
  const [expertises, setExpertises] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [selectedExpertise, setSelectedExpertise] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCounselor, setSelectedCounselor] = useState({});
  const [open, setOpen] = useState(false);
  const [slots, setSlots] = useState({});
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedSlot, setSelectedSlot] = useState("");
  const [online, isOnline] = useState(null);
  const [reason, setReason] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openSucess, setOpenSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useFocusEffect(
    React.useCallback(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
      }
      fetchData(filters, { page: currentPage });
      fetchExpertise();
    }, [debouncedKeyword, filters, currentPage])
  );

  const fetchData = async (filters = {}) => {
    try {
      const counselorRes = await axiosJWT.get(
        `${BASE_URL}/counselors/non-academic`,
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
      console.log(counselors);
    } catch (err) {
      console.log("Can't fetch non-academic counselors");
    }
  };

  const fetchExpertise = async () => {
    try {
      const response = await axiosJWT.get(`${BASE_URL}/counselors/expertise`);
      setExpertises(response.data.content);
    } catch (error) {
      console.log("Error fetching expertises");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 1000);
    return () => clearTimeout(timer);
  }, [keyword]);

  const applyFilters = () => {
    const newFilters = {
      ratingFrom: selectedFrom,
      ratingTo: selectedTo,
      SortDirection: sortDirection,
      expertiseId: selectedExpertise.id,
    };
    setFilters(newFilters);
    fetchData(newFilters);
  };

  const cancelFilters = () => {
    const resetFilters = {
      ratingFrom: 1,
      ratingTo: 5,
      SortDirection: "",
      expertiseId: "",
    };
    setKeyword("");
    setSelectedFrom(resetFilters.ratingFrom);
    setSelectedTo(resetFilters.ratingTo);
    setSortDirection(resetFilters.SortDirection);
    setSelectedExpertise(resetFilters.expertiseId);
    setFilters(resetFilters);
    fetchData(resetFilters);
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
  const layoutHeight = useRef({ container: 0, text: 0 });
  const accordionHeight = useRef(new Animated.Value(-1)).current;
  const iconRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(accordionHeight, {
        toValue:
          layoutHeight.current.container + isExpanded
            ? layoutHeight.current.text
            : 0,
        useNativeDriver: false,
      }),
      Animated.spring(iconRotation, {
        toValue: isExpanded ? 180 : 0,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isExpanded]);

  const calculateLayout = (e) => {
    if (Platform.OS === "web" || layoutHeight.current.container === 0) {
      layoutHeight.current.container = 0;
      setInitHeight();
    }
  };

  const setInitHeight = () => {
    const newHeight = layoutHeight.current.container;
    if (newHeight > 0) {
      accordionHeight.setValue(
        newHeight + (isExpanded ? layoutHeight.current.text : 0)
      );
    }
  };

  const rotateIcon = iconRotation.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "90deg"],
  });

  const booking = async (counselorId) => {
    try {
      const counselorRes = await axiosJWT.get(
        `${BASE_URL}/counselors/non-academic/${counselorId}`
      );
      const counselorData = counselorRes?.data || [];
      setSelectedCounselor(counselorData);
      console.log(counselors);
      // setSelectedDate(new Date().toISOString().split("T")[0]);
      setSelectedDate((prev) => {
        return selectedDate || prev;
      });
      const startOfWeek = new Date(selectedDate);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 31);
      startOfWeek.setDate(startOfWeek.getDate() - 31);
      const from = startOfWeek.toISOString().split("T")[0];
      const to = endOfWeek.toISOString().split("T")[0];

      await fetchSlots(counselorId, from, to);
      setOpen(true);
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

  const cancelBooking = () => {
    setSelectedCounselor({});
    setSelectedSlot(null);
    isOnline(null);
    setOpen(false);
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
    } catch (error) {
      console.log("Error fetching slots", error);
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

  const renderSlotsForSelectedDate = () => {
    const daySlots = slots[selectedDate] || [];
    if (!daySlots.length) {
      return (
        <Text
          style={{
            textAlign: "center",
            fontSize: 18,
            fontWeight: "400",
            marginTop: 12,
          }}
        >
          No available slots for {selectedDate}
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
            key={`${selectedDate}-${slot.slotCode}-${index}`}
            onPress={() => (
              console.log(selectedDate, slot.slotCode),
              setSelectedSlot(slot.slotCode)
            )}
            disabled={
              slot.status === "EXPIRED" ||
              slot.myAppointment === true ||
              slot.status === "UNAVAILABLE"
            }
            style={{
              width: "auto",
              padding: 10,
              marginVertical: 8,
              backgroundColor:
                slot.myAppointment === true
                  ? "#F39300"
                  : selectedSlot === slot.slotCode && slot.status !== "EXPIRED"
                  ? "white"
                  : slot.status === "EXPIRED"
                  ? "#ededed"
                  : slot.status === "AVAILABLE"
                  ? "white"
                  : "#ededed",
              borderRadius: 10,
              alignItems: "center",
              borderWidth: 1.5,
              marginRight: 16,
              borderColor:
                slot.myAppointment === true
                  ? "white"
                  : selectedSlot === slot.slotCode && slot.status !== "EXPIRED"
                  ? "#F39300"
                  : slot.status === "EXPIRED"
                  ? "transparent"
                  : slot.status === "AVAILABLE"
                  ? "black"
                  : "transparent",
            }}
          >
            {selectedSlot === slot.slotCode &&
              slot.status !== "EXPIRED" &&
              slot.status !== "UNAVAILABLE" &&
              slot.myAppointment !== true && (
                <View style={{ position: "absolute", top: -10, right: -10 }}>
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
                    : selectedSlot === slot.slotCode &&
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
              {slot.startTime.split(":")[0] +
                ":" +
                slot.startTime.split(":")[1]}{" "}
              - {slot.endTime.split(":")[0] + ":" + slot.endTime.split(":")[1]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  useEffect(() => {}, [socket, selectedDate]);

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
        } catch (error) {
          console.error("Error parsing notification:", error);
        }
      };

      setSelectedDate(day.dateString);
      setSelectedSlot("");
      console.log(`/user/${day.dateString}/${selectedCounselor?.id}/slot`);
      if (socket) {
        socket.off(`/user/${selectedDate}/${selectedCounselor?.id}/slot`);
        console.log("Begin");
        socket.on(
          `/user/${day.dateString}/${selectedCounselor?.id}/slot`,
          handleSlotRender
        );
      }
    },
    [socket, selectedDate, selectedCounselor, userData]
  );

  const handleCreateRequest = async () => {
    try {
      const response = await axiosJWT.post(
        `${BASE_URL}/booking-counseling/${selectedCounselor?.id}/appointment-request/create`,
        {
          slotCode: selectedSlot,
          date: selectedDate,
          isOnline: online,
          reason: reason,
        }
      );
      const data = await response.data;
      if (data && data.status == 200) {
        handleCloseConfirm();
        const startOfWeek = new Date(selectedDate);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 31);
        startOfWeek.setDate(startOfWeek.getDate() - 31);
        const from = startOfWeek.toISOString().split("T")[0];
        const to = endOfWeek.toISOString().split("T")[0];
        renderSlotsForSelectedDate();
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
      console.log(
        selectedCounselor?.id,
        selectedSlot,
        selectedDate,
        online,
        reason
      );
    } catch (error) {
      console.log("Something error when booking", error);
      setIsError(true);
      setErrorMessage(
        "You already created a request that have the same chosen slot on this day. Please choose a different slot"
      );
    }
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
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
        {!loading && (
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
                  <Text style={{ fontSize: 20, opacity: 0.8, color: "black" }}>
                    {counselors.totalElements} Counselors found in{" "}
                    <Text style={{ fontWeight: "bold", opacity: 1 }}>
                      FPT HCM
                    </Text>
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    alignItems: "flex-end",
                    justifyContent: "center",
                  }}
                >
                  <TouchableOpacity
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
                  </TouchableOpacity>
                </View>
              </View>
              <Animated.View
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
                >
                  <View style={{ paddingHorizontal: 10 }}>
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
                          From Rating:
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
                                    if (item < selectedTo)
                                      setSelectedFrom(item);
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
                                        selectedFrom === item
                                          ? "white"
                                          : "black",
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
                          To Rating:
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
                                    if (item > selectedFrom)
                                      setSelectedTo(item);
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
                          color: "black",
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
                              color={
                                sortDirection == "ASC" ? "#F39300" : "gray"
                              }
                              style={{ marginRight: 4 }}
                            />
                            <Ionicons
                              name="arrow-up"
                              size={20}
                              style={{
                                color:
                                  sortDirection == "ASC" ? "#F39300" : "black",
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
                              color={
                                sortDirection == "DESC" ? "#F39300" : "gray"
                              }
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
                          color: "black",
                        }}
                      >
                        Expertise:
                      </Text>
                      <Dropdown
                        style={{
                          backgroundColor: "white",
                          borderColor: expanded ? "#F39300" : "black",
                          flex: 0.95,
                          height: 30,
                          borderWidth: 1,
                          borderColor: "grey",
                          borderRadius: 10,
                          paddingHorizontal: 12,
                          marginLeft: 8,
                        }}
                        placeholderStyle={{ fontSize: 16 }}
                        selectedTextStyle={{
                          fontSize: 18,
                          color: selectedExpertise ? "black" : "white",
                        }}
                        inputSearchStyle={{ height: 40, fontSize: 16 }}
                        maxHeight={250}
                        data={expertises}
                        labelField="name"
                        value={
                          selectedExpertise !== ""
                            ? selectedExpertise.name
                            : "Select item"
                        }
                        placeholder={
                          selectedExpertise !== ""
                            ? selectedExpertise.name
                            : "Select item"
                        }
                        searchPlaceholder="Search Expertise"
                        onFocus={() => setExpanded(true)}
                        onBlur={() => setExpanded(false)}
                        onChange={(item) => {
                          setSelectedExpertise(item);
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
                                  item.name == selectedExpertise.name
                                    ? "#F39300"
                                    : "white",
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 18,
                                  fontWeight: "500",
                                  color:
                                    item.name == selectedExpertise.name
                                      ? "white"
                                      : "black",
                                }}
                              >
                                {item.name}
                              </Text>
                              {selectedExpertise.name === item.name && (
                                <Ionicons
                                  color="white"
                                  name="checkmark"
                                  size={24}
                                />
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
                            color: "black",
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
                </View>
              </Animated.View>
            </View>
          </>
        )}
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
                        width: width * 0.14,
                        height: width * 0.14,
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
                          color: "black",
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
                        <Ionicons name="star" size={18} color="white" />
                        <Text
                          style={{
                            fontSize: 16,
                            marginLeft: 6,
                            fontWeight: "bold",
                            color: "white",
                          }}
                        >
                          {item.rating.toFixed(1)}
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
                      {item.expertise.name}
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
                  onPress={() => booking(item.id)}
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
          <Modal
            transparent={true}
            visible={open}
            animationType="slide"
            onRequestClose={cancelBooking}
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
                    onPress={cancelBooking}
                  >
                    <Ionicons name="chevron-back" size={28} />
                  </TouchableOpacity>
                  <CalendarProvider
                    date={selectedDate}
                    onDateChanged={(date) => (
                      setSelectedDate(date), setSelectedSlot("")
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
                          <Image
                            source={{
                              uri: selectedCounselor.profile?.avatarLink,
                            }}
                            style={{
                              width: width * 0.32,
                              height: width * 0.32,
                              borderRadius: 100,
                              marginBottom: 8,
                            }}
                          />
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <Ionicons
                              name={
                                selectedCounselor.profile?.gender == "MALE"
                                  ? "male"
                                  : "female"
                              }
                              size={26}
                              color={
                                selectedCounselor.profile?.gender == "MALE"
                                  ? "#0000fa"
                                  : "#ff469e"
                              }
                            />
                            <Text
                              style={{
                                fontSize: 24,
                                fontWeight: "bold",
                                marginBottom: 4,
                                marginLeft: 6,
                              }}
                            >
                              {selectedCounselor.profile?.fullName}
                            </Text>
                          </View>
                          <Text
                            style={{
                              fontSize: 18,
                              color: "gray",
                              marginBottom: 16,
                            }}
                          >
                            {selectedCounselor.expertise?.name}
                          </Text>
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
                            <Ionicons
                              name="accessibility"
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
                                Industry Experience
                              </Text>
                              <Text
                                style={{
                                  fontSize: 18,
                                  fontWeight: "bold",
                                  opacity: 0.7,
                                }}
                              >
                                {selectedCounselor.industryExperience} years
                              </Text>
                            </View>
                          </View>
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
                            <Ionicons
                              name="star"
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
                                Rating
                              </Text>
                              <Text
                                style={{
                                  fontSize: 18,
                                  fontWeight: "bold",
                                  opacity: 0.7,
                                }}
                              >
                                {selectedCounselor.rating}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <View style={{ marginVertical: 12 }}>
                          <Text
                            style={{
                              fontSize: 18,
                              marginHorizontal: 20,
                              fontWeight: "600",
                              marginBottom: 12,
                            }}
                          >
                            Available Time
                          </Text>
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
                          {slots[selectedDate]?.length !== 0 &&
                            slots[selectedDate]?.some(
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
                                            online == true
                                              ? "white"
                                              : "#ededed",
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
                                            online == false
                                              ? "white"
                                              : "#ededed",
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
                                    What subject do you want counsel on?{" "}
                                    <Text style={{ color: "#F39300" }}>*</Text>
                                  </Text>
                                  <View>
                                    <TextInput
                                      placeholder="Write for your right"
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
                              ListHeaderComponent={() => (                              
                              )}
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
                        slots[selectedDate]?.length === 0 ||
                        slots[selectedDate]?.every(
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
                      slots[selectedDate]?.length === 0 ||
                      slots[selectedDate]?.every(
                        (item) => item.status === "EXPIRED"
                      ) ||
                      selectedSlot === "" ||
                      online === null ||
                      reason === ""
                    }
                    onPress={handleOpenConfirm}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={{
                        fontWeight: "600",
                        color:
                          slots[selectedDate]?.length === 0 ||
                          slots[selectedDate]?.every(
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
                          slots[selectedDate]?.length === 0 ||
                          slots[selectedDate]?.every(
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
                  <Modal
                    transparent={true}
                    visible={openConfirm}
                    animationType="fade"
                    onRequestClose={handleCloseConfirm}
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
                          Booking Confirmation
                        </Text>
                        <Text
                          style={{
                            fontSize: 18,
                            marginBottom: 30,
                            textAlign: "center",
                          }}
                        >
                          Are you sure you want to booking this slot?
                        </Text>
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
                            onPress={handleCloseConfirm}
                          >
                            <Text
                              style={{
                                fontSize: 18,
                                color: "black",
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
                            onPress={handleCreateRequest}
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
                    visible={openSucess}
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
                          paddingVertical: 25,
                          paddingHorizontal: 20,
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
                          <Ionicons
                            name="chevron-back"
                            size={28}
                            color="black"
                          />
                        </TouchableOpacity>
                        <View
                          style={{
                            alignItems: "center",
                            marginVertical: 12,
                          }}
                        >
                          <Ionicons
                            name="checkmark-circle"
                            size={80}
                            color="#F39300"
                          />
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
                            fontSize: 16,
                            textAlign: "center",
                            marginBottom: 20,
                          }}
                        >
                          Your request has been sent successfully! {"\n"}
                          Please wait while the counselor processes your
                          request.
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
                            cancelBooking(),
                            navigation.navigate("Request")
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
              )}
            </View>
          </Modal>
        </ScrollView>
        {!loading && (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
              marginHorizontal: 20,
              marginVertical: 10,
            }}
          >
            <TouchableOpacity
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 10,
                backgroundColor: "white",
                marginHorizontal: 4,
                borderWidth: 1.5,
                borderColor: currentPage <= 1 ? "#ccc" : "#F39300",
                opacity: currentPage <= 1 ? 0.5 : 1,
              }}
              onPress={() => setCurrentPage(1)}
              disabled={currentPage <= 1}
            >
              <Text style={{ color: "black", fontSize: 18, fontWeight: "600" }}>
                {"<<"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 10,
                backgroundColor: "white",
                marginHorizontal: 4,
                borderWidth: 1.5,
                borderColor: currentPage === 1 ? "#ccc" : "#F39300",
                opacity: currentPage === 1 ? 0.5 : 1,
              }}
              onPress={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <Text style={{ color: "black", fontSize: 18, fontWeight: "600" }}>
                {"<"}
              </Text>
            </TouchableOpacity>
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 10,
                marginHorizontal: 4,
                width: "auto",
                height: width * 0.1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "white",
                borderWidth: 1.5,
                borderColor: "#F39300",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: "black",
                  fontWeight: "600",
                }}
              >
                {counselors?.data?.length != 0 ? currentPage : 0} /{" "}
                {counselors.totalPages}
              </Text>
            </View>
            <TouchableOpacity
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 10,
                backgroundColor: "white",
                marginHorizontal: 4,
                borderWidth: 1.5,
                borderColor:
                  counselors.totalPages == 0 ||
                  currentPage >= counselors.totalPages
                    ? "#ccc"
                    : "#F39300",
                opacity:
                  counselors.totalPages == 0 ||
                  currentPage >= counselors.totalPages
                    ? 0.5
                    : 1,
              }}
              onPress={() => setCurrentPage(currentPage + 1)}
              disabled={
                counselors.totalPages == 0 ||
                currentPage >= counselors.totalPages
              }
            >
              <Text style={{ color: "black", fontSize: 18, fontWeight: "600" }}>
                {">"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 10,
                backgroundColor: "white",
                marginHorizontal: 4,
                borderWidth: 1.5,
                borderColor:
                  counselors.totalPages == 0 ||
                  currentPage >= counselors.totalPages
                    ? "#ccc"
                    : "#F39300",
                opacity:
                  counselors.totalPages == 0 ||
                  currentPage >= counselors.totalPages
                    ? 0.5
                    : 1,
              }}
              onPress={() => setCurrentPage(counselors.totalPages)}
              disabled={
                counselors.totalPages == 0 ||
                currentPage >= counselors.totalPages
              }
            >
              <Text style={{ color: "black", fontSize: 18, fontWeight: "600" }}>
                {">>"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
}
