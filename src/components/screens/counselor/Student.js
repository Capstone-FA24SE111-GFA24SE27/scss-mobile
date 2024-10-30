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
  Modal,
  ActivityIndicator,
} from "react-native";
import axiosJWT, { BASE_URL } from "../../../config/Config";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { AuthContext } from "../../context/AuthContext";
import { SocketContext } from "../../context/SocketContext";
import { StudentSkeleton } from "../../layout/Skeleton";
import RNDateTimePicker from "@react-native-community/datetimepicker";
export default function Student() {
  const navigation = useNavigation();
  const { width, height } = Dimensions.get("screen");
  const [loading, setLoading] = useState(true);
  const { userData } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const scrollViewRef = useRef(null);
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({
    sortDirection: "",
    specializationId: "",
  });
  const [filters2, setFilters2] = useState({
    fromDate: "",
    toDate: "",
    SortDirection: "",
  });
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [sortDirection, setSortDirection] = useState("");
  const [specializations, setSpecializations] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [openInfo, setOpenInfo] = useState(false);
  const [info, setInfo] = useState({});
  const [info2, setInfo2] = useState(null);
  const [info3, setInfo3] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sortDirection2, setSortDirection2] = useState("");
  const [currentPage2, setCurrentPage2] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [activeTab, setActiveTab] = useState(1);

  useFocusEffect(
    React.useCallback(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
      }
      fetchData(filters, { page: currentPage });
    }, [debouncedKeyword, filters, currentPage])
  );

  const fetchData = async (filters = {}) => {
    try {
      const studentRes = await axiosJWT.get(`${BASE_URL}/students/filter`, {
        params: {
          keyword: debouncedKeyword,
          ...filters,
          page: currentPage,
        },
      });
      const studentData = studentRes?.data || [];
      setStudents(studentData);
      setLoading(false);
    } catch (err) {
      console.log("Can't fetch students");
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
      sortDirection: sortDirection,
      specializationId: selectedSpecialization.id,
    };
    setFilters(newFilters);
    fetchData(newFilters);
  };

  const cancelFilters = () => {
    const resetFilters = {
      sortDirection: "",
      specializationId: "",
    };
    setKeyword("");
    setSortDirection(resetFilters.sortDirection);
    setSelectedSpecialization(resetFilters.specializationId);
    setFilters(resetFilters);
    fetchData(resetFilters);
  };

  useEffect(() => {
    fetchData();
  }, [debouncedKeyword]);

  useEffect(() => {
    setLoading(true);
    fetchData({ ...filters, page: currentPage });
    setTimeout(() => setLoading(false), 1500);
  }, [currentPage]);

  const fetchStudentInfo = async () => {
    try {
      const infoRes = await axiosJWT.get(
        `${BASE_URL}/students/document/${selectedStudent}`
      );
      const infoData = infoRes?.data?.content;
      setInfo(infoData);
      setOpenInfo(true);
    } catch (err) {
      console.log("Can't fetch student profile");
    }
  };

  // const fetchStudentInfo2 = async () => {
  //   try {
  //     const infoRes2 = await axiosJWT.get(`${BASE_URL}/students/study/${selectedStudent}`);
  //     const infoData2 = infoRes2?.data?.content;
  //     setInfo2(infoData2);
  //   } catch (err) {
  //     console.log("Can't fetch student academic transcript");
  //   }
  // };

  const fetchStudentInfo3 = async (filters2 = {}) => {
    try {
      const infoRes3 = await axiosJWT.get(
        `${BASE_URL}/students/appointment/filter/${selectedStudent}`,
        {
          params: {
            ...filters2,
            page: currentPage2,
          },
        }
      );
      const infoData3 = infoRes3?.data?.content;
      setInfo3(infoData3);
    } catch (err) {
      console.log("Can't fetch student appointment history");
    }
  };

  useEffect(() => {
    if (selectedStudent !== null) {
      fetchStudentInfo();
      // fetchStudentInfo2();
      fetchStudentInfo3(filters2);
    }
  }, [selectedStudent]);

  const applyFilters2 = () => {
    const newFilters = {
      fromDate: dateFrom,
      toDate: dateTo,
      SortDirection: sortDirection2,
    };
    setFilters(newFilters);
    fetchStudentInfo3(newFilters);
  };

  const cancelFilters2 = () => {
    const resetFilters = {
      fromDate: "",
      toDate: "",
      SortDirection: "",
    };
    setDateFrom(resetFilters.fromDate);
    setDateTo(resetFilters.toDate);
    setSortDirection2(resetFilters.SortDirection);
    setFilters(resetFilters);
    fetchStudentInfo3(resetFilters);
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

  return (
    <>
      <View style={{ backgroundColor: "#f5f7fd", flex: 1 }}>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            paddingHorizontal: 20,
            paddingTop: height * 0.035,
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
                placeholder="Search by Student's name"
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
                  <Text
                    style={{
                      fontSize: 20,
                      opacity: 0.8,
                      color: "#333",
                      fontWeight: "bold",
                    }}
                  >
                    {students.totalElements} Students{" "}
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
                          color: "#333",
                        }}
                      >
                        Specialization:
                      </Text>
                      {/* <Dropdown
                        style={{
                          backgroundColor: "white",
                          borderColor: expanded ? "#F39300" : "black",
                          flex: 0.94,
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
                          color: selectedSpecialization ? "black" : "white",
                        }}
                        inputSearchStyle={{ height: 40, fontSize: 16 }}
                        maxHeight={250}
                        data={specializations}
                        labelField="name"
                        value={
                          selectedSpecialization !== ""
                            ? selectedSpecialization.name
                            : "Select item"
                        }
                        placeholder={
                          selectedSpecialization !== ""
                            ? selectedSpecialization.name
                            : "Select item"
                        }
                        searchPlaceholder="Search Specialization"
                        onFocus={() => setExpanded(true)}
                        onBlur={() => setExpanded(false)}
                        onChange={(item) => {
                          setSelectedSpecialization(item);
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
                                  item.name == selectedSpecialization.name
                                    ? "#F39300"
                                    : "white",
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 18,
                                  fontWeight: "500",
                                  color:
                                    item.name == selectedSpecialization.name
                                      ? "white"
                                      : "black",
                                }}
                              >
                                {item.name}
                              </Text>
                              {selectedSpecialization.name === item.name && (
                                <Ionicons
                                  color="white"
                                  name="checkmark"
                                  size={24}
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
              <StudentSkeleton />
              <StudentSkeleton />
              <StudentSkeleton />
              <StudentSkeleton />
              <StudentSkeleton />
              <StudentSkeleton />
            </>
          ) : (
            students?.data?.map((item, index) => (
              <TouchableOpacity
                activeOpacity={0.7}
                key={item.id}
                onPress={() => (
                  setSelectedStudent(item.id), setOpenInfo(true)
                  // fetchStudentInfo(),
                  // fetchStudentInfo2(),
                  // fetchStudentInfo3()
                )}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  // alignItems: "flex-start",
                  alignItems: "stretch",
                  backgroundColor: "#F39300",
                  borderRadius: 20,
                  marginVertical: 8,
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
                    source={{ uri: item.profile.avatarLink }}
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
                  <View style={{ flexDirection: "row", marginBottom: 8 }}>
                    <Text
                      style={{
                        color: "#F39300",
                        fontSize: 20,
                        fontWeight: "bold",
                      }}
                    >
                      {item.profile.fullName}
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
                        {item.studentCode}
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
                        {item.specialization.name}
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
                      <Ionicons name="call" size={16} color="#F39300" />
                      <Text
                        style={{
                          fontSize: 14,
                          marginLeft: 4,
                          color: "#333",
                          maxWidth: "80%",
                        }}
                      >
                        {item.profile.phoneNumber}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        width: "50%",
                      }}
                    >
                      <MaterialIcons name="cake" size={16} color="#F39300" />
                      <Text
                        style={{
                          fontSize: 14,
                          marginLeft: 4,
                          color: "#333",
                          maxWidth: "80%",
                        }}
                      >
                        {formatDate(item.profile.dateOfBirth)}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
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
              <Text style={{ color: "#333", fontSize: 18, fontWeight: "600" }}>
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
              <Text style={{ color: "#333", fontSize: 18, fontWeight: "600" }}>
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
                  color: "#333",
                  fontWeight: "600",
                }}
              >
                {students?.data?.length != 0 ? currentPage : 0} /{" "}
                {students.totalPages}
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
                  students.totalPages == 0 || currentPage >= students.totalPages
                    ? "#ccc"
                    : "#F39300",
                opacity:
                  students.totalPages == 0 || currentPage >= students.totalPages
                    ? 0.5
                    : 1,
              }}
              onPress={() => setCurrentPage(currentPage + 1)}
              disabled={
                students.totalPages == 0 || currentPage >= students.totalPages
              }
            >
              <Text style={{ color: "#333", fontSize: 18, fontWeight: "600" }}>
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
                  students.totalPages == 0 || currentPage >= students.totalPages
                    ? "#ccc"
                    : "#F39300",
                opacity:
                  students.totalPages == 0 || currentPage >= students.totalPages
                    ? 0.5
                    : 1,
              }}
              onPress={() => setCurrentPage(students.totalPages)}
              disabled={
                students.totalPages == 0 || currentPage >= students.totalPages
              }
            >
              <Text style={{ color: "#333", fontSize: 18, fontWeight: "600" }}>
                {">>"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <Modal
          transparent={true}
          visible={openInfo}
          animationType="slide"
          onRequestClose={() => (
            setSelectedStudent(null),
            setInfo(null),
            setInfo2(null),
            setInfo3(null),
            setDateFrom(""),
            setDateTo(""),
            setCurrentPage2(1),
            setActiveTab(1),
            setOpenInfo(false)
          )}
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
                  marginVertical: 8,
                  borderRadius: 20,
                  alignSelf: "center",
                  alignItems: "center",
                }}
                onPress={() => (
                  setSelectedStudent(null),
                  setInfo(null),
                  setInfo2(null),
                  setInfo3(null),
                  setDateFrom(""),
                  setDateTo(""),
                  setCurrentPage2(1),
                  setActiveTab(1),
                  setOpenInfo(false)
                )}
              >
                <Ionicons name="chevron-down" size={28} />
              </TouchableOpacity>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-around",
                  marginHorizontal: 20,
                }}
              >
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    onPress={() => setActiveTab(1)}
                    style={{
                      paddingVertical: 8,
                      marginRight: 20,
                      borderBottomWidth: 2,
                      borderBottomColor:
                        activeTab === 1 ? "#F39300" : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: activeTab === 1 ? "bold" : "500",
                        color: activeTab === 1 ? "#F39300" : "#333",
                      }}
                    >
                      Student Profile
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setActiveTab(2)}
                    style={{
                      paddingVertical: 8,
                      marginRight: 20,
                      borderBottomWidth: 2,
                      borderBottomColor:
                        activeTab === 2 ? "#F39300" : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: activeTab === 2 ? "bold" : "500",
                        color: activeTab === 2 ? "#F39300" : "#333",
                      }}
                    >
                      Counseling Profile
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setActiveTab(3)}
                    style={{
                      paddingVertical: 8,
                      marginRight: 20,
                      borderBottomWidth: 2,
                      borderBottomColor:
                        activeTab === 3 ? "#F39300" : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: activeTab === 3 ? "bold" : "500",
                        color: activeTab === 3 ? "#F39300" : "#333",
                      }}
                    >
                      Academic Transcript
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setActiveTab(4)}
                    style={{
                      paddingVertical: 8,
                      borderBottomWidth: 2,
                      borderBottomColor:
                        activeTab === 4 ? "#F39300" : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: activeTab === 4 ? "bold" : "500",
                        color: activeTab === 4 ? "#F39300" : "#333",
                      }}
                    >
                      Appointments History
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
              <View
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  flex: 1,
                }}
              >
                {activeTab === 1 && info?.studentProfile ? (
                  <ScrollView showsVerticalScrollIndicator={false}>
                    <View
                      style={{
                        backgroundColor: "#fff",
                        borderRadius: 10,
                        padding: 12,
                        marginBottom: 20,
                        elevation: 3,
                      }}
                    >
                      <View style={{ marginVertical: 10 }}>
                        <Text
                          style={{
                            color: "#333",
                            fontWeight: "bold",
                            fontSize: 16,
                            marginBottom: 4,
                          }}
                        >
                          Full Name:
                        </Text>
                        <Text style={{ fontSize: 16, color: "#333" }}>
                          {info.studentProfile.profile.fullName}
                        </Text>
                      </View>
                      <View style={{ marginVertical: 10 }}>
                        <Text
                          style={{
                            color: "#333",
                            fontWeight: "bold",
                            fontSize: 16,
                            marginBottom: 4,
                          }}
                        >
                          Student Code:
                        </Text>
                        <Text style={{ fontSize: 16, color: "#333" }}>
                          {info.studentProfile.studentCode}
                        </Text>
                      </View>
                      <View style={{ marginVertical: 10 }}>
                        <Text
                          style={{
                            color: "#333",
                            fontWeight: "bold",
                            fontSize: 16,
                            marginBottom: 4,
                          }}
                        >
                          Phone Number:
                        </Text>
                        <Text style={{ fontSize: 16, color: "#333" }}>
                          {info.studentProfile.profile.phoneNumber}
                        </Text>
                      </View>
                      <View style={{ marginVertical: 10 }}>
                        <Text
                          style={{
                            color: "#333",
                            fontWeight: "bold",
                            fontSize: 16,
                            marginBottom: 4,
                          }}
                        >
                          Date of Birth:
                        </Text>
                        <Text style={{ fontSize: 16, color: "#333" }}>
                          {formatDate(info.studentProfile.profile.dateOfBirth)}
                        </Text>
                      </View>
                      <View style={{ marginVertical: 10 }}>
                        <Text
                          style={{
                            color: "#333",
                            fontWeight: "bold",
                            fontSize: 16,
                            marginBottom: 4,
                          }}
                        >
                          Department:
                        </Text>
                        <Text style={{ fontSize: 16, color: "#333" }}>
                          {info.studentProfile.department.name} (
                          {info.studentProfile.department.code})
                        </Text>
                      </View>
                      <View style={{ marginVertical: 10 }}>
                        <Text
                          style={{
                            color: "#333",
                            fontWeight: "bold",
                            fontSize: 16,
                            marginBottom: 4,
                          }}
                        >
                          Major:
                        </Text>
                        <Text style={{ fontSize: 16, color: "#333" }}>
                          {info.studentProfile.major.name} (
                          {info.studentProfile.major.code})
                        </Text>
                      </View>
                      <View style={{ marginVertical: 10 }}>
                        <Text
                          style={{
                            color: "#333",
                            fontWeight: "bold",
                            fontSize: 16,
                            marginBottom: 4,
                          }}
                        >
                          Specialization:
                        </Text>
                        <Text style={{ fontSize: 16, color: "#333" }}>
                          {info.studentProfile.specialization.name}
                        </Text>
                      </View>
                    </View>
                  </ScrollView>
                ) : activeTab === 1 ? (
                  <Text style={{ fontSize: 16, color: "#333" }}></Text>
                ) : null}
                {activeTab === 2 && info?.counselingProfile ? (
                  <ScrollView showsVerticalScrollIndicator={false}>
                    <View
                      style={{
                        backgroundColor: "#fff",
                        borderRadius: 10,
                        padding: 12,
                        marginBottom: 20,
                        elevation: 3,
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
                        Introduction:
                      </Text>
                      <Text style={{ fontSize: 16, color: "#333" }}>
                        {info.counselingProfile.introduction}
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: "#fff",
                        borderRadius: 10,
                        padding: 12,
                        marginBottom: 20,
                        elevation: 3,
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: "bold",
                          fontSize: 18,
                          marginBottom: 10,
                          color: "#F39300",
                        }}
                      >
                        Physical and Mental Health Information
                      </Text>
                      <View style={{ marginVertical: 10 }}>
                        <Text
                          style={{
                            color: "#333",
                            fontWeight: "bold",
                            fontSize: 16,
                            marginBottom: 4,
                          }}
                        >
                          Current Health Status:
                        </Text>
                        <Text style={{ fontSize: 16, color: "#333" }}>
                          {info.counselingProfile.currentHealthStatus}
                        </Text>
                      </View>
                      <View style={{ marginVertical: 10 }}>
                        <Text
                          style={{
                            color: "#333",
                            fontWeight: "bold",
                            fontSize: 16,
                            marginBottom: 4,
                          }}
                        >
                          Psychological Status:
                        </Text>
                        <Text style={{ fontSize: 16, color: "#333" }}>
                          {info.counselingProfile.psychologicalStatus}
                        </Text>
                      </View>
                      <View style={{ marginVertical: 10 }}>
                        <Text
                          style={{
                            color: "#333",
                            fontWeight: "bold",
                            fontSize: 16,
                            marginBottom: 4,
                          }}
                        >
                          Stress Factors:
                        </Text>
                        <Text style={{ fontSize: 16, color: "#333" }}>
                          {info.counselingProfile.stressFactors}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        backgroundColor: "#fff",
                        borderRadius: 10,
                        padding: 12,
                        marginBottom: 20,
                        elevation: 3,
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: "bold",
                          fontSize: 18,
                          marginBottom: 10,
                          color: "#F39300",
                        }}
                      >
                        Study Information
                      </Text>
                      <View style={{ marginVertical: 10 }}>
                        <Text
                          style={{
                            color: "#333",
                            fontWeight: "bold",
                            fontSize: 16,
                            marginBottom: 4,
                          }}
                        >
                          Academic Difficulties:
                        </Text>
                        <Text style={{ fontSize: 16, color: "#333" }}>
                          {info.counselingProfile.academicDifficulties}
                        </Text>
                      </View>
                      <View style={{ marginVertical: 10 }}>
                        <Text
                          style={{
                            color: "#333",
                            fontWeight: "bold",
                            fontSize: 16,
                            marginBottom: 4,
                          }}
                        >
                          Study Plan:
                        </Text>
                        <Text style={{ fontSize: 16, color: "#333" }}>
                          {info.counselingProfile.studyPlan}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        backgroundColor: "#fff",
                        borderRadius: 10,
                        padding: 12,
                        marginBottom: 20,
                        elevation: 3,
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: "bold",
                          fontSize: 18,
                          marginBottom: 10,
                          color: "#F39300",
                        }}
                      >
                        Career Information
                      </Text>
                      <View style={{ marginVertical: 10 }}>
                        <Text
                          style={{
                            color: "#333",
                            fontWeight: "bold",
                            fontSize: 16,
                            marginBottom: 4,
                          }}
                        >
                          Career Goals:
                        </Text>
                        <Text style={{ fontSize: 16, color: "#333" }}>
                          {info.counselingProfile.careerGoals}
                        </Text>
                      </View>
                      <View style={{ marginVertical: 10 }}>
                        <Text
                          style={{
                            color: "#333",
                            fontWeight: "bold",
                            fontSize: 16,
                            marginBottom: 4,
                          }}
                        >
                          Part-time Experience:
                        </Text>
                        <Text style={{ fontSize: 16, color: "#333" }}>
                          {info.counselingProfile.partTimeExperience}
                        </Text>
                      </View>
                      <View style={{ marginVertical: 10 }}>
                        <Text
                          style={{
                            color: "#333",
                            fontWeight: "bold",
                            fontSize: 16,
                            marginBottom: 4,
                          }}
                        >
                          Internship Program:
                        </Text>
                        <Text style={{ fontSize: 16, color: "#333" }}>
                          {info.counselingProfile.internshipProgram}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        backgroundColor: "#fff",
                        borderRadius: 10,
                        padding: 12,
                        marginBottom: 20,
                        elevation: 3,
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: "bold",
                          fontSize: 18,
                          marginBottom: 10,
                          color: "#F39300",
                        }}
                      >
                        Activities and Life Information
                      </Text>
                      <View style={{ marginVertical: 10 }}>
                        <Text
                          style={{
                            color: "#333",
                            fontWeight: "bold",
                            fontSize: 16,
                            marginBottom: 4,
                          }}
                        >
                          Extracurricular Activities:
                        </Text>
                        <Text style={{ fontSize: 16, color: "#333" }}>
                          {info.counselingProfile.extracurricularActivities}
                        </Text>
                      </View>
                      <View style={{ marginVertical: 10 }}>
                        <Text
                          style={{
                            color: "#333",
                            fontWeight: "bold",
                            fontSize: 16,
                            marginBottom: 4,
                          }}
                        >
                          Personal Interests:
                        </Text>
                        <Text style={{ fontSize: 16, color: "#333" }}>
                          {info.counselingProfile.personalInterests}
                        </Text>
                      </View>
                      <View style={{ marginVertical: 10 }}>
                        <Text
                          style={{
                            color: "#333",
                            fontWeight: "bold",
                            fontSize: 16,
                            marginBottom: 4,
                          }}
                        >
                          Social Relationships:
                        </Text>
                        <Text style={{ fontSize: 16, color: "#333" }}>
                          {info.counselingProfile.socialRelationships}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        backgroundColor: "#fff",
                        borderRadius: 10,
                        padding: 12,
                        marginBottom: 20,
                        elevation: 3,
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: "bold",
                          fontSize: 18,
                          marginBottom: 10,
                          color: "#F39300",
                        }}
                      >
                        Financial Support Information
                      </Text>
                      <View style={{ marginVertical: 10 }}>
                        <Text
                          style={{
                            color: "#333",
                            fontWeight: "bold",
                            fontSize: 16,
                            marginBottom: 4,
                          }}
                        >
                          Financial Situation:
                        </Text>
                        <Text style={{ fontSize: 16, color: "#333" }}>
                          {info.counselingProfile.financialSituation}
                        </Text>
                      </View>
                      <View style={{ marginVertical: 10 }}>
                        <Text
                          style={{
                            color: "#333",
                            fontWeight: "bold",
                            fontSize: 16,
                            marginBottom: 4,
                          }}
                        >
                          Financial Support:
                        </Text>
                        <Text style={{ fontSize: 16, color: "#333" }}>
                          {info.counselingProfile.financialSupport}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        backgroundColor: "#fff",
                        borderRadius: 10,
                        padding: 12,
                        marginBottom: 20,
                        elevation: 3,
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: "bold",
                          fontSize: 18,
                          marginBottom: 10,
                          color: "#F39300",
                        }}
                      >
                        Counseling Request
                      </Text>
                      <View style={{ marginVertical: 10 }}>
                        <Text
                          style={{
                            color: "#333",
                            fontWeight: "bold",
                            fontSize: 16,
                            marginBottom: 4,
                          }}
                        >
                          Desired Counseling Fields:
                        </Text>
                        <Text style={{ fontSize: 16, color: "#333" }}>
                          {info.counselingProfile.desiredCounselingFields}
                        </Text>
                      </View>
                    </View>
                  </ScrollView>
                ) : activeTab === 2 ? (
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "600",
                      color: "#333",
                      textAlign: "center",
                    }}
                  >
                    This student doesn't have counseling profile
                  </Text>
                ) : null}
                {activeTab === 3 && info2 ? (
                  // info2.map((item, index) => (
                  //   <View
                  //     key={index}
                  //     style={{
                  //       backgroundColor: "white",
                  //       borderRadius: 10,
                  //       padding: 12,
                  //       marginBottom: 20,
                  //       elevation: 3,
                  //     }}
                  //   >
                  //     <Text
                  //       style={{
                  //         fontWeight: "bold",
                  //         fontSize: 18,
                  //         marginBottom: 4,
                  //         color: "#F39300",
                  //       }}
                  //     >
                  //       Term {item.term}{" "}
                  //       {item.semester !== "N/A"
                  //         ? "- " + item.semester
                  //         : ""}
                  //     </Text>
                  //     <Text style={{ fontSize: 18, fontWeight: "600" }}>
                  //       {item.subjectCode} - {item.subjectName}
                  //     </Text>
                  //     <View
                  //       style={{
                  //         flexDirection: "row",
                  //         justifyContent: "space-between",
                  //         alignItems: "center",
                  //         marginTop: 8,
                  //       }}
                  //     >
                  //       <Text
                  //         style={{
                  //           fontSize: 18,
                  //           fontWeight: "500",
                  //           color: "#333",
                  //         }}
                  //       >
                  //         Grade:{" "}
                  //         {item.grade !== null ? (
                  //           <Text
                  //             style={{
                  //               fontWeight: "600",
                  //               color: "#F39300",
                  //             }}
                  //           >
                  //             {item.grade}
                  //           </Text>
                  //         ) : (
                  //           <Text
                  //             style={{ fontWeight: "600", color: "gray" }}
                  //           >
                  //             --
                  //           </Text>
                  //         )}
                  //       </Text>
                  //       <Text
                  //         style={{
                  //           fontSize: 16,
                  //           fontWeight: "bold",
                  //           paddingVertical: 2,
                  //           paddingHorizontal: 8,
                  //           borderRadius: 10,
                  //           backgroundColor:
                  //             item.status === "PASSED"
                  //               ? "green"
                  //               : item.status === "NOT_PASSED"
                  //               ? "red"
                  //               : item.status === "STUDYING"
                  //               ? "#F39300"
                  //               : "gray",
                  //           color: "#fff",
                  //         }}
                  //       >
                  //         {item.status}
                  //       </Text>
                  //     </View>
                  //   </View>
                  // ))
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {[...new Set(info2.map((item) => item.term))].map(
                      (term) => (
                        <View
                          key={term}
                          style={{
                            backgroundColor: "white",
                            borderRadius: 10,
                            padding: 12,
                            marginBottom: 20,
                            elevation: 3,
                          }}
                        >
                          <Text
                            style={{
                              fontWeight: "bold",
                              fontSize: 24,
                              marginBottom: 4,
                              color: "#F39300",
                            }}
                          >
                            Term {term}
                          </Text>
                          {info2
                            .filter((subject) => subject.term === term)
                            .map((subject, index) => (
                              <View
                                key={index}
                                style={{
                                  paddingVertical: 12,
                                  marginBottom: 8,
                                  borderBottomWidth: 1,
                                  borderBottomColor: "gray",
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 20,
                                    fontWeight: "600",
                                    marginBottom: 4,
                                  }}
                                >
                                  {subject.subjectCode} - {subject.subjectName}
                                </Text>
                                <Text
                                  style={{
                                    fontSize: 18,
                                    color: "#333",
                                    fontWeight: "500",
                                  }}
                                >
                                  Semester:{" "}
                                  {subject.semester !== "N/A" ? (
                                    <Text
                                      style={{
                                        fontWeight: "600",
                                        color: "#F39300",
                                      }}
                                    >
                                      {subject.semester}
                                    </Text>
                                  ) : (
                                    <Text
                                      style={{
                                        fontWeight: "600",
                                        color: "gray",
                                      }}
                                    >
                                      --
                                    </Text>
                                  )}
                                </Text>
                                <View
                                  style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginTop: 8,
                                  }}
                                >
                                  <Text
                                    style={{
                                      fontSize: 18,
                                      fontWeight: "500",
                                      color: "#333",
                                    }}
                                  >
                                    Grade:{" "}
                                    {subject.grade !== null ? (
                                      <Text
                                        style={{
                                          fontWeight: "600",
                                          color: "#F39300",
                                        }}
                                      >
                                        {subject.grade}
                                      </Text>
                                    ) : (
                                      <Text
                                        style={{
                                          fontWeight: "600",
                                          color: "gray",
                                        }}
                                      >
                                        --
                                      </Text>
                                    )}
                                  </Text>
                                  <Text
                                    style={{
                                      fontSize: 16,
                                      fontWeight: "bold",
                                      paddingVertical: 2,
                                      paddingHorizontal: 8,
                                      borderRadius: 10,
                                      backgroundColor:
                                        subject.status === "PASSED"
                                          ? "green"
                                          : subject.status === "NOT_PASSED"
                                          ? "red"
                                          : subject.status === "STUDYING"
                                          ? "#F39300"
                                          : "gray",
                                      color: "#fff",
                                    }}
                                  >
                                    {subject.status}
                                  </Text>
                                </View>
                              </View>
                            ))}
                        </View>
                      )
                    )}
                  </ScrollView>
                ) : activeTab === 3 ? (
                  <View
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      marginVertical: 38.5,
                    }}
                  >
                    <ActivityIndicator size={60} color="#F39300" animating />
                  </View>
                ) : null}
                {activeTab === 4 && info3 ? (
                  <>
                    <View
                      style={{
                        paddingHorizontal: 10,
                        backgroundColor: "#ededed",
                        borderRadius: 20,
                        marginBottom: 12,
                      }}
                    >
                      <View
                        style={{
                          paddingVertical: 8,
                          flexDirection: "row",
                          justifyContent: "space-between",
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
                            <Text
                              style={{
                                fontSize: 18,
                                opacity: 0.8,
                                flex: 1,
                              }}
                            >
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
                            <Text
                              style={{
                                fontSize: 18,
                                opacity: 0.8,
                                flex: 1,
                              }}
                            >
                              {dateTo !== "" ? dateTo : "xxxx-xx-xx"}
                            </Text>
                            <TouchableOpacity
                              onPress={() => setShowToPicker(true)}
                            >
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
                                    sortDirection == "ASC"
                                      ? "#F39300"
                                      : "black",
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
                                    sortDirection == "DESC"
                                      ? "#F39300"
                                      : "black",
                                }}
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                      <View
                        style={{
                          margin: 8,
                          justifyContent: "flex-end",
                          alignItems: "flex-end",
                          flexDirection: "row",
                        }}
                      >
                        <TouchableOpacity
                          onPress={cancelFilters2}
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
                          onPress={applyFilters2}
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
                    <ScrollView showsVerticalScrollIndicator={false}>
                      {info3.data
                        .filter((item) => item.status === "ATTEND")
                        .map((item, index) => (
                          <View
                            key={index}
                            style={{
                              backgroundColor: "white",
                              borderRadius: 10,
                              padding: 12,
                              marginBottom: 20,
                              elevation: 3,
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <Image
                              source={{
                                uri: item.counselorInfo.profile.avatarLink,
                              }}
                              style={{
                                width: 50,
                                height: 50,
                                borderRadius: 25,
                                marginRight: 12,
                              }}
                            />
                            <View style={{ flex: 1 }}>
                              <Text
                                style={{
                                  fontWeight: "bold",
                                  fontSize: 18,
                                  color: "#333",
                                  marginBottom: 4,
                                }}
                              >
                                Counselor: {item.counselorInfo.profile.fullName}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 16,
                                  fontWeight: "500",
                                  color: "#333",
                                  marginBottom: 4,
                                }}
                              >
                                Date:{" "}
                                <Text
                                  style={{
                                    color: "#F39300",
                                    fontWeight: "600",
                                  }}
                                >
                                  {item.startDateTime.split("T")[0]}
                                </Text>
                              </Text>
                              <Text
                                style={{
                                  fontSize: 16,
                                  fontWeight: "500",
                                  color: "#333",
                                }}
                              >
                                Time:{" "}
                                <Text
                                  style={{
                                    color: "#F39300",
                                    fontWeight: "600",
                                  }}
                                >
                                  {item.startDateTime
                                    .split("T")[1]
                                    .split(":")[0] +
                                    ":" +
                                    item.startDateTime
                                      .split("T")[1]
                                      .split(":")[1]}{" "}
                                  -{" "}
                                  {item.endDateTime
                                    .split("T")[1]
                                    .split(":")[0] +
                                    ":" +
                                    item.endDateTime
                                      .split("T")[1]
                                      .split(":")[1]}
                                </Text>
                              </Text>
                            </View>
                          </View>
                        ))}
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
                          borderColor: currentPage2 <= 1 ? "#ccc" : "#F39300",
                          opacity: currentPage2 <= 1 ? 0.5 : 1,
                        }}
                        onPress={() => setCurrentPage2(1)}
                        disabled={currentPage2 <= 1}
                      >
                        <Text
                          style={{
                            color: "#333",
                            fontSize: 18,
                            fontWeight: "600",
                          }}
                        >
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
                          borderColor: currentPage2 === 1 ? "#ccc" : "#F39300",
                          opacity: currentPage2 === 1 ? 0.5 : 1,
                        }}
                        onPress={() => setCurrentPage2(currentPage2 - 1)}
                        disabled={currentPage2 <= 1}
                      >
                        <Text
                          style={{
                            color: "#333",
                            fontSize: 18,
                            fontWeight: "600",
                          }}
                        >
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
                            color: "#333",
                            fontWeight: "600",
                          }}
                        >
                          {info3?.data?.length != 0 ? currentPage2 : 0} /{" "}
                          {info3.totalPages}
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
                            info3.totalPages == 0 ||
                            currentPage2 >= info3.totalPages
                              ? "#ccc"
                              : "#F39300",
                          opacity:
                            info3.totalPages == 0 ||
                            currentPage2 >= info3.totalPages
                              ? 0.5
                              : 1,
                        }}
                        onPress={() => setCurrentPage2(currentPage2 + 1)}
                        disabled={
                          info3.totalPages == 0 ||
                          currentPage2 >= info3.totalPages
                        }
                      >
                        <Text
                          style={{
                            color: "#333",
                            fontSize: 18,
                            fontWeight: "600",
                          }}
                        >
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
                            info3.totalPages == 0 ||
                            currentPage2 >= info3.totalPages
                              ? "#ccc"
                              : "#F39300",
                          opacity:
                            info3.totalPages == 0 ||
                            currentPage2 >= info3.totalPages
                              ? 0.5
                              : 1,
                        }}
                        onPress={() => setCurrentPage2(info3.totalPages)}
                        disabled={
                          info3.totalPages == 0 ||
                          currentPage2 >= info3.totalPages
                        }
                      >
                        <Text
                          style={{
                            color: "#333",
                            fontSize: 18,
                            fontWeight: "600",
                          }}
                        >
                          {">>"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : activeTab === 4 ? (
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "600",
                      color: "#333",
                      textAlign: "center",
                    }}
                  >
                    This student doesn't have any apppointments
                  </Text>
                ) : null}
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}
