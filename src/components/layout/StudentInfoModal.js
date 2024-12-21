import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Modal,
  ActivityIndicator,
} from "react-native";
import axiosJWT, { BASE_URL } from "../../config/Config";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import Pagination from "../layout/Pagination";
import Markdown from "react-native-markdown-display";
import AlertModal from "../layout/AlertModal";
import { AuthContext } from "../context/AuthContext";

export default function StudentInfoModal({
  selectedStudentInfo,
  setSelectedStudentInfo,
  openStudentInfo,
  setOpenStudentInfo,
}) {
  const { width, height } = Dimensions.get("screen");
  const { userData } = useContext(AuthContext);
  const [filters2, setFilters2] = useState({
    fromDate: "",
    toDate: "",
    SortDirection: "",
  });
  const [semesters, setSemesters] = useState([]);
  const [info, setInfo] = useState(null);
  const [info2Loading, setInfo2Loading] = useState(false);
  const [info2, setInfo2] = useState(null);
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const [openAssessment, setOpenAssessment] = useState(false);
  const [selectedSemester4, setSelectedSemester4] = useState(null);
  const [info3Loading, setInfo3Loading] = useState(false);
  const [info3, setInfo3] = useState(null);
  const [courses, setCourses] = useState(null);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [info4, setInfo4] = useState(null);
  const [info5Loading, setInfo5Loading] = useState(false);
  const [info5, setInfo5] = useState(null);
  const [info6, setInfo6] = useState(null);
  const [openHistoryInfo, setOpenHistoryInfo] = useState(false);
  const [historyInfo, setHistoryInfo] = useState(null);
  const [openReport, setOpenReport] = useState(false);
  const [report, setReport] = useState(null);
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

  useEffect(() => {
    fetchSemester();
  }, []);

  const fetchStudentInfo = async () => {
    try {
      const infoRes = await axiosJWT.get(
        `${BASE_URL}/students/document/${selectedStudentInfo}`
      );
      const infoData = infoRes?.data?.content;
      setInfo(infoData);
    } catch (err) {
      console.log("Can't fetch student profile");
    }
  };

  const fetchSemester = async () => {
    try {
      const semesterRes = await axiosJWT.get(`${BASE_URL}/academic/semester`);
      const semesterData = semesterRes?.data;
      setSemesters(semesterData.sort((a, b) => b.id - a.id));
    } catch (err) {
      console.log("Can't fetch semesters");
    }
  };

  useEffect(() => {
    if (semesters.length && selectedStudentInfo) {
      setSelectedSemester4(semesters[0].name);
    }
  }, [semesters]);

  const fetchStudentInfo2 = async () => {
    setInfo2Loading(true);
    try {
      const infoRes2 = await axiosJWT.get(
        `${BASE_URL}/students/${selectedStudentInfo}/problem-tag/detail/semester/${selectedSemester4}`
      );
      const infoData2 = infoRes2?.data?.content;
      setInfo2(infoData2);
    } catch (err) {
      console.log("Can't fetch student problem tags");
    } finally {
      setInfo2Loading(false);
    }
  };

  const fetchGeneralAssessment = async () => {
    setAssessmentLoading(true);
    try {
      const assessRes = await axiosJWT.get(
        `${BASE_URL}/students/${selectedStudentInfo}/behavior/general-assessment/semester/${selectedSemester4}`
      );
      const assessData = assessRes.data;
      setAssessment(assessData);
      setOpenAssessment(true);
    } catch (err) {
      console.log("Can't fetch student general assessment");
    } finally {
      setAssessmentLoading(false);
    }
  };

  const fetchCoursesSemester = useCallback(async () => {
    setCoursesLoading(true);
    setAttendanceLoading(true);
    try {
      const courseRes = await axiosJWT.get(
        `${BASE_URL}/students/${selectedStudentInfo}/semester/${selectedSemester4}`
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
  }, [selectedSemester4]);

  useEffect(() => {
    if (selectedSemester4) {
      setInfo2(null);
      fetchStudentInfo2();
      fetchCoursesSemester();
      setInfo4(null);
      setInfo3(null);
      fetchStudentInfo3();
    }
  }, [selectedSemester4]);

  const fetchStudentInfo3 = async () => {
    setInfo3Loading(true);
    try {
      const infoRes3 = await axiosJWT.get(
        `${BASE_URL}/students/mark-report/${selectedStudentInfo}/semester/${selectedSemester4}`
      );
      const infoData3 = infoRes3?.data?.content;
      setInfo3(infoData3);
    } catch (err) {
      console.log("Can't fetch student mark report");
    } finally {
      setInfo3Loading(false);
    }
  };

  const fetchStudentInfo4 = async () => {
    setAttendanceLoading(true);
    try {
      const infoRes4 = await axiosJWT.get(
        `${BASE_URL}/students/${selectedStudentInfo}/attendance/${selectedCourse}`
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

  const fetchStudentInfo5 = async () => {
    setInfo5Loading(true);
    try {
      const infoRes3 = await axiosJWT.get(
        `${BASE_URL}/students/study/${selectedStudentInfo}`
      );
      const infoData3 = infoRes3?.data?.content;
      setInfo5(infoData3);
    } catch (err) {
      console.log("Can't fetch student academic transcript");
    } finally {
      setInfo5Loading(false);
    }
  };

  const fetchStudentInfo6 = async (filters2 = {}) => {
    try {
      const infoRes6 = await axiosJWT.get(
        `${BASE_URL}/students/appointment/filter/${selectedStudentInfo}`,
        {
          params: {
            ...filters2,
            page: currentPage2,
          },
        }
      );
      const infoData6 = infoRes6?.data?.content;
      setInfo6(infoData6);
    } catch (err) {
      console.log("Can't fetch student appointment history");
    }
  };

  useEffect(() => {
    if (selectedStudentInfo !== null) {
      fetchStudentInfo();
      fetchStudentInfo5();
      fetchStudentInfo6(filters2);
    }
  }, [selectedStudentInfo]);

  const applyFilters2 = () => {
    setCurrentPage2(1);
    const newFilters = {
      fromDate: dateFrom,
      toDate: dateTo,
      SortDirection: sortDirection2,
    };
    setFilters2(newFilters);
    fetchStudentInfo6(newFilters);
  };

  const cancelFilters2 = () => {
    setCurrentPage2(1);
    const resetFilters = {
      fromDate: "",
      toDate: "",
      SortDirection: "",
    };
    setDateFrom(resetFilters.fromDate);
    setDateTo(resetFilters.toDate);
    setSortDirection2(resetFilters.SortDirection);
    setFilters2(resetFilters);
    fetchStudentInfo6(resetFilters);
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

  const fetchAppointmentReport = async () => {
    try {
      const reportRes = await axiosJWT.get(
        `${BASE_URL}/appointments/report/${historyInfo?.id}`
      );
      const reportData = reportRes.data.content;
      setReport(reportData);
    } catch (err) {
      console.log("Can't fetch appointment report", err);
    }
  };

  useEffect(() => {
    if (historyInfo) {
      setReport(null);
      fetchAppointmentReport();
    }
  }, [historyInfo, selectedStudentInfo]);

  return (
    <Modal
      transparent={true}
      visible={openStudentInfo}
      animationType="slide"
      onRequestClose={() => setOpenStudentInfo(false)}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.1)",
        }}
      >
        <View
          style={{
            width: "100%",
            height: "90%",
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
              setSelectedStudentInfo(null),
              setInfo(null),
              setInfo2(null),
              setSelectedSemester4(null),
              setInfo5(null),
              setCourses(null),
              setSelectedCourse(null),
              setInfo4(null),
              setInfo6(null),
              setDateFrom(""),
              setDateTo(""),
              setCurrentPage2(1),
              setActiveTab(1),
              setOpenStudentInfo(false)
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
                  setActiveTab(3), setSelectedSemester4(semesters[0].name)
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
                  Problem Tags
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => (
                  setActiveTab(4), setSelectedSemester4(semesters[0].name)
                )}
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
                  Attendance Report
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => (
                  setActiveTab(5), setSelectedSemester4(semesters[0].name)
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
                  Mark Report
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab(6)}
                style={{
                  paddingVertical: 8,
                  marginRight: 20,
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
                  Academic Transcript
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab(7)}
                style={{
                  paddingVertical: 8,
                  borderBottomWidth: 2,
                  borderBottomColor:
                    activeTab === 7 ? "#F39300" : "transparent",
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: activeTab === 7 ? "bold" : "500",
                    color: activeTab === 7 ? "#F39300" : "#333",
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
                    alignItems: "center",
                  }}
                >
                  <View style={{ position: "relative", marginBottom: 12 }}>
                    <Image
                      source={{
                        uri: info.studentProfile.profile.avatarLink,
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
                        info.studentProfile.profile.gender == "MALE"
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
                        padding: 5,
                        borderRadius: 40,
                      }}
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 24,
                        fontWeight: "bold",
                        marginBottom: 4,
                      }}
                    >
                      {info.studentProfile.profile.fullName}
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        color: "gray",
                        marginBottom: 16,
                      }}
                    >
                      ID: {info?.studentProfile?.studentCode}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    backgroundColor: "white",
                    paddingVertical: 8,
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
                        {formatDate(info.studentProfile.profile.dateOfBirth)}
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
                      name="call"
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
                        Phone
                      </Text>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "bold",
                          opacity: 0.7,
                        }}
                      >
                        {info.studentProfile.profile.phoneNumber}
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
                        {info?.studentProfile?.department?.name} (
                        {info?.studentProfile?.department?.code})
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
                        {info?.studentProfile?.major?.name} (
                        {info?.studentProfile?.major?.code})
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
                        {info?.studentProfile?.specialization?.name || "N/A"}
                      </Text>
                    </View>
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
                      {info.counselingProfile.desiredCounselingFields || "N/A"}
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
            {activeTab === 3 && selectedSemester4 ? (
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
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "bold",
                        color: "#F39300",
                      }}
                    >
                      SEMESTER
                    </Text>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      {assessmentLoading && (
                        <ActivityIndicator
                          size={24}
                          color="#F39300"
                          animating
                        />
                      )}
                      <TouchableOpacity
                        style={{
                          backgroundColor: "white",
                          padding: 4,
                          borderRadius: 20,
                          marginLeft: 8,
                        }}
                        onPress={() => fetchGeneralAssessment()}
                      >
                        <Ionicons name="newspaper" size={24} color="#F39300" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {semesters.map((semester) => (
                      <TouchableOpacity
                        key={semester.id}
                        onPress={() => setSelectedSemester4(semester?.name)}
                        style={{
                          padding: 8,
                          marginRight: 8,
                          marginBottom: 8,
                          backgroundColor: "white",
                          borderRadius: 10,
                          borderWidth: 2,
                          borderColor:
                            selectedSemester4 === semester?.name
                              ? "#F39300"
                              : "black",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color:
                              selectedSemester4 === semester?.name
                                ? "#F39300"
                                : "black",
                            textAlign: "left",
                          }}
                        >
                          {semester?.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                <Modal
                  transparent={true}
                  visible={openAssessment}
                  animationType="slide"
                  onRequestClose={() => setOpenAssessment(false)}
                >
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "flex-end",
                      alignItems: "center",
                      backgroundColor: "rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <View
                      style={{
                        width: "100%",
                        height: "90%",
                        backgroundColor: "#f5f7fd",
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: "#F39300",
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          paddingVertical: 12,
                          paddingHorizontal: 20,
                          borderTopLeftRadius: 16,
                          borderTopRightRadius: 16,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 20,
                            fontWeight: "bold",
                            color: "white",
                          }}
                        >
                          General Assessment
                        </Text>
                        <TouchableOpacity
                          style={{
                            backgroundColor: "white",
                            padding: 4,
                            borderRadius: 20,
                          }}
                          onPress={() => (
                            setOpenAssessment(false), setAssessment(null)
                          )}
                        >
                          <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                      </View>
                      {assessment && (
                        <ScrollView showsVerticalScrollIndicator={false}>
                          <View
                            style={{
                              paddingHorizontal: 20,
                              paddingTop: 8,
                              paddingBottom: 20,
                              backgroundColor: "#f5f7fd",
                              borderRadius: 16,
                            }}
                          >
                            <Markdown>{assessment.message}</Markdown>
                          </View>
                        </ScrollView>
                      )}
                    </View>
                  </View>
                </Modal>
                {info2Loading ? (
                  <View
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      marginVertical: 38.5,
                    }}
                  >
                    <ActivityIndicator size={40} color="#F39300" animating />
                  </View>
                ) : info2 && Object.keys(info2).length > 0 ? (
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {Object.entries(info2).map(([subject, tags], index) => {
                      const combinedTags = [
                        ...tags.isNotExcluded,
                        ...tags.isExcluded,
                      ].reduce((acc, tag) => {
                        if (!acc[tag.category]) {
                          acc[tag.category] = [];
                        }
                        acc[tag.category].push(tag);
                        return acc;
                      }, {});
                      return (
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
                              color: "#F39300",
                              marginBottom: 8,
                            }}
                          >
                            {subject}
                          </Text>
                          {Object.entries(combinedTags).map(
                            ([category, tags]) => (
                              <View key={category}>
                                <Text
                                  style={{
                                    fontSize: 18,
                                    fontWeight: "bold",
                                    color: "#333",
                                    marginBottom: 8,
                                  }}
                                >
                                  {category}
                                </Text>
                                {tags.map((tag, tagIndex) => (
                                  <View
                                    key={tagIndex}
                                    style={{
                                      backgroundColor: tag.contained
                                        ? "#F39300"
                                        : tag.excluded
                                        ? "#f5f5f5"
                                        : "#e3e3e3",
                                      paddingHorizontal: 12,
                                      paddingVertical: 8,
                                      borderRadius: 20,
                                      marginBottom: 8,
                                    }}
                                  >
                                    <Text
                                      style={{
                                        fontSize: 16,
                                        color: tag.contained
                                          ? "white"
                                          : tag.excluded
                                          ? "gray"
                                          : "#333",
                                        fontWeight: tag.contained
                                          ? "bold"
                                          : "400",
                                      }}
                                    >
                                      {tag.problemTagName} x {tag.number}
                                    </Text>
                                  </View>
                                ))}
                              </View>
                            )
                          )}
                        </View>
                      );
                    })}
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
                    You don't have problem tags in this semester
                  </Text>
                )}
              </View>
            ) : activeTab === 3 ? (
              <></>
            ) : null}
            {activeTab === 4 && selectedSemester4 ? (
              <>
                <View style={{ flexDirection: "row", maxHeight: "32.5%" }}>
                  <View
                    style={{
                      flex: 0.6,
                      backgroundColor: "#fff",
                      borderRadius: 10,
                      padding: 12,
                      marginBottom: 8,
                      marginRight: 8,
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
                        SEMESTER
                      </Text>
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false}>
                      {semesters.map((semester) => (
                        <TouchableOpacity
                          key={semester.id}
                          onPress={() => setSelectedSemester4(semester?.name)}
                          style={{
                            flex: 1,
                            padding: 8,
                            marginBottom: 12,
                            backgroundColor: "white",
                            borderRadius: 10,
                            borderWidth: 2,
                            borderColor:
                              selectedSemester4 === semester?.name
                                ? "#F39300"
                                : "black",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "600",
                              color:
                                selectedSemester4 === semester?.name
                                  ? "#F39300"
                                  : "black",
                              textAlign: "left",
                            }}
                          >
                            {semester?.name}
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
                      marginBottom: 8,
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
                          You have no courses in this semester
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
                            paddingHorizontal: 12,
                            paddingVertical: 4,
                            backgroundColor: "#fdfdfd",
                            borderRadius: 10,
                            borderBottomWidth:
                              index == info4.length - 1 ? 0 : 2,
                            borderBottomColor: "lightgrey",
                          }}
                        >
                          <View style={{ flex: 0.1 }}>
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
                        Can't find attendance report because of no courses found
                        in this semester. Please find courses in another
                        semester
                      </Text>
                    )}
                  </ScrollView>
                </View>
              </>
            ) : activeTab === 4 ? (
              <Text
                style={{ fontStyle: "italic", color: "gray", opacity: 0.7 }}
              ></Text>
            ) : null}
            {activeTab === 5 && selectedSemester4 ? (
              <>
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
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "bold",
                        color: "#F39300",
                      }}
                    >
                      SEMESTER
                    </Text>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          color: "#333",
                        }}
                      >
                        GPA:{" "}
                        <Text style={{ color: "#F39300", fontWeight: "bold" }}>
                          {info3
                            ?.filter((subject) => subject.grade !== null)
                            ?.reduce(
                              (acc, subject, _, array) =>
                                acc + parseFloat(subject.grade) / array.length,
                              0
                            )
                            .toFixed(2) || "--"}
                        </Text>
                      </Text>
                    </View>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {semesters.map((semester) => (
                      <TouchableOpacity
                        key={semester.id}
                        onPress={() => setSelectedSemester4(semester?.name)}
                        style={{
                          padding: 8,
                          marginRight: 8,
                          marginBottom: 8,
                          backgroundColor: "white",
                          borderRadius: 10,
                          borderWidth: 2,
                          borderColor:
                            selectedSemester4 === semester?.name
                              ? "#F39300"
                              : "black",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color:
                              selectedSemester4 === semester?.name
                                ? "#F39300"
                                : "black",
                            textAlign: "left",
                          }}
                        >
                          {semester?.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                {info3Loading ? (
                  <View
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      marginVertical: 38.5,
                    }}
                  >
                    <ActivityIndicator size={40} color="#F39300" animating />
                  </View>
                ) : info3 && info3.length > 0 ? (
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {info3?.map((item, index) => (
                      <View
                        key={index}
                        style={{
                          backgroundColor: "white",
                          padding: 16,
                          borderRadius: 12,
                          marginBottom: 12,
                          elevation: 2,
                          shadowColor: "#000",
                          shadowOpacity: 0.1,
                          shadowRadius: 4,
                          shadowOffset: { width: 0, height: 2 },
                          borderWidth: 1,
                          borderColor: "#e3e3e3",
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
                          {item.subjectName}
                        </Text>
                        <Text
                          style={{
                            fontSize: 16,
                            color: "#333",
                            marginBottom: 4,
                          }}
                        >
                          <Text style={{ fontWeight: "bold" }}>Semester: </Text>
                          {item.semesterName || "N/A"}
                        </Text>
                        <Text
                          style={{
                            fontSize: 16,
                            color: "#333",
                            marginBottom: 4,
                          }}
                        >
                          <Text style={{ fontWeight: "bold" }}>
                            Start Date:{" "}
                          </Text>
                          {item.startDate || "--"}
                        </Text>
                        <Text
                          style={{
                            fontSize: 16,
                            color: "#333",
                            marginBottom: 4,
                          }}
                        >
                          <Text style={{ fontWeight: "bold" }}>
                            Total Slots:{" "}
                          </Text>
                          {item.totalSlot || "--"}
                        </Text>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "600",
                            color:
                              item.grade === null
                                ? "gray"
                                : item.grade < 5
                                ? "red"
                                : item.grade >= 5 && item.grade <= 8
                                ? "#F39300"
                                : item.grade > 8
                                ? "green"
                                : "#333",
                            marginBottom: 4,
                          }}
                        >
                          <Text style={{ fontWeight: "bold", color: "#333" }}>
                            Grade:{" "}
                          </Text>
                          {item.grade !== null ? item.grade : "--"}
                        </Text>
                        <Text
                          style={{
                            fontSize: 16,
                            color: "#333",
                          }}
                        >
                          <Text style={{ fontWeight: "bold" }}>Details: </Text>
                          {item.detais || "N/A"}
                        </Text>
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
                    You don't have mark report in this semester
                  </Text>
                )}
              </>
            ) : activeTab === 5 ? (
              <Text
                style={{ fontStyle: "italic", color: "gray", opacity: 0.7 }}
              ></Text>
            ) : null}
            {activeTab === 6 ? (
              info5Loading ? (
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    marginVertical: 38.5,
                  }}
                >
                  <ActivityIndicator size={40} color="#F39300" animating />
                </View>
              ) : info5 ? (
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
                        <Text style={{ color: "green", fontWeight: "bold" }}>
                          {
                            info5.filter(
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
                            info5.filter(
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
                        <Text style={{ color: "#F39300", fontWeight: "bold" }}>
                          {info5
                            .filter((subject) => subject.grade !== null)
                            .reduce(
                              (acc, subject, _, array) =>
                                acc + parseFloat(subject.grade) / array.length,
                              0
                            )
                            .toFixed(2)}
                        </Text>
                      </Text>
                    </View>
                  </View>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {[...new Set(info5.map((item) => item.term))].map(
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
                          {info5
                            .filter((subject) => subject.term === term)
                            .map((subject, index) => (
                              <View
                                key={index}
                                style={{
                                  paddingVertical: 12,
                                  marginBottom: 8,
                                  borderBottomWidth:
                                    index ==
                                    info5.filter(
                                      (subject) => subject.term === term
                                    ).length -
                                      1
                                      ? 0
                                      : 2,
                                  borderBottomColor: "lightgrey",
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 18,
                                    fontWeight: "600",
                                    marginBottom: 4,
                                  }}
                                >
                                  {subject.subjectCode} - {subject.subjectName}
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
                                          color:
                                            subject.grade === null
                                              ? "gray"
                                              : subject.grade < 5
                                              ? "red"
                                              : subject.grade >= 5 &&
                                                subject.grade <= 8
                                              ? "#F39300"
                                              : subject.grade > 8
                                              ? "green"
                                              : "#333",
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
            ) : activeTab === 6 ? (
              <></>
            ) : null}
            {activeTab === 7 && info6 ? (
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
                          paddingHorizontal: 12,
                          alignItems: "center",
                          backgroundColor: "white",
                          height: 40,
                          borderWidth: 1,
                          borderColor: "gray",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            opacity: 0.8,
                            flex: 1,
                          }}
                        >
                          {dateFrom !== "" ? dateFrom : "xxxx-xx-xx"}
                        </Text>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => setShowFromPicker(true)}
                        >
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
                        <Text
                          style={{
                            fontSize: 16,
                            opacity: 0.8,
                            flex: 1,
                          }}
                        >
                          {dateTo !== "" ? dateTo : "xxxx-xx-xx"}
                        </Text>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => setShowToPicker(true)}
                        >
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
                          onPress={() => setSortDirection2("ASC")}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <Ionicons
                            name={
                              sortDirection2 == "ASC"
                                ? "radio-button-on"
                                : "radio-button-off"
                            }
                            size={20}
                            color={sortDirection2 == "ASC" ? "#F39300" : "gray"}
                            style={{ marginRight: 4 }}
                          />
                          <Ionicons
                            name="arrow-up"
                            size={20}
                            style={{
                              color:
                                sortDirection2 == "ASC" ? "#F39300" : "black",
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
                          onPress={() => setSortDirection2("DESC")}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <Ionicons
                            name={
                              sortDirection2 == "DESC"
                                ? "radio-button-on"
                                : "radio-button-off"
                            }
                            size={20}
                            color={
                              sortDirection2 == "DESC" ? "#F39300" : "gray"
                            }
                            style={{ marginRight: 4 }}
                          />
                          <Ionicons
                            name="arrow-down"
                            size={20}
                            style={{
                              color:
                                sortDirection2 == "DESC" ? "#F39300" : "black",
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
                  {info6.data
                    .filter((item) => item.status === "ATTEND")
                    .map((item, index) => (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => (
                          setHistoryInfo(item), setOpenHistoryInfo(true)
                        )}
                        key={index}
                        style={{
                          backgroundColor: "#F39300",
                          borderRadius: 20,
                          marginBottom: 12,
                        }}
                      >
                        <View
                          style={{
                            backgroundColor: "#fff0e0",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            marginTop: 4,
                            marginHorizontal: 4,
                            borderTopLeftRadius: 18,
                            borderTopRightRadius: 18,
                          }}
                        >
                          <View style={{ maxWidth: "80%" }}>
                            <Text
                              style={{
                                fontSize: 18,
                                fontWeight: "bold",
                                color: "#F39300",
                              }}
                            >
                              {item.counselorInfo.profile.fullName}
                            </Text>
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: "400",
                                color: "#333",
                                marginTop: 2,
                              }}
                            >
                              {item?.counselorInfo?.major?.name ||
                                item?.counselorInfo?.expertise?.name}
                            </Text>
                          </View>
                          <Image
                            source={{
                              uri: item.counselorInfo.profile.avatarLink,
                            }}
                            style={{
                              backgroundColor: "white",
                              width: 50,
                              height: 50,
                              borderRadius: 40,
                              borderColor: "#F39300",
                              borderWidth: 2,
                            }}
                          />
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "stretch",
                            justifyContent: "space-between",
                            marginTop: 2,
                            marginHorizontal: 4,
                            marginBottom: 4,
                          }}
                        >
                          <View
                            style={{
                              flex: 0.5,
                              flexDirection: "row",
                              alignItems: "center",
                              paddingHorizontal: 12,
                              paddingVertical: 6,
                              backgroundColor: "white",
                              borderBottomLeftRadius: 18,
                            }}
                          >
                            <Ionicons
                              name="calendar-outline"
                              size={24}
                              color="#F39300"
                            />
                            <View style={{ marginLeft: 8 }}>
                              <Text
                                style={{
                                  fontSize: 16,
                                  color: "#333",
                                  fontWeight: "500",
                                }}
                              >
                                {item.startDateTime.split("T")[0]}
                              </Text>
                            </View>
                          </View>
                          <View
                            style={{
                              flex: 0.495,
                              flexDirection: "row",
                              alignItems: "center",
                              paddingHorizontal: 12,
                              paddingVertical: 6,
                              backgroundColor: "white",
                              borderBottomRightRadius: 18,
                            }}
                          >
                            <Ionicons
                              name="time-outline"
                              size={24}
                              color="#F39300"
                            />
                            <View style={{ marginLeft: 8 }}>
                              <Text
                                style={{
                                  fontSize: 16,
                                  color: "#333",
                                  fontWeight: "500",
                                }}
                              >
                                {item?.startDateTime?.split("T")[1].slice(0, 5)}{" "}
                                - {item?.endDateTime?.split("T")[1].slice(0, 5)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
                <Pagination
                  currentPage={currentPage2}
                  setCurrentPage={setCurrentPage2}
                  length={info6?.data?.length}
                  totalPages={info6?.totalPages}
                />
                <Modal
                  transparent={true}
                  visible={openHistoryInfo}
                  animationType="slide"
                  onRequestClose={() => setOpenHistoryInfo(false)}
                >
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "flex-end",
                      alignItems: "center",
                      backgroundColor: "rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <View
                      style={{
                        width: "100%",
                        height: "90%",
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
                            marginBottom: 20,
                            borderRadius: 20,
                            alignSelf: "flex-start",
                            alignItems: "flex-start",
                          }}
                          onPress={() => (
                            setHistoryInfo(""), setOpenHistoryInfo(false)
                          )}
                        >
                          <Ionicons name="chevron-back" size={28} />
                        </TouchableOpacity>
                        {historyInfo?.status == "ATTEND" &&
                          historyInfo?.counselorInfo?.id == userData?.id && (
                            <TouchableOpacity
                              style={{
                                backgroundColor: "white",
                                padding: 4,
                                marginHorizontal: 20,
                                marginTop: 16,
                                marginBottom: 20,
                                borderRadius: 10,
                                alignSelf: "flex-end",
                                alignItems: "flex-end",
                              }}
                              onPress={() => setOpenReport(true)}
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
                            marginHorizontal: 20,
                            backgroundColor: "#f5f7fd",
                          }}
                        >
                          <View
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
                                {historyInfo?.studentInfo?.profile?.fullName}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 20,
                                  fontWeight: "500",
                                  color: "#333",
                                  marginBottom: 2,
                                }}
                              >
                                {historyInfo?.studentInfo?.major?.name}
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
                                {historyInfo?.studentInfo?.profile?.phoneNumber}
                              </Text>
                            </View>
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
                              {historyInfo?.reason}
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
                                  .slice(0, 5)}{" "}
                                -{" "}
                                {historyInfo?.endDateTime
                                  ?.split("T")[1]
                                  .slice(0, 5)}
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
                                  {historyInfo?.meetingType}
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
                            </View> */}
                          </View>
                          {historyInfo?.appointmentFeedback !== null ? (
                            <View
                              style={{
                                marginBottom: 20,
                                borderRadius: 10,
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
                                marginBottom: 20,
                                borderRadius: 10,
                                backgroundColor: "white",
                                padding: 16,
                                elevation: 1,
                                borderWidth: 1.5,
                                borderColor: "#e3e3e3",
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
                <Modal
                  transparent={true}
                  visible={openReport}
                  animationType="slide"
                  onRequestClose={() => setOpenReport(false)}
                >
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "flex-end",
                      alignItems: "center",
                      backgroundColor: "rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <View
                      style={{
                        width: "100%",
                        height: report ? "98%" : "20%",
                        backgroundColor: "#f5f7fd",
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: "#F39300",
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          paddingVertical: 12,
                          paddingHorizontal: 20,
                          borderTopLeftRadius: 16,
                          borderTopRightRadius: 16,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 24,
                            fontWeight: "bold",
                            color: "white",
                          }}
                        >
                          Appointment Report
                        </Text>
                        <TouchableOpacity
                          style={{
                            backgroundColor: "white",
                            padding: 4,
                            borderRadius: 20,
                          }}
                          onPress={() => setOpenReport(false)}
                        >
                          <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                      </View>
                      {report ? (
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
                              borderTopLeftRadius: 10,
                              borderTopRightRadius: 10,
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
                              backgroundColor: "white",
                              padding: 8,
                              marginBottom: 16,
                              borderLeftWidth: 1.5,
                              borderRightWidth: 1.5,
                              borderBottomWidth: 1.5,
                              borderColor: "#e3e3e3",
                              borderBottomLeftRadius: 10,
                              borderBottomRightRadius: 10,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 16,
                                color: "#333",
                                marginBottom: 8,
                              }}
                            >
                              <Text style={{ fontWeight: "600" }}>• Type:</Text>
                              {"\n"}
                              {report.intervention.type}
                            </Text>
                            <Text
                              style={{
                                fontSize: 16,
                                color: "#333",
                                marginBottom: 8,
                              }}
                            >
                              <Text style={{ fontWeight: "600" }}>
                                • Description:
                              </Text>
                              {"\n"}
                              {report.intervention.description}
                            </Text>
                          </View>
                          <View
                            style={{
                              backgroundColor: "#F39300",
                              paddingHorizontal: 8,
                              paddingVertical: 6,
                              borderTopLeftRadius: 10,
                              borderTopRightRadius: 10,
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
                              backgroundColor: "white",
                              padding: 8,
                              marginBottom: 16,
                              borderLeftWidth: 1.5,
                              borderRightWidth: 1.5,
                              borderBottomWidth: 1.5,
                              borderColor: "#e3e3e3",
                              borderBottomLeftRadius: 10,
                              borderBottomRightRadius: 10,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 16,
                                color: "#333",
                                marginBottom: 8,
                              }}
                            >
                              <Text style={{ fontWeight: "600" }}>
                                • Specific Goal:
                              </Text>
                              {"\n"}
                              {report.consultationGoal.specificGoal}
                            </Text>
                            <Text
                              style={{
                                fontSize: 16,
                                color: "#333",
                                marginBottom: 8,
                              }}
                            >
                              <Text style={{ fontWeight: "600" }}>
                                • Reason:
                              </Text>
                              {"\n"}
                              {report.consultationGoal.reason}
                            </Text>
                          </View>
                          <View
                            style={{
                              backgroundColor: "#F39300",
                              paddingHorizontal: 8,
                              paddingVertical: 6,
                              borderTopLeftRadius: 10,
                              borderTopRightRadius: 10,
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
                              backgroundColor: "white",
                              padding: 8,
                              marginBottom: 16,
                              borderLeftWidth: 1.5,
                              borderRightWidth: 1.5,
                              borderBottomWidth: 1.5,
                              borderColor: "#e3e3e3",
                              borderBottomLeftRadius: 10,
                              borderBottomRightRadius: 10,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 16,
                                color: "#333",
                                marginBottom: 8,
                              }}
                            >
                              <Text style={{ fontWeight: "600" }}>
                                • Summary of Discussion:
                              </Text>
                              {"\n"}
                              {report.consultationContent.summaryOfDiscussion}
                            </Text>
                            <Text
                              style={{
                                fontSize: 16,
                                color: "#333",
                                marginBottom: 8,
                              }}
                            >
                              <Text style={{ fontWeight: "600" }}>
                                • Main Issues:
                              </Text>
                              {"\n"}
                              {report.consultationContent.mainIssues}
                            </Text>
                            <Text
                              style={{
                                fontSize: 16,
                                color: "#333",
                                marginBottom: 8,
                              }}
                            >
                              <Text style={{ fontWeight: "600" }}>
                                • Student Emotions:
                              </Text>
                              {"\n"}
                              {report.consultationContent.studentEmotions}
                            </Text>
                            <Text
                              style={{
                                fontSize: 16,
                                color: "#333",
                                marginBottom: 8,
                              }}
                            >
                              <Text style={{ fontWeight: "600" }}>
                                • Student Reactions:
                              </Text>
                              {"\n"}
                              {report.consultationContent.studentReactions}
                            </Text>
                          </View>
                          <View
                            style={{
                              backgroundColor: "#F39300",
                              paddingHorizontal: 8,
                              paddingVertical: 6,
                              borderTopLeftRadius: 10,
                              borderTopRightRadius: 10,
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
                              backgroundColor: "white",
                              padding: 8,
                              marginBottom: 16,
                              borderLeftWidth: 1.5,
                              borderRightWidth: 1.5,
                              borderBottomWidth: 1.5,
                              borderColor: "#e3e3e3",
                              borderBottomLeftRadius: 10,
                              borderBottomRightRadius: 10,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 16,
                                color: "#333",
                                marginBottom: 8,
                              }}
                            >
                              <Text style={{ fontWeight: "600" }}>
                                • Counselor Conclusion:
                              </Text>
                              {"\n"}
                              {
                                report.consultationConclusion
                                  .counselorConclusion
                              }
                            </Text>
                            <Text
                              style={{
                                fontSize: 16,
                                color: "#333",
                                marginBottom: 8,
                              }}
                            >
                              <Text style={{ fontWeight: "600" }}>
                                • Follow-up Needed:
                              </Text>
                              {"\n"}
                              {report.consultationConclusion.followUpNeeded
                                ? "Yes"
                                : "No"}
                            </Text>
                            {report.consultationConclusion.followUpNeeded && (
                              <Text
                                style={{
                                  fontSize: 16,
                                  color: "#333",
                                  marginBottom: 8,
                                }}
                              >
                                <Text style={{ fontWeight: "600" }}>
                                  • Follow-up Notes:
                                </Text>
                                {"\n"}
                                {report.consultationConclusion.followUpNotes}
                              </Text>
                            )}
                          </View>
                        </ScrollView>
                      ) : (
                        <View
                          style={{
                            flex: 1,
                            alignItems: "center",
                            marginTop: 20,
                          }}
                        >
                          <Text style={{ fontWeight: "bold", fontSize: 20 }}>
                            This appointment has no report yet
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </Modal>
              </>
            ) : activeTab === 7 ? (
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
  );
}
