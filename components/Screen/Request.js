import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
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
export default function Request() {
  const navigation = useNavigation();
  const { width, height } = Dimensions.get("screen");
  const [requests, setRequests] = useState([]);
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    meetingType: "",
    sortDirection: "",
  });
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [online, isOnline] = useState("");
  const [sortDirection, setSortDirection] = useState("");
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
                {/* <TouchableOpacity
                  onPress={() => setShowModal(false)}
                  style={{
                    backgroundColor: "#F39300",
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 30,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      color: "white",
                      fontWeight: "600",
                    }}
                  >
                    Close
                  </Text>
                </TouchableOpacity> */}
              </View>
            </View>
          </Modal>
        )}
      </>
    );
  };

  const fetchData = async (filters = {}) => {
    try {
      const requestsRes = await axiosJWT.get(
        `${BASE_URL}/booking-counseling/appointment-request`,
        {
          params: {
            ...filters,
          },
        }
      );
      const requestsData = requestsRes?.data?.content || [];
      setRequests(requestsData);
      console.log(requests);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const applyFilters = () => {
    const newFilters = {
      dateFrom: dateFrom,
      dateTo: dateTo,
      meetingType: online,
      sortDirection: sortDirection,
    };
    setFilters(newFilters);
    fetchData(newFilters);
  };

  const cancelFilters = () => {
    const resetFilters = {
      dateFrom: "",
      dateTo: "",
      meetingType: "",
      sortDirection: "",
    };
    setDateFrom(resetFilters.dateFrom);
    setDateTo(resetFilters.dateTo);
    isOnline(resetFilters.meetingType);
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

  const handleOpenInfo = (info) => {
    setInfo(info);
    setOpenInfo(true);
  };

  const handleCloseInfo = () => {
    setInfo("");
    setOpenInfo(false);
  };

  return (
    <>
      <View style={{ backgroundColor: "#f5f7fd", flex: 1 }}>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            paddingHorizontal: 30,
            paddingTop: 25,
            paddingVertical: 10,
          }}
        >
          <View style={{ flex: 1, alignItems: "flex-start" }}>
            <TouchableOpacity
              onPress={
                () => navigation.navigate("Personal")
                // setDateFrom(""),
                // setDateTo("")
              }
            >
              <Ionicons name="return-up-back" size={36} />
            </TouchableOpacity>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontWeight: "bold", fontSize: 24 }}>
              Your Requests
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
              alignItems: "center"
            }}
          >
            <View style={{ alignItems: "flex-start" }}>
              <Text style={{ fontSize: 20, opacity: 0.8, color: "black" }}>
                {requests.totalElements} Requests found
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
                    Method:
                  </Text>
                  <View style={{ flexDirection: "row", marginLeft: 20 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginHorizontal: 12,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => isOnline("ONLINE")}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <Ionicons
                          name={
                            online == "ONLINE"
                              ? "radio-button-on"
                              : "radio-button-off"
                          }
                          size={20}
                          color={online == "ONLINE" ? "#F39300" : "gray"}
                          style={{ marginRight: 4 }}
                        />
                        <Text
                          style={{
                            fontSize: 18,
                            color: online == "ONLINE" ? "#F39300" : "black",
                            fontWeight: online == "ONLINE" ? "600" : "0",
                          }}
                        >
                          Online
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginHorizontal: 12,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => isOnline("OFFLINE")}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <Ionicons
                          name={
                            online == "OFFLINE"
                              ? "radio-button-on"
                              : "radio-button-off"
                          }
                          size={20}
                          color={online == "OFFLINE" ? "#F39300" : "gray"}
                          style={{ marginRight: 4 }}
                        />
                        <Text
                          style={{
                            fontSize: 18,
                            color: online == "OFFLINE" ? "#F39300" : "black",
                            fontWeight: online == "OFFLINE" ? "600" : "0",
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
          style={{ marginHorizontal: 30, marginVertical: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {requests?.data?.length > 0 ? (
            requests?.data?.map((request) => (
              <View
                key={request.id}
                style={{
                  padding: 15,
                  marginBottom: 15,
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
                    source={{ uri: request.counselor.avatarLink }}
                    style={{
                      width: width * 0.14,
                      height: width * 0.14,
                      borderRadius: 40,
                    }}
                  />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={{ fontWeight: "bold", fontSize: 18 }}>
                      {request.counselor.fullName}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#F39300",
                        width: width * 0.2,
                        borderRadius: 20,
                        paddingVertical: 2,
                        paddingHorizontal: 4,
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
                  <TouchableOpacity
                    onPress={() => handleOpenInfo(request)}
                    style={{ position: "absolute", top: 0, right: -4 }}
                  >
                    <Ionicons
                      name="ellipsis-vertical"
                      size={24}
                      color="#F39300"
                    />
                  </TouchableOpacity>
                </View>
                <View>
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
                        }}
                      >
                        {request.requireDate}
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
                            request.status === "APPROVED" && { color: "green" },
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
              </View>
            ))
          ) : (
            <Text>
              {/* No requests found within the selected date range. */}
            </Text>
          )}
        </ScrollView>
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
              <ScrollView showsVerticalScrollIndicator={false}>
                <View
                  style={{
                    padding: 20,
                    backgroundColor: "#f5f7fd",
                    borderRadius: 16,
                  }}
                >
                  <View style={{ alignItems: "center" }}>
                    <Image
                      source={{ uri: info?.counselor?.avatarLink }}
                      style={{
                        width: width * 0.32,
                        height: width * 0.32,
                        borderRadius: 100,
                        marginBottom: 8,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 26,
                        fontWeight: "bold",
                        marginBottom: 30,
                      }}
                    >
                      {info?.counselor?.fullName}
                    </Text>
                  </View>
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
                      Counseling For
                    </Text>
                    <Text
                      style={{
                        fontSize: 20,
                        color: "black",
                        fontWeight: "500",
                        opacity: 0.7,
                      }}
                    >
                      {info.reason}
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: "#fff",
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
                        {info.requireDate}
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
                        {info?.startTime?.split(":")[0] +
                          ":" +
                          info?.startTime?.split(":")[1]}{" "}
                        -{" "}
                        {info?.endTime?.split(":")[0] +
                          ":" +
                          info?.endTime?.split(":")[1]}
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
                          ? info?.appointmentDetails?.meetUrl || "N/A"
                          : info?.appointmentDetails?.address || "N/A"}
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}