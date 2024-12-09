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
} from "react-native";
import axiosJWT, { BASE_URL } from "../../../config/Config";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import Toast from "react-native-toast-message";
import { AuthContext } from "../../context/AuthContext";
import { SocketContext } from "../../context/SocketContext";
import { RequestSkeleton } from "../../layout/Skeleton";
import Pagination from "../../layout/Pagination";
import { Dropdown } from "react-native-element-dropdown";
import { FilterAccordion, FilterToggle } from "../../layout/FilterSection";
import AlertModal from "../../layout/AlertModal";

export default function Request({ route }) {
  const navigation = useNavigation();
  const prevScreen = route?.params?.prevScreen;
  const { width, height } = Dimensions.get("screen");
  const [loading, setLoading] = useState(true);
  const { userData } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const [requests, setRequests] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    meetingType: "",
    sortDirection: "",
    status: "",
  });
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [online, isOnline] = useState("");
  const [sortDirection, setSortDirection] = useState("");
  const [status, setStatus] = useState("");
  const statusList = [
    { name: "EXPIRED" },
    { name: "DENIED" },
    { name: "WAITING" },
    { name: "APPROVED" },
  ];
  const [expanded, setExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [openInfo, setOpenInfo] = useState(false);
  const [info, setInfo] = useState({});
  const [openConfirmDeny, setOpenConfirmDeny] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [method, setMethod] = useState("");
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
      const requestsRes = await axiosJWT.get(
        `${BASE_URL}/booking-counseling/appointment-request?sortBy=id`,
        {
          params: {
            ...filters,
            page: currentPage,
          },
        }
      );
      const requestsData = requestsRes?.data?.content || [];
      setRequests(requestsData);
      setLoading(false);
    } catch (err) {
      console.log("Can't fetch request", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    socket.on(`/user/${userData?.id}/appointment/request`, () => {
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
      dateFrom: dateFrom,
      dateTo: dateTo,
      meetingType: online,
      sortDirection: sortDirection,
      status: status,
    };
    setFilters(newFilters);
    fetchData(newFilters);
    setIsExpanded(false);
  };

  const cancelFilters = () => {
    setLoading(true);
    setCurrentPage(1);
    const resetFilters = {
      dateFrom: "",
      dateTo: "",
      meetingType: "",
      sortDirection: "",
      status: "",
    };
    setDateFrom(resetFilters.dateFrom);
    setDateTo(resetFilters.dateTo);
    isOnline(resetFilters.meetingType);
    setSortDirection(resetFilters.sortDirection);
    setStatus(resetFilters.status);
    setFilters(resetFilters);
    fetchData(resetFilters);
    setIsExpanded(false);
  };

  const handleOpenInfo = (info) => {
    setInfo(info);
    setOpenInfo(true);
  };

  const handleCloseInfo = () => {
    setInfo("");
    setOpenInfo(false);
  };

  const handleOpenConfirmDeny = (id) => {
    setOpenConfirmDeny(true);
    setSelectedRequest(id);
  };

  const handleOpenConfirm = (id, method) => {
    setOpenConfirm(true);
    setSelectedRequest(id);
    setMethod(method);
  };

  const handleDenyRequest = async () => {
    try {
      const response = await axiosJWT.put(
        `${BASE_URL}/booking-counseling/deny/${selectedRequest}`
      );
      const data = await response.data;
      if (data && data.status == 200) {
        handleCloseConfirmDeny();
        fetchData(filters, { page: currentPage });
        // setOpenSuccess(true);
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
      console.log("Can't deny this request", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Can't deny this request",
      });
    }
  };

  const handleApproveRequest = async () => {
    try {
      const dataToSend =
        method === "ONLINE" ? { meetUrl: value } : { address: value };
      const response = await axiosJWT.put(
        `${BASE_URL}/booking-counseling/approve/${method.toLowerCase()}/${selectedRequest}`,
        dataToSend
      );
      const data = await response.data;
      if (data && data.status == 200) {
        handleCloseConfirm();
        fetchData(filters, { page: currentPage });
        // setOpenSuccess(true);
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
      console.log(selectedRequest, method.toLowerCase(), dataToSend);
    } catch (err) {
      console.log("Can't approve this request", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Can't approve this request",
      });
    }
  };

  const handleCloseConfirmDeny = () => {
    setSelectedRequest(null);
    setOpenConfirmDeny(false);
  };

  const handleCloseConfirm = () => {
    setValue("");
    setSelectedRequest(null);
    setOpenConfirm(false);
  };

  const handleCloseSuccess = () => {
    setOpenSuccess(false);
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
              onPress={
                () => navigation.navigate(prevScreen || "Personal")
                // setDateFrom(""),
                // setDateTo("")
              }
            >
              <Ionicons name="return-up-back" size={36} />
            </TouchableOpacity>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontWeight: "bold", fontSize: 24 }}>
              Requests List
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
                  {requests.totalElements} Requests{" "}
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
                  Method:
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
                          fontSize: 15,
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
                          fontSize: 15,
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
            requests?.data?.map((request) => (
              <View
                key={request.id}
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
                    source={{ uri: request.student.profile.avatarLink }}
                    style={{
                      width: width * 0.14,
                      height: width * 0.14,
                      borderRadius: 40,
                      borderWidth: 1.5,
                      borderColor: "#F39300",
                    }}
                  />
                  <View style={{ marginLeft: 12, maxWidth: "80%" }}>
                    <Text style={{ fontWeight: "bold", fontSize: 18 }}>
                      {request.student.profile.fullName}
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
                        {request?.startTime?.slice(0, 5)} -{" "}
                        {request?.endTime?.slice(0, 5)}
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
                  {request.status === "WAITING" && (
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "flex-end",
                        marginTop: 8,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => handleOpenConfirmDeny(request.id)}
                        activeOpacity={0.6}
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          marginRight: 8,
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
                          Deny
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          handleOpenConfirm(request.id, request.meetingType)
                        }
                        activeOpacity={0.6}
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          backgroundColor: "#F39300",
                          borderRadius: 10,
                          flexDirection: "row",
                          alignItems: "center",
                          borderWidth: 1.5,
                          borderColor: "#F39300",
                        }}
                      >
                        <Text
                          style={{
                            fontWeight: "500",
                            color: "white",
                            fontSize: 16,
                          }}
                        >
                          Approve
                        </Text>
                      </TouchableOpacity>
                      <Modal
                        transparent={true}
                        visible={openConfirmDeny}
                        animationType="fade"
                        onRequestClose={handleCloseConfirmDeny}
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
                              Request Confirmation
                            </Text>
                            <Text
                              style={{
                                fontSize: 18,
                                marginBottom: 30,
                                textAlign: "center",
                              }}
                            >
                              Are you sure you want to deny this request?{"\n"}
                              You can't undo the change
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
                                onPress={handleCloseConfirmDeny}
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
                                onPress={handleDenyRequest}
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
                        visible={openConfirm}
                        animationType="fade"
                        onRequestClose={handleCloseConfirm}
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
                              Request Confirmation
                            </Text>
                            <Text
                              style={{
                                fontSize: 18,
                                marginBottom: 30,
                                textAlign: "center",
                              }}
                            >
                              Are you sure you want to approve this request?
                              {"\n"}
                              Your schedule will be updated
                            </Text>
                            <Text
                              style={{
                                fontSize: 16,
                                marginBottom: 10,
                                fontWeight: "600",
                              }}
                            >
                              Please provide the meeting
                              {method === "ONLINE"
                                ? "'s Google Meet URL"
                                : "'s address"}{" "}
                              <Text style={{ color: "#F39300", fontSize: 20 }}>
                                *
                              </Text>
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
                                onPress={handleCloseConfirm}
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
                                disabled={value === ""}
                                style={{
                                  flex: 1,
                                  backgroundColor:
                                    value === "" ? "#e3e3e3" : "#F39300",
                                  padding: 10,
                                  borderRadius: 10,
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                                onPress={handleApproveRequest}
                              >
                                <Text
                                  style={{
                                    fontSize: 18,
                                    color: value === "" ? "gray" : "white",
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
                        visible={openSuccess}
                        animationType="fade"
                        onRequestClose={handleCloseSuccess}
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
                              paddingVertical: 25,
                              paddingHorizontal: 20,
                              backgroundColor: "white",
                              borderRadius: 20,
                            }}
                          >
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
                                Processed!
                              </Text>
                            </View>
                            <TouchableOpacity
                              style={{
                                backgroundColor: "#F39300",
                                paddingVertical: 10,
                                paddingHorizontal: 12,
                                borderRadius: 30,
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                              onPress={handleCloseSuccess}
                              activeOpacity={0.8}
                            >
                              <Text
                                style={{
                                  fontSize: 20,
                                  color: "white",
                                  fontWeight: "600",
                                }}
                              >
                                Done
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </Modal>
                    </View>
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
            length={requests?.data?.length}
            totalPages={requests?.totalPages}
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
                  <View
                    style={{
                      flexDirection: "row",
                      padding: 16,
                      backgroundColor: "white",
                      borderRadius: 10,
                      elevation: 1,
                      marginBottom: 20,
                      borderWidth: 1.5,
                      borderColor: "#e3e3e3",
                    }}
                  >
                    <View style={{ width: "40%" }}>
                      <View style={{ position: "relative" }}>
                        <Image
                          source={{ uri: info?.student?.profile?.avatarLink }}
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
                              info?.student?.profile?.gender == "MALE"
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
                        {info?.student?.profile?.fullName}
                      </Text>
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: "500",
                          color: "#333",
                          marginBottom: 2,
                        }}
                      >
                        {info?.student?.major?.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          color: "grey",
                          marginBottom: 2,
                        }}
                      >
                        ID: {info?.student?.studentCode}
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          color: "grey",
                        }}
                      >
                        Phone: {info?.student?.profile?.phoneNumber}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      marginBottom: 20,
                      padding: 16,
                      backgroundColor: "white",
                      borderRadius: 10,
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
                      Counseling Reason
                    </Text>
                    <Text
                      style={{
                        fontSize: 20,
                        color: "#333",
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
                      borderRadius: 10,
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
                        {info?.startTime?.slice(0, 5)} -{" "}
                        {info?.endTime?.slice(0, 5)}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        // marginBottom: 16,
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
                    {/* <View
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
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "bold",
                          color: "#333",
                          maxWidth: "50%",
                          textAlign: "right",
                        }}
                      >
                        {info.meetingType === "ONLINE"
                          ? info?.appointmentDetails?.meetUrl || "N/A"
                          : info?.appointmentDetails?.address || "N/A"}
                      </Text>
                    </View> */}
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
