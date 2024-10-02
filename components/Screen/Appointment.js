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
} from "react-native";
import axiosJWT, { BASE_URL } from "../../config/Config";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { AuthContext } from "../Context/AuthContext";
import { SocketContext } from "../Context/SocketContext";
import { RequestSkeleton } from "./layout/Skeleton";

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

  const scrollViewRef = useRef(null);
  useFocusEffect(
    React.useCallback(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
      }
      fetchData(filters);
    }, [filters])
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
        `${BASE_URL}/appointments/student`,
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
            <TouchableOpacity hitSlop={30} onPress={() => navigation.navigate("Personal")}>
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
                      <TouchableOpacity onPress={() => setShowFromPicker(true)}>
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
                    flexDirection: "row",
                    alignItems: "center",
                    marginVertical: 4,
                    marginLeft: 4,
                  }}
                >
                  <Text
                    style={{ fontSize: 16, fontWeight: "bold", color: "black" }}
                  >
                    Sort:
                  </Text>
                  <View style={{ flexDirection: "row", marginLeft: 4 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginHorizontal: 12,
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
                  backgroundColor: "#fff",
                  borderRadius: 20,
                  elevation: 1,
                  position: "relative",
                  borderWidth: 1.5,
                  borderColor: "#F39300",
                }}
              >
                <View style={{ flexDirection: "row", marginBottom: 16 }}>
                  <Image
                    source={{
                      uri: appointment.counselorInfo.profile.avatarLink,
                    }}
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
                      {appointment.counselorInfo.profile.fullName}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#F39300",
                        width: width * 0.2,
                        borderRadius: 20,
                        paddingVertical: 4,
                        paddingHorizontal: 4,
                        marginTop: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "bold",
                          color: "#fff",
                        }}
                      >
                        {appointment.meetingType}
                      </Text>
                    </View>
                  </View>
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
                    marginBottom: 8,
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
                    alignItems: "center",
                  }}
                >
                  {appointment.meetingType === "ONLINE" ? (
                    <>
                      <Ionicons name="videocam" size={20} color="#F39300" />
                      <Text
                        style={{
                          fontWeight: "bold",
                          fontSize: 16,
                          marginLeft: 8,
                          color: "#666",
                        }}
                      >
                        {appointment.meetUrl}
                      </Text>
                    </>
                  ) : (
                    <>
                      <MaterialIcons name="place" size={20} color="#F39300" />
                      <Text
                        style={{
                          fontWeight: "bold",
                          fontSize: 16,
                          marginLeft: 8,
                          color: "#666",
                        }}
                      >
                        {appointment.address}
                      </Text>
                    </>
                  )}
                </View>
              </View>
            ))
          )}
        </ScrollView>
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
              {appointments?.data?.length != 0 ? currentPage : 0} / {appointments.totalPages}
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
                (appointments.totalPages == 0 || currentPage >= appointments.totalPages) ? "#ccc" : "#F39300",
              opacity: (appointments.totalPages == 0 || currentPage >= appointments.totalPages) ? 0.5 : 1,
            }}
            onPress={() => setCurrentPage(currentPage + 1)}
            disabled={(appointments.totalPages == 0 || currentPage >= appointments.totalPages)}
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
                (appointments.totalPages == 0 || currentPage >= appointments.totalPages) ? "#ccc" : "#F39300",
              opacity: (appointments.totalPages == 0 || currentPage >= appointments.totalPages) ? 0.5 : 1,
            }}
            onPress={() => setCurrentPage(appointments.totalPages)}
            disabled={(appointments.totalPages == 0 || currentPage >= appointments.totalPages)}
          >
            <Text style={{ color: "black", fontSize: 18, fontWeight: "600" }}>
              {">>"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
