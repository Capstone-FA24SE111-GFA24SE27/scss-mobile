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
import { Dropdown } from "react-native-element-dropdown";
import Toast from "react-native-toast-message";
import Pagination from "../../layout/Pagination";
import { FilterAccordion, FilterToggle } from "../../layout/FilterSection";
import AlertModal from "../../layout/AlertModal";
import ExtendInfoModal from "../../layout/ExtendInfoModal";

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
  const [openInfo, setOpenInfo] = useState(false);
  const [info, setInfo] = useState({});
  const [openExtendInfo, setOpenExtendInfo] = useState(false);
  const [extendInfo, setExtendInfo] = useState(null);
  const [openCancel, setOpenCancel] = useState(false);
  const [openFeedback, setOpenFeedback] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rating, setRating] = useState(0);
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

  const handleOpenCancel = (id) => {
    setOpenCancel(true);
    setSelectedAppointment(id);
  };

  const handleCancelAppointment = async () => {
    try {
      const response = await axiosJWT.post(
        `${BASE_URL}/booking-counseling/student/cancel/${selectedAppointment}`,
        {
          reason: value,
        }
      );
      const data = await response.data;
      if (data && data.status == 200) {
        fetchData();
        setOpenCancel(false);
        setSelectedAppointment(null);
        setValue("");
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
      // console.log(selectedAppointment, value)
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
          appointmentFeedback: {
            rating: rating,
            comment: value,
            createdAt: new Date().toISOString().split("T")[0],
          },
        });
        handleCloseFeedback();
      }
    } catch (err) {
      console.log("Can't feedback this appointment", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Can't feedback this appointment",
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
              hitSlop={30}
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
                flex: 1,
                alignItems: "flex-end",
                justifyContent: "center",
              }}
            >
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
                  <View style={{ marginLeft: 12, maxWidth: "80%" }}>
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
                    onPress={() => (setInfo(appointment), setOpenInfo(true))}
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
                  {appointment.status === "WAITING" && (
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "flex-end",
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => handleOpenCancel(appointment.id)}
                        activeOpacity={0.6}
                        style={{
                          backgroundColor: "#ededed",
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 10,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            color: "#333",
                            fontWeight: "600",
                          }}
                        >
                          Cancel
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                {/* <View
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
                          color: "#333",
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
                          color: "#333",
                        }}
                      >
                        {appointment.address}
                      </Text>
                    </>
                  )}
                </View> */}
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
                  marginBottom: 8,
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
                  onPress={() => (
                    setOpenExtendInfo(true), setExtendInfo(info?.counselorInfo)
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
                            uri: info?.counselorInfo?.profile?.avatarLink,
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
                              info?.counselorInfo?.profile?.gender == "MALE"
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
                        {info?.counselorInfo?.profile?.fullName}
                      </Text>
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: "500",
                          color: "#333",
                          marginBottom: 2,
                        }}
                      >
                        {info?.counselorInfo?.major?.name ||
                          info?.counselorInfo?.expertise?.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          color: "grey",
                          marginBottom: 2,
                        }}
                      >
                        Email: {info?.counselorInfo?.email}
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          color: "grey",
                        }}
                      >
                        Phone: {info?.counselorInfo?.profile?.phoneNumber}
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
                      <TouchableOpacity
                        disabled={info.meetingType !== "ONLINE"}
                        onPress={() =>
                          Linking.openURL(`${info?.meetUrl}`).catch((err) => {
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
                            textAlign: "right",
                          }}
                        >
                          {info.meetingType === "ONLINE"
                            ? info?.meetUrl || "N/A"
                            : info?.address || "N/A"}
                        </Text>
                      </TouchableOpacity>
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
                        elevation: 1,
                        borderWidth: 1.5,
                        borderColor: "lightgrey",
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
                        borderWidth: 1.5,
                        borderColor: "lightgrey",
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
                      {new Date().toISOString().split("T")[0] <=
                        info?.startDateTime?.split("T")[0] &&
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
                    fontWeight: "bold",
                    color: "#333",
                    marginBottom: 8,
                  }}
                >
                  What do you think?
                </Text>
                <TextInput
                  placeholder="Type message here..."
                  placeholderTextColor="gray"
                  keyboardType="default"
                  multiline={true}
                  numberOfLines={2}
                  value={value}
                  onChangeText={(value) => setValue(value)}
                  style={{
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
    </>
  );
}
