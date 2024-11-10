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
  Modal,
  ActivityIndicator,
  FlatList,
} from "react-native";
import axiosJWT, { BASE_URL } from "../../../config/Config";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { AuthContext } from "../../context/AuthContext";
import { SocketContext } from "../../context/SocketContext";
import { StudentSkeleton } from "../../layout/Skeleton";
import { Dropdown } from "react-native-element-dropdown";
import RNDateTimePicker from "@react-native-community/datetimepicker";
export default function Student() {
  const navigation = useNavigation();
  const { width, height } = Dimensions.get("screen");
  const [loading, setLoading] = useState(false);
  const { userData } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const scrollViewRef = useRef(null);
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({
    sortDirection: "",
    departmentId: "",
    majorId: "",
    specializationId: "",
  });
  const [filters2, setFilters2] = useState({
    fromDate: "",
    toDate: "",
    SortDirection: "",
  });
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [isIncludeBehavior, setIsIncludeBehaviour] = useState(false);
  const [promptForBehavior, setPromptForBehavior] = useState(null);
  const [debouncedPromptForBehavior, setDebouncedPromptForBehavior] =
    useState(null);
  const [sortDirection, setSortDirection] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [expanded2, setExpanded2] = useState(false);
  const [expanded3, setExpanded3] = useState(false);
  const [expanded4, setExpanded4] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [majors, setMajors] = useState([]);
  const [selectedMajor, setSelectedMajor] = useState("");
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [openTag, setOpenTag] = useState(false);
  const [openInfo, setOpenInfo] = useState(false);
  const [info, setInfo] = useState(null);
  const [info2Loading, setInfo2Loading] = useState(false);
  const [info2, setInfo2] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [info3Loading, setInfo3Loading] = useState(false);
  const [info3, setInfo3] = useState(null);
  const [courses, setCourses] = useState(null);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [info4, setInfo4] = useState(null);
  const [info5, setInfo5] = useState(null);
  const [openInfo3, setOpenInfo3] = useState(false);
  const [historyInfo, setHistoryInfo] = useState(null);
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
    }, [
      debouncedKeyword,
      isIncludeBehavior,
      debouncedPromptForBehavior,
      filters,
      currentPage,
    ])
  );

  const fetchData = async (filters = {}) => {
    setLoading(true);
    try {
      const studentRes = await axiosJWT.get(`${BASE_URL}/students/filter`, {
        params: {
          keyword: debouncedKeyword,
          isIncludeBehavior: isIncludeBehavior,
          promptForBehavior: debouncedPromptForBehavior,
          ...filters,
          page: currentPage,
        },
      });
      const studentData = studentRes?.data || [];
      setStudents(studentData);
      setLoading(false);
    } catch (err) {
      console.log("Can't fetch students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
      setDebouncedPromptForBehavior(promptForBehavior);
    }, 1000);
    return () => clearTimeout(timer);
  }, [keyword, promptForBehavior]);

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

  const applyFilters = () => {
    const newFilters = {
      sortDirection: sortDirection,
      departmentId: selectedDepartment.id,
      majorId: selectedMajor.id,
      specializationId:
        selectedSpecialization.id !== undefined
          ? selectedSpecialization.id
          : "",
    };
    setFilters(newFilters);
    fetchData(newFilters);
  };

  const cancelFilters = () => {
    const resetFilters = {
      sortDirection: "",
      departmentId: "",
      majorId: "",
      specializationId: "",
    };
    setKeyword("");
    setPromptForBehavior(null);
    setSortDirection(resetFilters.sortDirection);
    setSelectedDepartment(resetFilters.departmentId);
    setSelectedMajor(resetFilters.majorId);
    setSelectedSpecialization(resetFilters.specializationId);
    setFilters(resetFilters);
    fetchData(resetFilters);
  };

  useEffect(() => {
    fetchData();
  }, [debouncedKeyword, debouncedPromptForBehavior]);

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
    } catch (err) {
      console.log("Can't fetch student profile");
    }
  };

  const fetchSemester = useCallback(async () => {
    try {
      const semesterRes = await axiosJWT.get(`${BASE_URL}/academic/semester`);
      const semesterData = semesterRes?.data;
      setSemesters(semesterData.sort((a, b) => b.id - a.id));
    } catch (err) {
      console.log("Can't fetch semesters");
    }
  }, []);

  useEffect(() => {
    if (semesters.length) {
      setSelectedSemester(semesters[0].name);
    }
  }, [semesters]);

  const fetchStudentInfo2 = async () => {
    setInfo2Loading(true);
    try {
      const infoRes2 = await axiosJWT.get(
        `${BASE_URL}/students/${selectedStudent}/problem-tag/detail/semester/${selectedSemester}`
      );
      const infoData2 = infoRes2?.data?.content;
      setInfo2(infoData2);
    } catch (err) {
      console.log("Can't fetch student problem details");
    } finally {
      setInfo2Loading(false);
    }
  };

  const fetchCoursesSemester = useCallback(async () => {
    setCoursesLoading(true);
    setAttendanceLoading(true);
    try {
      const courseRes = await axiosJWT.get(
        `${BASE_URL}/students/${selectedStudent}/semester/${selectedSemester}`
      );
      const courseData = courseRes?.data?.content;
      setCourses(courseData);
      setSelectedCourse(courseData[0].id);
    } catch (err) {
      console.log("Can't fetch courses");
      setCourses(null);
      setSelectedCourse(null);
      setInfo4(null);
    } finally {
      setCoursesLoading(false);
      setTimeout(() => {
        setAttendanceLoading(false);
      }, 1000);
    }
  }, [selectedSemester]);

  useEffect(() => {
    if (selectedSemester) {
      setInfo2(null);
      fetchStudentInfo2();
      fetchCoursesSemester();
      setInfo4(null);
    }
  }, [selectedSemester]);

  const fetchStudentInfo3 = async () => {
    setInfo3Loading(true);
    try {
      const infoRes3 = await axiosJWT.get(
        `${BASE_URL}/students/study/${selectedStudent}`
      );
      const infoData3 = infoRes3?.data?.content;
      setInfo3(infoData3);
    } catch (err) {
      console.log("Can't fetch student academic transcript");
    } finally {
      setInfo3Loading(false);
    }
  };

  const fetchStudentInfo4 = async () => {
    setAttendanceLoading(true);
    try {
      const infoRes4 = await axiosJWT.get(
        `${BASE_URL}/students/${selectedStudent}/attendance/${selectedCourse}`
      );
      const infoData4 = infoRes4?.data?.content;
      setInfo4(infoData4);
    } catch (err) {
      console.log("Can't fetch courses attendance");
      setInfo4(null);
    } finally {
      setAttendanceLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCourse) {
      fetchStudentInfo4();
    } else {
      setInfo4(null);
    }
  }, [selectedCourse]);

  const fetchStudentInfo5 = async (filters2 = {}) => {
    try {
      const infoRes5 = await axiosJWT.get(
        `${BASE_URL}/students/appointment/filter/${selectedStudent}`,
        {
          params: {
            ...filters2,
            page: currentPage2,
          },
        }
      );
      const infoData5 = infoRes5?.data?.content;
      setInfo5(infoData5);
    } catch (err) {
      console.log("Can't fetch student appointment history");
    }
  };

  useEffect(() => {
    if (selectedStudent !== null) {
      fetchStudentInfo();
      fetchStudentInfo3();
      fetchSemester();
      fetchStudentInfo5(filters2);
    }
  }, [selectedStudent]);

  const applyFilters2 = () => {
    const newFilters = {
      fromDate: dateFrom,
      toDate: dateTo,
      SortDirection: sortDirection2,
    };
    setFilters(newFilters);
    fetchStudentInfo5(newFilters);
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
    fetchStudentInfo5(resetFilters);
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

  const handleOpenHistoryInfo = (info) => {
    setHistoryInfo(info);
    setOpenInfo3(true);
  };

  const handleCloseHistoryInfo = () => {
    setHistoryInfo("");
    setOpenInfo3(false);
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
        <>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <View
              style={{
                flex: 0.925,
                flexDirection: "row",
                borderRadius: 30,
                marginLeft: 20,
                marginRight: 8,
                paddingHorizontal: 16,
                alignItems: "center",
                backgroundColor: "#ededed",
                alignContent: "center",
                height: 40,
              }}
            >
              <Ionicons
                name="search"
                size={24}
                style={{ marginRight: 10, color: "#F39300", opacity: 0.7 }}
              />
              <TextInput
                placeholder="Search by Name"
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
            <TouchableOpacity
              disabled
              onPress={() => (
                setIsIncludeBehaviour(!isIncludeBehavior),
                setCurrentPage(1),
                setPromptForBehavior(null)
              )}
              style={{
                backgroundColor: isIncludeBehavior ? "#F39300" : "#e3e3e3",
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: isIncludeBehavior ? "white" : "gray",
                }}
              >
                Prompt
              </Text>
            </TouchableOpacity>
          </View>
          {isIncludeBehavior && (
            <View
              style={{
                flexDirection: "row",
                borderRadius: 30,
                marginHorizontal: 20,
                marginBottom: 10,
                paddingHorizontal: 16,
                alignItems: "center",
                backgroundColor: "#ededed",
                alignContent: "center",
                height: 40,
              }}
            >
              <MaterialCommunityIcons
                name="head-cog-outline"
                size={24}
                style={{ marginRight: 10, color: "#F39300", opacity: 0.7 }}
              />
              <TextInput
                placeholder="Search by Advanced Prompt"
                placeholderTextColor="#F39300"
                value={promptForBehavior}
                onChangeText={(value) => setPromptForBehavior(value)}
                style={{
                  flex: 1,
                  fontSize: 18,
                  opacity: 0.8,
                  marginHorizontal: 4,
                }}
              />
              {promptForBehavior !== null && (
                <TouchableOpacity onPress={() => setPromptForBehavior(null)}>
                  <Ionicons
                    name="close"
                    size={28}
                    style={{ color: "#F39300", opacity: 0.7 }}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}
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
                      Department:
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
                        marginLeft: 8,
                      }}
                      placeholderStyle={{ fontSize: 16 }}
                      selectedTextStyle={{
                        fontSize: 18,
                        color: selectedDepartment ? "black" : "white",
                      }}
                      inputSearchStyle={{ height: 40, fontSize: 16 }}
                      maxHeight={250}
                      data={departments}
                      labelField="name"
                      value={
                        selectedDepartment !== ""
                          ? selectedDepartment.name
                          : "Select item"
                      }
                      placeholder={
                        selectedDepartment !== ""
                          ? selectedDepartment.name
                          : "Select item"
                      }
                      searchPlaceholder="Search Specialization"
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
                                item.name == selectedDepartment.name
                                  ? "#F39300"
                                  : "white",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 18,
                                fontWeight: "500",
                                color:
                                  item.name == selectedDepartment.name
                                    ? "white"
                                    : "black",
                              }}
                            >
                              {item.name}
                            </Text>
                            {selectedDepartment.name === item.name && (
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
                      Major:
                    </Text>
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
                        marginLeft: 8,
                      }}
                      placeholderStyle={{ fontSize: 16 }}
                      selectedTextStyle={{
                        fontSize: 18,
                        color: selectedMajor ? "black" : "white",
                      }}
                      inputSearchStyle={{ height: 40, fontSize: 16 }}
                      maxHeight={250}
                      data={majors}
                      labelField="name"
                      value={
                        selectedMajor !== ""
                          ? selectedMajor.name
                          : "Select item"
                      }
                      placeholder={
                        selectedMajor !== ""
                          ? selectedMajor.name
                          : "Select item"
                      }
                      searchPlaceholder="Search Specialization"
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
                                item.name == selectedMajor.name
                                  ? "#F39300"
                                  : "white",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 18,
                                fontWeight: "500",
                                color:
                                  item.name == selectedMajor.name
                                    ? "white"
                                    : "black",
                              }}
                            >
                              {item.name}
                            </Text>
                            {selectedMajor.name === item.name && (
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
                      Specialization:
                    </Text>
                    <Dropdown
                      disable={
                        selectedDepartment === "" || selectedMajor === ""
                      }
                      style={{
                        backgroundColor: "white",
                        borderColor: expanded3 ? "#F39300" : "black",
                        flex: 1,
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
        </>
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
              <View
                key={item.id}
                style={{
                  flex: 1,
                  alignItems: "stretch",
                  backgroundColor: "#F39300",
                  borderRadius: 20,
                  marginVertical: 8,
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => (
                    setSelectedStudent(item.id), setOpenInfo(true)
                  )}
                  style={{ flexDirection: "row" }}
                >
                  <View
                    style={{
                      backgroundColor: "#fff0e0",
                      justifyContent: "flex-start",
                      padding: 12,
                      marginLeft: 4,
                      marginRight: 2,
                      marginTop: 4,
                      marginBottom: item.behaviorTagList.length > 0 ? 2 : 4,
                      borderTopLeftRadius: 18,
                      borderBottomLeftRadius:
                        item.behaviorTagList.length > 0 ? 0 : 18,
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
                      padding: 8,
                      marginTop: 4,
                      marginBottom: item.behaviorTagList.length > 0 ? 2 : 4,
                      marginRight: 4,
                      borderTopRightRadius: 18,
                      borderBottomRightRadius:
                        item.behaviorTagList.length > 0 ? 0 : 18,
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
                          {item?.specialization?.name || "N/A"}
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
                {item.behaviorTagList.length > 0 && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      setSelectedStudent(item);
                      setOpenTag(true);
                    }}
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      flexWrap: "wrap",
                      backgroundColor: "white",
                      borderBottomLeftRadius: 18,
                      borderBottomRightRadius: 18,
                      paddingHorizontal: 12,
                      paddingTop: 8,
                      marginHorizontal: 4,
                      marginBottom: 4,
                    }}
                  >
                    {item.behaviorTagList
                      .sort(
                        (a, b) =>
                          (b.contained === true) - (a.contained === true)
                      )
                      .slice(0, 3)
                      .map((tag, index) => (
                        <View
                          key={index}
                          style={{
                            backgroundColor:
                              tag.contained === true ? "#F39300" : "#ededed",
                            borderRadius: 20,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            marginHorizontal: 4,
                            marginTop: 8,
                            alignSelf: "flex-start",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 16,
                              color: tag.contained === true ? "white" : "#333",
                              fontWeight:
                                tag.contained === true ? "600" : "400",
                            }}
                          >
                            {tag.problemTagName} x {tag.number}
                          </Text>
                        </View>
                      ))}
                    {item.behaviorTagList.length > 3 && (
                      <View
                        style={{
                          backgroundColor: "#ededed",
                          borderRadius: 20,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          marginHorizontal: 4,
                          marginTop: 8,
                          alignSelf: "flex-start",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            color: "#333",
                            fontWeight: "400",
                          }}
                        >
                          + {item.behaviorTagList.length - 3}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
          {selectedStudent && openTag && (
            <Modal
              visible={openTag}
              transparent={true}
              animationType="slide"
              onRequestClose={() => (
                setOpenTag(false), setSelectedStudent(null)
              )}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    backgroundColor: "white",
                    borderRadius: 10,
                    width: "90%",
                    height: "85%",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#F39300",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: 20,
                      marginBottom: 12,
                      borderTopLeftRadius: 10,
                      borderTopRightRadius: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 24,
                        fontWeight: "bold",
                        color: "white",
                      }}
                    >
                      Behaviour Tags
                    </Text>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        setOpenTag(false);
                        setSelectedStudent(null);
                      }}
                      style={{
                        backgroundColor: "white",
                        padding: 4,
                        borderRadius: 20,
                        alignSelf: "flex-end",
                        alignItems: "flex-end",
                      }}
                    >
                      <Ionicons name="close" size={24} color="#F39300" />
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={selectedStudent?.behaviorTagList}
                    keyExtractor={(tag, index) => index.toString()}
                    showsVerticalScrollIndicator={false}
                    style={{ paddingHorizontal: 20 }}
                    renderItem={({ item: tag }) => (
                      <View
                        style={{
                          backgroundColor: tag.contained
                            ? "#F39300"
                            : "#ededed",
                          borderRadius: 20,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          marginTop: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            color: tag.contained === true ? "white" : "#333",
                            fontWeight: tag.contained === true ? "600" : "400",
                          }}
                        >
                          {tag.problemTagName} x {tag.number}
                        </Text>
                      </View>
                    )}
                  />
                </View>
              </View>
            </Modal>
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
            setSelectedSemester(null),
            setInfo3(null),
            setCourses(null),
            setSelectedCourse(null),
            setInfo4(null),
            setInfo5(null),
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
                  setSelectedSemester(null),
                  setInfo3(null),
                  setCourses(null),
                  setSelectedCourse(null),
                  setInfo4(null),
                  setInfo5(null),
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
                    onPress={() => (
                      setActiveTab(3), setSelectedSemester(semesters[0].name)
                    )}
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
                      Problem Details
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setActiveTab(4)}
                    style={{
                      paddingVertical: 8,
                      marginRight: 20,
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
                      Academic Transcript
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => (
                      setActiveTab(5), setSelectedSemester(semesters[0].name)
                    )}
                    style={{
                      paddingVertical: 8,
                      marginRight: 20,
                      borderBottomWidth: 2,
                      borderBottomColor:
                        activeTab === 5 ? "#F39300" : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: activeTab === 5 ? "bold" : "500",
                        color: activeTab === 5 ? "#F39300" : "#333",
                      }}
                    >
                      Attendance Report
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setActiveTab(6)}
                    style={{
                      paddingVertical: 8,
                      borderBottomWidth: 2,
                      borderBottomColor:
                        activeTab === 6 ? "#F39300" : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: activeTab === 6 ? "bold" : "500",
                        color: activeTab === 6 ? "#F39300" : "#333",
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
                          {info?.studentProfile?.department?.name} (
                          {info?.studentProfile?.department?.code})
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
                          {info?.studentProfile?.major?.name} (
                          {info?.studentProfile?.major?.code})
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
                          {info?.studentProfile?.specialization?.name || "N/A"}
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
                        {info.counselingProfile.introduction || "N/A"}
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
                          {info.counselingProfile.currentHealthStatus || "N/A"}
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
                          {info.counselingProfile.psychologicalStatus || "N/A"}
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
                          {info.counselingProfile.stressFactors || "N/A"}
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
                          {info.counselingProfile.academicDifficulties || "N/A"}
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
                          {info.counselingProfile.studyPlan || "N/A"}
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
                          {info.counselingProfile.careerGoals || "N/A"}
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
                          {info.counselingProfile.partTimeExperience || "N/A"}
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
                          {info.counselingProfile.internshipProgram || "N/A"}
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
                          {info.counselingProfile.extracurricularActivities ||
                            "N/A"}
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
                          {info.counselingProfile.personalInterests || "N/A"}
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
                          {info.counselingProfile.socialRelationships || "N/A"}
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
                          {info.counselingProfile.financialSituation || "N/A"}
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
                          {info.counselingProfile.financialSupport || "N/A"}
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
                          {info.counselingProfile.desiredCounselingFields ||
                            "N/A"}
                        </Text>
                      </View>
                    </View>
                  </ScrollView>
                ) : activeTab === 2 ? (
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
                    This student doesn't have counseling profile
                  </Text>
                ) : null}
                {activeTab === 3 && selectedSemester ? (
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        backgroundColor: "white",
                        borderRadius: 10,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        marginBottom: 16,
                        elevation: 1,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: "bold",
                          color: "#F39300",
                          marginBottom: 8,
                        }}
                      >
                        TERM
                      </Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                      >
                        {semesters.map((semester) => (
                          <TouchableOpacity
                            key={semester.id}
                            onPress={() => setSelectedSemester(semester.name)}
                            style={{
                              padding: 8,
                              marginRight: 8,
                              marginBottom: 8,
                              backgroundColor: "white",
                              borderRadius: 10,
                              borderWidth: 2,
                              borderColor:
                                selectedSemester === semester.name
                                  ? "#F39300"
                                  : "black",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 14,
                                fontWeight: "600",
                                color:
                                  selectedSemester === semester.name
                                    ? "#F39300"
                                    : "black",
                                textAlign: "left",
                              }}
                            >
                              {semester.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                    {info2Loading ? (
                      <View
                        style={{
                          justifyContent: "center",
                          alignItems: "center",
                          marginVertical: 38.5,
                        }}
                      >
                        <ActivityIndicator
                          size={40}
                          color="#F39300"
                          animating
                        />
                      </View>
                    ) : info2 && Object.keys(info2).length > 0 ? (
                      <ScrollView showsVerticalScrollIndicator={false}>
                        {Object.entries(info2).map(([subject, tags], index) => (
                          <View
                            key={index}
                            style={{
                              backgroundColor: "white",
                              padding: 16,
                              borderRadius: 12,
                              marginBottom: 12,
                              elevation: 1,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 20,
                                fontWeight: "bold",
                                color: "#333",
                                marginBottom: 8,
                              }}
                            >
                              {subject}
                            </Text>
                            {tags.isNotExcluded.map((tag, tagIndex) => (
                              <View
                                key={tagIndex}
                                style={{
                                  backgroundColor: tag.contained
                                    ? "#F39300"
                                    : "#ededed",
                                  padding: 8,
                                  borderRadius: 20,
                                  marginBottom: 8,
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 16,
                                    color: tag.contained ? "white" : "#333",
                                    fontWeight: tag.contained ? "bold" : "400",
                                  }}
                                >
                                  {tag.problemTagName} x {tag.number}
                                </Text>
                              </View>
                            ))}
                            {tags.isExcluded.length > 0 && (
                              <>
                                <Text
                                  style={{
                                    fontSize: 14,
                                    color: "#666",
                                    marginTop: 8,
                                  }}
                                >
                                  Excluded Tags:
                                </Text>
                                {tags.isExcluded.map((tag, tagIndex) => (
                                  <View
                                    key={tagIndex}
                                    style={{
                                      backgroundColor: tag.contained
                                        ? "#F39300"
                                        : "#ededed",
                                      padding: 8,
                                      borderRadius: 20,
                                      marginBottom: 8,
                                    }}
                                  >
                                    <Text
                                      style={{
                                        fontSize: 16,
                                        color: tag.contained ? "white" : "#333",
                                        fontWeight: tag.contained
                                          ? "bold"
                                          : "400",
                                      }}
                                    >
                                      {tag.problemTagName} x {tag.number}
                                    </Text>
                                  </View>
                                ))}
                              </>
                            )}
                          </View>
                        ))}
                      </ScrollView>
                    ) : (
                      <Text
                        style={{
                          fontSize: 18,
                          fontStyle: "italic",
                          textAlign: "center",
                          fontWeight: "600",
                          color: "gray",
                          opacity: 0.7,
                        }}
                      >
                        You have no problem details in this term
                      </Text>
                    )}
                  </View>
                ) : activeTab === 3 ? (
                  <></>
                ) : null}
                {activeTab === 4 ? (
                  info3Loading ? (
                    <View
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                        marginVertical: 38.5,
                      }}
                    >
                      <ActivityIndicator size={40} color="#F39300" animating />
                    </View>
                  ) : info3 ? (
                    <>
                      <View
                        style={{
                          backgroundColor: "white",
                          borderRadius: 10,
                          padding: 12,
                          marginBottom: 20,
                          elevation: 1,
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
                          Analysis Summary
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "600",
                              color: "#333",
                            }}
                          >
                            Passed:{" "}
                            <Text
                              style={{ color: "green", fontWeight: "bold" }}
                            >
                              {
                                info3.filter(
                                  (subject) => subject.status === "PASSED"
                                ).length
                              }
                            </Text>
                          </Text>
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "600",
                              color: "#333",
                            }}
                          >
                            Failed:{" "}
                            <Text style={{ color: "red", fontWeight: "bold" }}>
                              {
                                info3.filter(
                                  (subject) => subject.status === "NOT_PASSED"
                                ).length
                              }
                            </Text>
                          </Text>
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "600",
                              color: "#333",
                            }}
                          >
                            GPA:{" "}
                            <Text
                              style={{ color: "#F39300", fontWeight: "bold" }}
                            >
                              {info3
                                .filter((subject) => subject.grade !== null)
                                .reduce(
                                  (acc, subject, _, array) =>
                                    acc +
                                    parseFloat(subject.grade) / array.length,
                                  0
                                )
                                .toFixed(2)}
                            </Text>
                          </Text>
                        </View>
                      </View>
                      <ScrollView showsVerticalScrollIndicator={false}>
                        {[...new Set(info3.map((item) => item.term))].map(
                          (term) => (
                            <View
                              key={term}
                              style={{
                                backgroundColor: "white",
                                borderRadius: 10,
                                padding: 12,
                                marginBottom: 20,
                                elevation: 1,
                              }}
                            >
                              <Text
                                style={{
                                  fontWeight: "bold",
                                  fontSize: 20,
                                  marginBottom: 4,
                                  color: "#F39300",
                                }}
                              >
                                Term {term}
                              </Text>
                              {info3
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
                                        fontSize: 18,
                                        fontWeight: "600",
                                        marginBottom: 4,
                                      }}
                                    >
                                      {subject.subjectCode} -{" "}
                                      {subject.subjectName}
                                    </Text>
                                    <Text
                                      style={{
                                        fontSize: 16,
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
                                          fontSize: 16,
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
                                          fontWeight: "bold",
                                          paddingVertical: 4,
                                          paddingHorizontal: 12,
                                          borderRadius: 20,
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
                    </>
                  ) : (
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
                      Can't find student academic transcript data
                    </Text>
                  )
                ) : activeTab === 4 ? (
                  <></>
                ) : null}
                {activeTab === 5 && semesters ? (
                  <>
                    <View style={{ flexDirection: "row", maxHeight: "32.5%" }}>
                      <View
                        style={{
                          flex: 0.55,
                          backgroundColor: "#fff",
                          borderRadius: 10,
                          padding: 12,
                          marginBottom: 12,
                          marginRight: 12,
                          elevation: 1,
                        }}
                      >
                        <View style={{ marginBottom: 8 }}>
                          <Text
                            style={{
                              fontWeight: "bold",
                              fontSize: 18,
                              color: "#F39300",
                            }}
                          >
                            TERM
                          </Text>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                          {semesters.map((semester) => (
                            <TouchableOpacity
                              key={semester.id}
                              onPress={() => setSelectedSemester(semester.name)}
                              style={{
                                flex: 1,
                                padding: 8,
                                marginBottom: 12,
                                backgroundColor: "white",
                                borderRadius: 10,
                                borderWidth: 2,
                                borderColor:
                                  selectedSemester === semester.name
                                    ? "#F39300"
                                    : "black",
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 14,
                                  fontWeight: "600",
                                  color:
                                    selectedSemester === semester.name
                                      ? "#F39300"
                                      : "black",
                                  textAlign: "left",
                                }}
                              >
                                {semester.name}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                      <View
                        style={{
                          flex: 1,
                          backgroundColor: "#fff",
                          borderRadius: 10,
                          padding: 12,
                          marginBottom: 12,
                          elevation: 1,
                        }}
                      >
                        <View style={{ marginBottom: 8 }}>
                          <Text
                            style={{
                              fontWeight: "bold",
                              fontSize: 18,
                              color: "#F39300",
                            }}
                          >
                            COURSE
                          </Text>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                          {coursesLoading ? (
                            <View
                              style={{
                                justifyContent: "center",
                                alignItems: "center",
                                marginVertical: 38.5,
                              }}
                            >
                              <ActivityIndicator
                                size={40}
                                color="#F39300"
                                animating
                              />
                            </View>
                          ) : courses ? (
                            courses.map((course) => (
                              <TouchableOpacity
                                key={course.id}
                                onPress={() => setSelectedCourse(course.id)}
                                style={{
                                  padding: 8,
                                  marginRight: 8,
                                  marginBottom: 12,
                                  backgroundColor: "white",
                                  borderRadius: 10,
                                  borderWidth: 2,
                                  borderColor:
                                    selectedCourse === course.id
                                      ? "#F39300"
                                      : "black",
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 14,
                                    fontWeight: "600",
                                    color:
                                      selectedCourse === course.id
                                        ? "#F39300"
                                        : "black",
                                    textAlign: "left",
                                  }}
                                >
                                  {course.subjectName}
                                </Text>
                              </TouchableOpacity>
                            ))
                          ) : (
                            <Text
                              style={{
                                fontSize: 16,
                                fontStyle: "italic",
                                fontWeight: "600",
                                color: "gray",
                                opacity: 0.7,
                              }}
                            >
                              You have no courses in this term
                            </Text>
                          )}
                        </ScrollView>
                      </View>
                    </View>
                    <View
                      style={{
                        backgroundColor: "#fff",
                        borderRadius: 10,
                        padding: 12,
                        marginBottom: 20,
                        elevation: 1,
                        maxHeight: "67.5%",
                      }}
                    >
                      <ScrollView showsVerticalScrollIndicator={false}>
                        {attendanceLoading ? (
                          <View
                            style={{
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <ActivityIndicator
                              size={40}
                              color="#F39300"
                              animating
                            />
                          </View>
                        ) : info4 ? (
                          info4?.map((item, index) => (
                            <View
                              key={index}
                              style={{
                                flex: 1,
                                flexDirection: "row",
                                justifyContent: "flex-start",
                                padding: 12,
                                backgroundColor: "#fdfdfd",
                                borderRadius: 10,
                                marginBottom: 12,
                                elevation: 1,
                              }}
                            >
                              <View style={{ flex: 0.08 }}>
                                <Text
                                  style={{
                                    fontSize: 18,
                                    fontWeight: "600",
                                    color: "#333",
                                    opacity: 0.7,
                                  }}
                                >
                                  {index + 1}
                                </Text>
                              </View>
                              <View
                                style={{
                                  width: 2,
                                  backgroundColor: "lightgrey",
                                  height: "100%",
                                  marginHorizontal: 12,
                                }}
                              />
                              <View
                                style={{
                                  flex: 1,
                                  flexDirection: "column",
                                }}
                              >
                                <Text
                                  style={{
                                    fontWeight: "bold",
                                    fontSize: 16,
                                    color: "#333",
                                  }}
                                >
                                  Date:{" "}
                                  <Text style={{ fontWeight: "400" }}>
                                    {item.date}
                                  </Text>
                                </Text>
                                <Text
                                  style={{
                                    fontWeight: "bold",
                                    fontSize: 16,
                                    color: "#333",
                                  }}
                                >
                                  Slot:{" "}
                                  <Text style={{ fontWeight: "400" }}>
                                    {item.slot}
                                  </Text>
                                </Text>
                                <Text
                                  style={{
                                    fontWeight: "bold",
                                    fontSize: 16,
                                    color: "#333",
                                  }}
                                >
                                  Room:{" "}
                                  <Text style={{ fontWeight: "400" }}>
                                    {item.room}
                                  </Text>
                                </Text>
                                <Text
                                  style={{
                                    fontWeight: "bold",
                                    fontSize: 16,
                                    color: "#333",
                                  }}
                                >
                                  Lecturer:{" "}
                                  <Text style={{ fontWeight: "400" }}>
                                    {item.lecturer}
                                  </Text>
                                </Text>
                                <Text
                                  style={{
                                    fontWeight: "bold",
                                    fontSize: 16,
                                    color: "#333",
                                  }}
                                >
                                  Group Name:{" "}
                                  <Text style={{ fontWeight: "400" }}>
                                    {item.groupName}
                                  </Text>
                                </Text>
                                <Text
                                  style={{
                                    fontWeight: "bold",
                                    fontSize: 16,
                                    color: "#333",
                                  }}
                                >
                                  Attendance Status:{" "}
                                  <Text
                                    style={{
                                      fontWeight: "bold",
                                      color:
                                        item.status === "PRESENT"
                                          ? "green"
                                          : item.status === "ABSENT"
                                          ? "red"
                                          : item.status === "FUTURE"
                                          ? "#f39033"
                                          : "black",
                                    }}
                                  >
                                    {item.status}
                                  </Text>
                                </Text>
                                {item.lecturerComment && (
                                  <Text
                                    style={{
                                      fontWeight: "bold",
                                      color: "#F39300",
                                      fontSize: 16,
                                      marginTop: 8,
                                    }}
                                  >
                                    Lecturer Note:{" "}
                                    <Text
                                      style={{
                                        fontWeight: "500",
                                        fontStyle: "italic",
                                        color: "#333",
                                        opacity: 0.5,
                                      }}
                                    >
                                      {item.lecturerComment}
                                    </Text>
                                  </Text>
                                )}
                              </View>
                            </View>
                          ))
                        ) : (
                          <Text
                            style={{
                              fontSize: 16,
                              fontStyle: "italic",
                              fontWeight: "600",
                              color: "gray",
                              opacity: 0.7,
                            }}
                          >
                            Can't find attendance report because of no courses
                            found. Please choose another courses or find courses
                            in another term
                          </Text>
                        )}
                      </ScrollView>
                    </View>
                  </>
                ) : activeTab === 5 ? (
                  <Text
                    style={{ fontStyle: "italic", color: "gray", opacity: 0.7 }}
                  ></Text>
                ) : null}
                {activeTab === 6 && info5 ? (
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
                      {info5.data
                        .filter((item) => item.status === "ATTEND")
                        .map((item, index) => (
                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => handleOpenHistoryInfo(item)}
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
                          </TouchableOpacity>
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
                          {info5?.data?.length != 0 ? currentPage2 : 0} /{" "}
                          {info5.totalPages}
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
                            info5.totalPages == 0 ||
                            currentPage2 >= info5.totalPages
                              ? "#ccc"
                              : "#F39300",
                          opacity:
                            info5.totalPages == 0 ||
                            currentPage2 >= info5.totalPages
                              ? 0.5
                              : 1,
                        }}
                        onPress={() => setCurrentPage2(currentPage2 + 1)}
                        disabled={
                          info5.totalPages == 0 ||
                          currentPage2 >= info5.totalPages
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
                            info5.totalPages == 0 ||
                            currentPage2 >= info5.totalPages
                              ? "#ccc"
                              : "#F39300",
                          opacity:
                            info5.totalPages == 0 ||
                            currentPage2 >= info5.totalPages
                              ? 0.5
                              : 1,
                        }}
                        onPress={() => setCurrentPage2(info5.totalPages)}
                        disabled={
                          info5.totalPages == 0 ||
                          currentPage2 >= info5.totalPages
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
                    <Modal
                      transparent={true}
                      visible={openInfo3}
                      animationType="slide"
                      onRequestClose={handleCloseHistoryInfo}
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
                              onPress={handleCloseHistoryInfo}
                            >
                              <Ionicons name="chevron-back" size={28} />
                            </TouchableOpacity>
                            {historyInfo?.status != "WAITING" && (
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
                                <Ionicons
                                  name="newspaper"
                                  size={28}
                                  color="#F39300"
                                />
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
                                  <View style={{ position: "relative" }}>
                                    <Image
                                      source={{
                                        uri: historyInfo?.studentInfo?.profile
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
                                          historyInfo?.studentInfo?.profile
                                            ?.gender == "MALE"
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
                                    {
                                      historyInfo?.studentInfo?.profile
                                        ?.fullName
                                    }
                                  </Text>
                                  <Text
                                    style={{
                                      fontSize: 20,
                                      fontWeight: "500",
                                      color: "#333",
                                      marginBottom: 2,
                                    }}
                                  >
                                    {
                                      historyInfo?.studentInfo?.specialization
                                        ?.name
                                    }
                                  </Text>
                                  <Text
                                    style={{
                                      fontSize: 16,
                                      color: "grey",
                                      marginBottom: 2,
                                    }}
                                  >
                                    ID: {historyInfo?.studentInfo?.studentCode}
                                  </Text>
                                  <Text
                                    style={{
                                      fontSize: 16,
                                      color: "grey",
                                    }}
                                  >
                                    Phone:{" "}
                                    {
                                      historyInfo?.studentInfo?.profile
                                        ?.phoneNumber
                                    }
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
                                    style={{
                                      flexDirection: "row",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Ionicons
                                      name="calendar"
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
                                    {historyInfo?.startDateTime?.split("T")[0]}
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
                                    style={{
                                      flexDirection: "row",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Ionicons
                                      name="time"
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
                                    {historyInfo?.startDateTime
                                      ?.split("T")[1]
                                      ?.split(":")[0] +
                                      ":" +
                                      historyInfo?.startDateTime
                                        ?.split("T")[1]
                                        ?.split(":")[1]}{" "}
                                    -{" "}
                                    {historyInfo?.endDateTime
                                      ?.split("T")[1]
                                      ?.split(":")[0] +
                                      ":" +
                                      historyInfo?.endDateTime
                                        ?.split("T")[1]
                                        ?.split(":")[1]}
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
                                    style={{
                                      flexDirection: "row",
                                      alignItems: "center",
                                    }}
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
                                      {historyInfo?.meetingType}
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
                                    style={{
                                      flexDirection: "row",
                                      alignItems: "center",
                                    }}
                                  >
                                    {historyInfo?.meetingType === "ONLINE" && (
                                      <Ionicons
                                        name="videocam"
                                        size={22}
                                        color="#F39300"
                                      />
                                    )}
                                    {historyInfo?.meetingType === "OFFLINE" && (
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
                                      {historyInfo?.meetingType === "ONLINE"
                                        ? "Meet URL"
                                        : "Address"}
                                    </Text>
                                  </View>
                                  <View
                                    style={{
                                      flexDirection: "row",
                                      maxWidth: "50%",
                                    }}
                                  >
                                    <Text
                                      style={{
                                        fontSize: 18,
                                        fontWeight: "bold",
                                        color: "#333",
                                        textAlign: "right",
                                      }}
                                    >
                                      {historyInfo?.meetingType === "ONLINE"
                                        ? historyInfo?.meetUrl || "N/A"
                                        : historyInfo?.address || "N/A"}
                                    </Text>
                                  </View>
                                </View>
                              </View>
                              {historyInfo?.appointmentFeedback !== null ? (
                                <View
                                  style={{
                                    marginTop: 20,
                                    borderRadius: 20,
                                    backgroundColor: "white",
                                    padding: 16,
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
                                        {
                                          historyInfo?.studentInfo?.profile
                                            ?.fullName
                                        }
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
                                      <Ionicons
                                        name="star"
                                        size={16}
                                        color="white"
                                      />
                                      <Text
                                        style={{
                                          fontSize: 16,
                                          marginLeft: 6,
                                          fontWeight: "bold",
                                          color: "white",
                                        }}
                                      >
                                        {historyInfo?.appointmentFeedback?.rating.toFixed(
                                          1
                                        )}
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
                                        {formatDate(
                                          historyInfo?.appointmentFeedback
                                            ?.createdAt
                                        )}
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
                                    {historyInfo?.appointmentFeedback?.comment}
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
                  </>
                ) : activeTab === 6 ? (
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
