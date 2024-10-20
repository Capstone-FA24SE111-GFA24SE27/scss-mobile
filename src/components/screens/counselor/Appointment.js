import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useContext, useEffect, useRef, useState } from "react";
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

export default function Appointment() {
  const navigation = useNavigation();
  const { width, height } = Dimensions.get("screen");
  const [loading, setLoading] = useState(true);
  const { userData } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const [appointments, setAppointments] = useState([]);
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    status: "",
    SortDirection: "",
  });
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState("");
  const [sortDirection, setSortDirection] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [openInfo, setOpenInfo] = useState(false);
  const [info, setInfo] = useState({});
  const [openAttendance, setOpenAttendance] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [value, setValue] = useState("");
  const statusOptions = ["ABSENT", "ATTEND"];

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

  const customAlert = () => {
    return (
      <>
        {showModal && (
          <Modal
            transparent={true}
            animationType="fade"
            visible={showModal}
            onRequestClose={() => setShowModal(false)}
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
                  paddingHorizontal: 18,
                  backgroundColor: "white",
                  borderRadius: 20,
                  alignItems: "center",
                  marginVertical: 12,
                }}
              >
                <TouchableOpacity
                  style={{
                    backgroundColor: "#ededed",
                    padding: 4,
                    borderRadius: 30,
                    alignSelf: "flex-end",
                  }}
                  onPress={() => setShowModal(false)}
                >
                  <Ionicons name="close" size={28} color="black" />
                </TouchableOpacity>
                <Ionicons name="alert-circle" size={80} color="#F39300" />
                <Text
                  style={{
                    color: "#F39300",
                    fontSize: 30,
                    fontWeight: "bold",
                  }}
                >
                  Warning
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    textAlign: "center",
                    marginVertical: 12,
                  }}
                >
                  {modalMessage}
                </Text>
              </View>
            </View>
          </Modal>
        )}
      </>
    );
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
      console.log(appointments);
    } catch (err) {
      console.log(err);
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
      fromDate: dateFrom,
      toDate: dateTo,
      status: status,
      SortDirection: sortDirection,
    };
    setFilters(newFilters);
    fetchData(newFilters);
  };

  const cancelFilters = () => {
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

  const handleOpenInfo = (info) => {
    setInfo(info);
    setOpenInfo(true);
  };

  const handleCloseInfo = () => {
    setInfo("");
    setOpenInfo(false);
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
    } catch {
      console.log("Can't take attendance", error);
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
            paddingTop: height * 0.035,
            paddingVertical: 10,
          }}
        >
          <View style={{ flex: 1, alignItems: "flex-start" }}>
            <TouchableOpacity
              hitSlop={30}
              onPress={() => navigation.navigate("Personal")}
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
        {!loading && (
          <View
            style={{
              marginHorizontal: 30,
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
                <Text
                  style={{
                    fontSize: 24,
                    opacity: 0.8,
                    color: "black",
                    fontWeight: "600",
                  }}
                >
                  {appointments.totalElements} Appointments found
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
                          paddingHorizontal: 16,
                          alignItems: "center",
                          backgroundColor: "white",
                          height: 40,
                          borderWidth: 1,
                          borderColor: "gray",
                        }}
                      >
                        <Text style={{ fontSize: 18, opacity: 0.8, flex: 1 }}>
                          {dateFrom !== "" ? dateFrom : "xxxx-xx-xx"}
                        </Text>
                        <TouchableOpacity
                          onPress={() => setShowFromPicker(true)}
                        >
                          <Ionicons
                            name="calendar-outline"
                            size={22}
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
                          paddingHorizontal: 16,
                          alignItems: "center",
                          backgroundColor: "white",
                          height: 40,
                          borderWidth: 1,
                          borderColor: "gray",
                        }}
                      >
                        <Text style={{ fontSize: 18, opacity: 0.8, flex: 1 }}>
                          {dateTo !== "" ? dateTo : "xxxx-xx-xx"}
                        </Text>
                        <TouchableOpacity onPress={() => setShowToPicker(true)}>
                          <Ionicons
                            name="calendar-outline"
                            size={22}
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
                    {customAlert()}
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
                            color={sortDirection == "ASC" ? "#F39300" : "gray"}
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
        )}
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
                  <View style={{ marginLeft: 12 }}>
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: 18,
                        color: "#333",
                      }}
                    >
                      {appointment.studentInfo.profile.fullName} (
                      {appointment.studentInfo.studentCode})
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
                    onPress={() => handleOpenInfo(appointment)}
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
                        color: "#666",
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
                        color: "#666",
                      }}
                    >
                      {appointment.startDateTime.split("T")[1].split(":")[0] +
                        ":" +
                        appointment.startDateTime
                          .split("T")[1]
                          .split(":")[1]}{" "}
                      -{" "}
                      {appointment.endDateTime.split("T")[1].split(":")[0] +
                        ":" +
                        appointment.endDateTime.split("T")[1].split(":")[1]}
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
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedAppointment(appointment.id);
                      setOpenAttendance(true);
                    }}
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 2,
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
                      size={20}
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
                </View>
              </View>
            ))
          )}
        </ScrollView>
        {!loading && (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
              marginHorizontal: 20,
              marginBottom: 10,
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
                {appointments?.data?.length != 0 ? currentPage : 0} /{" "}
                {appointments.totalPages}
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
                  appointments.totalPages == 0 ||
                  currentPage >= appointments.totalPages
                    ? "#ccc"
                    : "#F39300",
                opacity:
                  appointments.totalPages == 0 ||
                  currentPage >= appointments.totalPages
                    ? 0.5
                    : 1,
              }}
              onPress={() => setCurrentPage(currentPage + 1)}
              disabled={
                appointments.totalPages == 0 ||
                currentPage >= appointments.totalPages
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
                  appointments.totalPages == 0 ||
                  currentPage >= appointments.totalPages
                    ? "#ccc"
                    : "#F39300",
                opacity:
                  appointments.totalPages == 0 ||
                  currentPage >= appointments.totalPages
                    ? 0.5
                    : 1,
              }}
              onPress={() => setCurrentPage(appointments.totalPages)}
              disabled={
                appointments.totalPages == 0 ||
                currentPage >= appointments.totalPages
              }
            >
              <Text style={{ color: "black", fontSize: 18, fontWeight: "600" }}>
                {">>"}
              </Text>
            </TouchableOpacity>
          </View>
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
                    // onPress={handleOpenReport}
                  >
                    <Ionicons name="newspaper" size={28} color="#F39300" />
                  </TouchableOpacity>
                )}
              </View>
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
                      flexDirection: "row",
                      padding: 16,
                      backgroundColor: "white",
                      borderRadius: 12,
                      marginBottom: 20,
                      elevation: 1,
                      borderWidth: 1.5,
                      borderColor: "#e3e3e3",
                    }}
                  >
                    <View style={{ width: "40%" }}>
                      <Image
                        source={{ uri: info?.studentInfo?.profile?.avatarLink }}
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
                    <View style={{ width: "60%" }}>
                      <Text
                        style={{
                          fontSize: 24,
                          fontWeight: "bold",
                          color: "black",
                          marginBottom: 4,
                        }}
                      >
                        {info?.studentInfo?.profile?.fullName}
                      </Text>
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: "500",
                          color: "black",
                          marginBottom: 2,
                        }}
                      >
                        {info?.studentInfo?.specialization?.name}
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
                  </View>
                  <View
                    style={{
                      backgroundColor: "white",
                      borderRadius: 16,
                      padding: 20,
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
                        {info?.startDateTime?.split("T")[1]?.split(":")[0] +
                          ":" +
                          info?.startDateTime
                            ?.split("T")[1]
                            ?.split(":")[1]}{" "}
                        -{" "}
                        {info?.endDateTime?.split("T")[1]?.split(":")[0] +
                          ":" +
                          info?.endDateTime?.split("T")[1]?.split(":")[1]}
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
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
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
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "bold",
                          color: "#333",
                          maxWidth: "60%",
                          textAlign: "right",
                        }}
                      >
                        {info.meetingType === "ONLINE"
                          ? info?.meetUrl || "N/A"
                          : info?.address || "N/A"}
                      </Text>
                    </View>
                  </View>
                  {info?.appointmentFeedback !== null ? (
                    <View
                      style={{
                        marginTop: 20,
                        borderRadius: 10,
                        backgroundColor: "white",
                        padding: 16,
                        elevation: 1,
                        borderWidth: 1.5,
                        borderColor: "#e3e3e3",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                      }}
                    >
                      <View>
                        <Text>{info.studentName} had leave a review</Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 12,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "bold",
                            color: "#333",
                          }}
                        >
                          {formatDate(info?.appointmentFeedback?.createdAt)}
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: "#F39300",
                            paddingHorizontal: 10,
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
                      </View>
                      <Text
                        style={{
                          fontSize: 18,
                          color: "#555",
                          fontWeight: "500",
                          lineHeight: 24,
                        }}
                      >
                        {info?.appointmentFeedback?.comment}
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={{
                        marginTop: 20,
                        borderRadius: 10,
                        backgroundColor: "white",
                        padding: 16,
                        elevation: 1,
                        borderWidth: 1.5,
                        borderColor: "#e3e3e3",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 18,
                          color: "black",
                          fontWeight: "500",
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
                  onPress={() => (
                    setOpenAttendance(false), setSelectedAppointment(null)
                  )}
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
        {/* <Modal
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
                <Text style={{ fontSize: 16, color: "#333", marginBottom: 8 }}>
                  <Text style={{ fontWeight: "600" }}>• Specific Goal:</Text>
                  {"\n"}
                  {reportData.consultationGoal.specificGoal}
                </Text>
                <Text style={{ fontSize: 16, color: "#333", marginBottom: 8 }}>
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
                <Text style={{ fontSize: 16, color: "#333", marginBottom: 8 }}>
                  <Text style={{ fontWeight: "600" }}>
                    • Summary of Discussion:
                  </Text>
                  {"\n"}
                  {reportData.consultationContent.summaryOfDiscussion}
                </Text>
                <Text style={{ fontSize: 16, color: "#333", marginBottom: 8 }}>
                  <Text style={{ fontWeight: "600" }}>• Main Issues:</Text>
                  {"\n"}
                  {reportData.consultationContent.mainIssues}
                </Text>
                <Text style={{ fontSize: 16, color: "#333", marginBottom: 8 }}>
                  <Text style={{ fontWeight: "600" }}>• Student Emotions:</Text>
                  {"\n"}
                  {reportData.consultationContent.studentEmotions}
                </Text>
                <Text style={{ fontSize: 16, color: "#333", marginBottom: 8 }}>
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
                <Text style={{ fontSize: 16, color: "#333", marginBottom: 8 }}>
                  <Text style={{ fontWeight: "600" }}>
                    • Counselor Conclusion:
                  </Text>
                  {"\n"}
                  {reportData.consultationConclusion.counselorConclusion}
                </Text>
                <Text style={{ fontSize: 16, color: "#333", marginBottom: 8 }}>
                  <Text style={{ fontWeight: "600" }}>• Follow-up Needed:</Text>
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
                <Text style={{ fontSize: 16, color: "#333", marginBottom: 8 }}>
                  <Text style={{ fontWeight: "600" }}>• Type:</Text>
                  {"\n"}
                  {reportData.intervention.type}
                </Text>
                <Text style={{ fontSize: 16, color: "#333", marginBottom: 8 }}>
                  <Text style={{ fontWeight: "600" }}>• Description:</Text>
                  {"\n"}
                  {reportData.intervention.description}
                </Text>
              </View>
            </ScrollView>
          </View>
        </Modal> */}
      </View>
    </>
  );
}
