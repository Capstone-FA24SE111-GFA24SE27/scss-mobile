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
  Animated,
  Platform,
  Alert,
  Modal,
  FlatList,
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

export default function Demand({ route }) {
  const navigation = useNavigation();
  const prevScreen = route?.params?.prevScreen;
  const { width, height } = Dimensions.get("screen");
  const [loading, setLoading] = useState(false);
  const { userData } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const [demands, setDemands] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    sortDirection: "",
  });
  const [status, setStatus] = useState("");
  const statusList = [
    { name: "WAITING" },
    { name: "PROCESSING" },
    { name: "SOLVE" },
  ];
  const [sortDirection, setSortDirection] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [openCreate, setOpenCreate] = useState(false);
  const [slots, setSlots] = useState({});
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedSlot, setSelectedSlot] = useState("");
  const [online, isOnline] = useState(null);
  const [reason, setReason] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedDemand, setSelectedDemand] = useState(null);
  const [openInfo, setOpenInfo] = useState(false);
  const [openSolve, setOpenSolve] = useState(false);
  const [value, setValue] = useState("");

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

  const fetchData = async (filters = {}) => {
    setLoading(true);
    try {
      const demandsRes = await axiosJWT.get(
        `${BASE_URL}/counseling-demand/counselor/filter`,
        {
          params: {
            ...filters,
            page: currentPage,
          },
        }
      );
      const demandsData = demandsRes?.data?.content || [];
      setDemands(demandsData);
      setLoading(false);
    } catch (err) {
      console.log(err);
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
    const newFilters = {
      status: status,
      sortDirection: sortDirection,
    };
    setFilters(newFilters);
    fetchData(newFilters);
  };

  const cancelFilters = () => {
    const resetFilters = {
      fromDate: "",
      toDate: "",
      status: "",
      sortDirection: "",
    };
    setStatus(resetFilters.status);
    setSortDirection(resetFilters.sortDirection);
    setFilters(resetFilters);
    fetchData(resetFilters);
  };

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

  const handleOpenCreate = async (selectedDemand) => {
    setOpenCreate(true);
    setSelectedStudent(selectedDemand.student);
    setSelectedDemand(selectedDemand);
    const startOfWeek = new Date(selectedDate);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 31);
    startOfWeek.setDate(startOfWeek.getDate() - 31);
    const from = startOfWeek.toISOString().split("T")[0];
    const to = endOfWeek.toISOString().split("T")[0];
    await fetchSlots(userData?.id, from, to);
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

    if (userData?.id) {
      fetchSlots(userData.id, from, to);
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
                  ? "#ededed"
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
                  ? "transparent"
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
                    ? "gray"
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
        } catch (error) {
          console.error("Error parsing notification:", error);
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

  const handleCreateAppointment = async () => {
    try {
      const response = await axiosJWT.post(
        `${BASE_URL}/appointments/demand/${selectedDemand.id}/create`,
        {
          slotCode: selectedSlot,
          date: selectedDate,
          isOnline: online,
          reason: reason,
          ...(online ? { meetURL: value } : { address: value }),
        }
      );
      const data = await response.data;
      if (data && data.status == 200) {
        handleCloseCreate();
        fetchData(filters, { page: currentPage });
        navigation.navigate("Appointment", { prevScreen: "Demand" });
      }
    } catch (error) {
      console.error("Can't create appointment", error);
    }
  };

  const handleCloseCreate = () => {
    setSelectedStudent(null);
    setSelectedDemand(null);
    setSelectedSlot("");
    isOnline(null);
    setReason("");
    setValue("");
    setOpenCreate(false);
  };

  const handleOpenInfo = (info) => {
    setSelectedDemand(info);
    setOpenInfo(true);
  };

  const handleCloseInfo = () => {
    setSelectedDemand(null);
    setOpenInfo(false);
  };

  const handleOpenSolve = (selectedDemand) => {
    setOpenSolve(true);
    setSelectedDemand(selectedDemand);
  };

  const handleSolveDemand = async () => {
    try {
      const response = await axiosJWT.put(
        `${BASE_URL}/counseling-demand/${selectedDemand?.id}/solve`,
        {
          summarizeNote: value,
        }
      );
      const data = await response.data;
      if (data && data.status == 200) {
        fetchData();
        setOpenSolve(false);
        setSelectedDemand(null);
        setValue("");
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to solve demand.",
          onPress: () => {
            Toast.hide();
          },
        });
      }
    } catch (error) {
      console.log("Something error when solve this demand", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Something error when solve this demand",
        onPress: () => {
          Toast.hide();
        },
      });
    }
  };

  const handleCloseSolve = () => {
    setOpenSolve(false);
    setSelectedDemand(null);
    setValue("");
  };

  return (
    <>
      <View style={{ backgroundColor: "#f5f7fd", flex: 1 }}>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            paddingHorizontal: 30,
            paddingTop: height * 0.035,
            paddingVertical: 10,
          }}
        >
          <View style={{ flex: 1, alignItems: "flex-start" }}>
            <TouchableOpacity
              hitSlop={30}
              onPress={() => navigation.navigate(prevScreen || "Personal")}
            >
              <Ionicons name="return-up-back" size={36} />
            </TouchableOpacity>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontWeight: "bold", fontSize: 24 }}>
              Your Demands
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: "flex-end" }} />
        </View>
        <View
          style={{
            marginHorizontal: 30,
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
                  {demands.totalElements} Demands{" "}
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
                onPress={() => setIsExpanded(!isExpanded)}
                onLayout={calculateLayout}
                style={{
                  backgroundColor: isExpanded ? "#F39300" : "#e3e3e3",
                  borderRadius: 40,
                  padding: 8,
                }}
              >
                <Animated.View style={{ transform: [{ rotate: rotateIcon }] }}>
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
                    }}
                  >
                    Status:
                  </Text>
                  <Dropdown
                    style={{
                      backgroundColor: "white",
                      borderColor: expanded ? "#F39300" : "black",
                      flex: 0.5,
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
                      color: status ? "black" : "white",
                    }}
                    maxHeight={250}
                    data={statusList}
                    labelField="name"
                    value={status}
                    placeholder={status != "" ? status : "Select item"}
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
            </View>
          </Animated.View>
        </View>
        <ScrollView
          ref={scrollViewRef}
          style={{ marginHorizontal: 30, marginVertical: 12 }}
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
            demands?.data?.map((demand) => (
              <View
                key={demand.id}
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
                    source={{ uri: demand.supportStaff.profile.avatarLink }}
                    style={{
                      width: width * 0.11,
                      height: width * 0.11,
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
                      {demand.supportStaff.profile.fullName}
                    </Text>
                    <Text style={{ color: "gray" }}>
                      {demand.supportStaff.profile.phoneNumber}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleOpenInfo(demand)}
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
                        new Date(demand.startDateTime)
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
                          demand.status === "SOLVE" && { color: "green" },
                          demand.status === "PROCESSING" && {
                            color: "#F39300",
                          },
                        ]}
                      >
                        {demand.status}
                      </Text>
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons name="person" size={20} color="#F39300" />
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        marginLeft: 8,
                        color: "#333",
                      }}
                    >
                      Assigned Student
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "stretch",
                    backgroundColor: "#F39300",
                    borderRadius: 20,
                    marginTop: 12,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#fff0e0",
                      justifyContent: "flex-start",
                      padding: 8,
                      marginLeft: 2,
                      marginRight: 1,
                      marginVertical: 2,
                      borderTopLeftRadius: 18,
                      borderBottomLeftRadius: 18,
                    }}
                  >
                    <Image
                      source={{
                        uri: demand.student.profile.avatarLink,
                      }}
                      style={{
                        width: width * 0.14,
                        height: width * 0.14,
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
                      marginVertical: 2,
                      marginRight: 2,
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
                        {demand.student.profile.fullName}
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
                        <Ionicons name="id-card" size={16} color="#F39300" />
                        <Text
                          style={{
                            fontSize: 14,
                            marginLeft: 4,
                            color: "#333",
                            maxWidth: "80%",
                          }}
                        >
                          {demand.student.studentCode}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          width: "50%",
                        }}
                      >
                        <Ionicons name="briefcase" size={16} color="#F39300" />
                        <Text
                          style={{
                            fontSize: 14,
                            marginLeft: 4,
                            color: "#333",
                            maxWidth: "80%",
                          }}
                        >
                          {demand?.student?.specialization?.name || "N/A"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 12,
                  }}
                >
                  {demand.status === "PROCESSING" && (
                    <>
                      <TouchableOpacity
                        onPress={() => handleOpenCreate(demand)}
                        activeOpacity={0.6}
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          backgroundColor: "#ededed",
                          borderRadius: 10,
                          flexDirection: "row",
                          alignItems: "center",
                          borderWidth: 1.5,
                          borderColor: "#ededed",
                        }}
                      >
                        <Ionicons name="add" size={18} color="#333" />
                        <Text
                          style={{
                            fontWeight: "500",
                            color: "#333",
                            fontSize: 16,
                            marginLeft: 4,
                          }}
                        >
                          Appointment
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleOpenSolve(demand)}
                        activeOpacity={0.6}
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          marginLeft: 8,
                          backgroundColor: "#F39300",
                          borderRadius: 10,
                          flexDirection: "row",
                          alignItems: "center",
                          borderWidth: 1.5,
                          borderColor: "#F39300",
                        }}
                      >
                        <Ionicons name="checkmark" size={18} color="white" />
                        <Text
                          style={{
                            fontWeight: "500",
                            fontSize: 16,
                            color: "white",
                            marginLeft: 4,
                          }}
                        >
                          Solve
                        </Text>
                      </TouchableOpacity>
                    </>
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
            length={demands?.data?.length}
            totalPages={demands?.totalPages}
          />
        )}
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
              </View>
              {selectedDemand && (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View
                    style={{
                      padding: 20,
                      backgroundColor: "#f5f7fd",
                      borderRadius: 16,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: "white",
                        padding: 12,
                        marginBottom: 16,
                        borderWidth: 1.5,
                        borderColor: "#e3e3e3",
                        borderRadius: 10,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "bold",
                          color: "#F39300",
                          marginBottom: 8,
                        }}
                      >
                        Created by
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "flex-start",
                        }}
                      >
                        <Image
                          source={{
                            uri: selectedDemand.supportStaff.profile.avatarLink,
                          }}
                          style={{
                            width: width * 0.11,
                            height: width * 0.11,
                            borderRadius: 40,
                            borderColor: "#F39300",
                            borderWidth: 2,
                          }}
                        />
                        <View style={{ marginLeft: 12 }}>
                          <Text
                            style={{
                              fontWeight: "bold",
                              fontSize: 18,
                              color: "#333",
                            }}
                          >
                            {selectedDemand.supportStaff.profile.fullName}
                          </Text>
                          <Text style={{ color: "gray" }}>
                            {selectedDemand.supportStaff.profile.phoneNumber}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View
                      style={{
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
                          marginBottom: 12,
                        }}
                      >
                        Assigned Student
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                        }}
                      >
                        <View style={{ width: "40%" }}>
                          <View style={{ position: "relative" }}>
                            <Image
                              source={{
                                uri: selectedDemand?.student?.profile
                                  ?.avatarLink,
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
                                  selectedDemand?.student?.profile?.gender ==
                                  "MALE"
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
                            {selectedDemand?.student?.profile?.fullName}
                          </Text>
                          <Text
                            style={{
                              fontSize: 20,
                              fontWeight: "500",
                              color: "#333",
                              marginBottom: 2,
                            }}
                          >
                            {selectedDemand?.student?.specialization?.name}
                          </Text>
                          <Text
                            style={{
                              fontSize: 16,
                              color: "grey",
                              marginBottom: 2,
                            }}
                          >
                            ID: {selectedDemand?.student?.studentCode}
                          </Text>
                          <Text
                            style={{
                              fontSize: 16,
                              color: "grey",
                            }}
                          >
                            Phone:{" "}
                            {selectedDemand?.student?.profile?.phoneNumber}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View
                      style={{
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
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: "bold",
                            color: "#F39300",
                            marginBottom: 8,
                          }}
                        >
                          Contact Note
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontSize: 16,
                          color: "#333",
                          fontWeight: "500",
                          marginTop: 4,
                        }}
                      >
                        {selectedDemand.contactNote}
                      </Text>
                      <View
                        style={{
                          borderBottomWidth: 1.5,
                          borderColor: "#F39300",
                          marginVertical: 12,
                        }}
                      />
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: "bold",
                            color: "#F39300",
                            marginBottom: 8,
                          }}
                        >
                          Summarize Note
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontSize: 16,
                          color: "#333",
                          fontWeight: "500",
                          marginTop: 4,
                        }}
                      >
                        {selectedDemand.summarizeNote !== "" ? (
                          selectedDemand.summarizeNote
                        ) : (
                          <Text
                            style={{
                              fontStyle: "italic",
                              color: "gray",
                              opacity: 0.7,
                            }}
                          >
                            "There's no summarize note yet"
                          </Text>
                        )}
                      </Text>
                    </View>
                  </View>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
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
                date={selectedDate}
                onDateChanged={(date) => (
                  setSelectedDate(date), setSelectedSlot("")
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
                      }}
                    >
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
                      <Text
                        style={{
                          fontSize: 18,
                          marginHorizontal: 20,
                          fontWeight: "400",
                          marginBottom: 12,
                        }}
                      >
                        Date:{" "}
                        <Text style={{ fontWeight: "600", color: "#F39300" }}>
                          {selectedDate}
                        </Text>
                      </Text>
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
                                  placeholderTextColor="gray"
                                  keyboardType="default"
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
                              Assigned student{" "}
                              <Text style={{ color: "#F39300" }}>*</Text>
                            </Text>
                            {selectedStudent && (
                              <View
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
                                        {selectedStudent?.specialization
                                          ?.name || "N/A"}
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
                              </View>
                            )}
                          </View>
                        </>
                      )}
                  </View>
                </ScrollView>
                <TouchableOpacity
                  style={{
                    backgroundColor:
                      slots[selectedDate]?.length === 0 ||
                      slots[selectedDate]?.every(
                        (item) => item.status === "EXPIRED"
                      ) ||
                      selectedSlot === "" ||
                      online === null ||
                      value === "" ||
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
                  disabled={
                    slots[selectedDate]?.length === 0 ||
                    slots[selectedDate]?.every(
                      (item) => item.status === "EXPIRED"
                    ) ||
                    selectedSlot === "" ||
                    online === null ||
                    value === "" ||
                    reason === "" ||
                    selectedStudent === null
                  }
                  onPress={handleCreateAppointment}
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
                        value === "" ||
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
                        slots[selectedDate]?.length === 0 ||
                        slots[selectedDate]?.every(
                          (item) => item.status === "EXPIRED"
                        ) ||
                        selectedSlot === "" ||
                        online === null ||
                        value === "" ||
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
          visible={openSolve}
          animationType="fade"
          onRequestClose={handleCloseSolve}
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
                Solve Demand Confirmation
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  marginBottom: 30,
                  textAlign: "center",
                }}
              >
                Are you sure you have already solved this demand? You need to
                provide your summarize note
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  marginBottom: 10,
                  fontWeight: "600",
                }}
              >
                Summarize Note{" "}
                <Text style={{ color: "#F39300", fontSize: 20 }}>*</Text>
              </Text>
              <View>
                <TextInput
                  placeholder="Input here"
                  placeholderTextColor="gray"
                  keyboardType="default"
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
                  onPress={handleCloseSolve}
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
                  onPress={handleSolveDemand}
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
    </>
  );
}
