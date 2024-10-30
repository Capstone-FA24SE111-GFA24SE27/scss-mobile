import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Dimensions,
  Animated,
  Platform,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axiosJWT, { BASE_URL } from "../../../config/Config";
import { AuthContext } from "../../context/AuthContext";
import { QASkeleton } from "../../layout/Skeleton";

export default function QA() {
  const navigation = useNavigation();
  const { width, height } = Dimensions.get("screen");
  const [loading, setLoading] = useState(true);
  const { userData } = useContext(AuthContext);
  const scrollViewRef = useRef(null);
  const [questions, setQuestions] = useState([]);
  const [filters, setFilters] = useState({
    isClosed: "",
    studentCode: null,
    sortDirection: "",
  });
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [isClosed, setIsClosed] = useState("");
  const [studentCode, setStudentCode] = useState(null);
  const [sortDirection, setSortDirection] = useState("");
  const [openInfo, setOpenInfo] = useState(false);
  const [info, setInfo] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

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
      if (userData.role === "ACADEMIC_COUNSELOR") {
        const questionsRes = await axiosJWT.get(
          `${BASE_URL}/question-cards/library/academic-counselor/filter`,
          {
            params: {
              keyword: debouncedKeyword,
              ...filters,
              page: currentPage,
            },
          }
        );
        const questionsData = questionsRes?.data?.content || [];
        setQuestions(questionsData);
      }
      if (userData.role === "NON_ACADEMIC_COUNSELOR") {
        const questionsRes = await axiosJWT.get(
          `${BASE_URL}/question-cards/library/non-academic-counselor/filter`,
          {
            params: {
              keyword: debouncedKeyword,
              ...filters,
              page: currentPage,
            },
          }
        );
        const questionsData = questionsRes?.data?.content || [];
        setQuestions(questionsData);
      }
      setLoading(false);
      console.log(questions);
    } catch (err) {
      console.log(err);
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
      isClosed: isClosed,
      studentCode: studentCode,
      sortDirection: sortDirection,
    };
    setFilters(newFilters);
    fetchData(newFilters);
  };

  const cancelFilters = () => {
    const resetFilters = {
      isClosed: "",
      studentCode: null,
      sortDirection: "",
    };
    setKeyword("");
    setIsClosed(resetFilters.isClosed);
    setStudentCode(resetFilters.studentCode);
    setSortDirection(resetFilters.sortDirection);
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

  const handleTakenQuestion = async () => {
    try {
      const response = await axiosJWT.post(
        `${BASE_URL}/question-cards/counselor/take/${selectedQuestion.id}`
      );
      const data = await response.data;
      if (data && data.status == 200) {
        setOpenConfirm(false);
        fetchData(filters, { page: currentPage });
      }
    } catch (error) {
      console.error("Can't take question", error);
    }
  };

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
      <View
        style={{ backgroundColor: "#f5f7fd", flex: 1, paddingHorizontal: 20 }}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "row",
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
                placeholder="Search Question List"
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
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ alignItems: "flex-start" }}>
                <Text
                  style={{
                    fontSize: 24,
                    opacity: 0.8,
                    color: "#333",
                    fontWeight: "600",
                  }}
                >
                  {questions.totalElements} Questions found
                </Text>
              </View>
              <View
                style={{
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
                        minWidth: 54,
                      }}
                    >
                      Student Code:
                    </Text>
                    <View style={{ flexDirection: "row" }}>
                      <TextInput
                        value={studentCode}
                        onChangeText={(value) => setStudentCode(value)}
                        placeholder="Input Student Code"
                        style={{
                          backgroundColor: "white",
                          borderColor: "black",
                          flex: 0.75,
                          height: 30,
                          borderWidth: 1,
                          borderColor: "grey",
                          borderRadius: 10,
                          paddingHorizontal: 12,
                          marginLeft: 8,
                        }}
                        placeholderTextColor="gray"
                      />
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
                        minWidth: 54,
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
                        minWidth: 54,
                      }}
                    >
                      Closed:
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
                          onPress={() => setIsClosed(true)}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <Ionicons
                            name={
                              isClosed === true
                                ? "radio-button-on"
                                : "radio-button-off"
                            }
                            size={20}
                            color={isClosed === true ? "#F39300" : "gray"}
                            style={{ marginRight: 4 }}
                          />
                          <Ionicons
                            name="checkmark"
                            size={20}
                            style={{
                              color: isClosed === true ? "#F39300" : "black",
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
                          onPress={() => setIsClosed(false)}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <Ionicons
                            name={
                              isClosed === false
                                ? "radio-button-on"
                                : "radio-button-off"
                            }
                            size={20}
                            color={isClosed === false ? "#F39300" : "gray"}
                            style={{ marginRight: 4 }}
                          />
                          <Ionicons
                            name="close"
                            size={20}
                            style={{
                              color: isClosed === false ? "#F39300" : "black",
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
          </>
        )}
        <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
          {loading ? (
            <>
              <QASkeleton />
              <QASkeleton />
              <QASkeleton />
              <QASkeleton />
            </>
          ) : (
            questions?.data?.map((question) => (
              <View key={question.id}>
                <View
                  style={{
                    paddingVertical: 16,
                    paddingHorizontal: 12,
                    backgroundColor: "white",
                    marginVertical: 8,
                    borderRadius: 20,
                    borderWidth: 1.5,
                    borderColor: "#e3e3e3",
                  }}
                >
                  <View style={{ marginBottom: 16 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignSelf: "flex-start",
                          alignItems: "center",
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          backgroundColor: "#ededed",
                          borderRadius: 10,
                        }}
                      >
                        <Image
                          source={{
                            uri: question.student.profile.avatarLink,
                          }}
                          style={{ width: 30, height: 30 }}
                        />
                        <Text
                          style={{
                            fontWeight: "600",
                            fontSize: 16,
                            color: "#333",
                            marginLeft: 8,
                          }}
                        >
                          {question.student.profile.fullName}
                        </Text>
                      </View>
                      <TouchableOpacity
                        hitSlop={10}
                        onPress={() => handleOpenInfo(question)}
                        style={{
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Ionicons
                          name="ellipsis-vertical"
                          size={24}
                          color="#F39300"
                        />
                      </TouchableOpacity>
                    </View>
                    <Text
                      numberOfLines={2}
                      style={{
                        fontWeight: "bold",
                        fontSize: 20,
                        marginLeft: 4,
                      }}
                    >
                      {question.content}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <View
                        style={{
                          alignItems: "center",
                          justifyContent: "center",
                          flexDirection: "row",
                          paddingVertical: 4,
                          paddingHorizontal: 8,
                          borderRadius: 20,
                          borderWidth: 1.5,
                          borderColor:
                            question.status === "VERIFIED"
                              ? "green"
                              : question.status === "PENDING"
                              ? "#F39300"
                              : question.status === "REJECTED"
                              ? "red"
                              : question.status === "FLAGGED"
                              ? "gray"
                              : "#e3e3e3",
                        }}
                      >
                        <Ionicons
                          name={
                            question.status === "VERIFIED"
                              ? "checkmark-circle"
                              : question.status === "PENDING"
                              ? "time-outline"
                              : question.status === "REJECTED"
                              ? "close-circle"
                              : question.status === "FLAGGED"
                              ? "flag-outline"
                              : "help"
                          }
                          color={
                            question.status === "VERIFIED"
                              ? "green"
                              : question.status === "PENDING"
                              ? "#F39300"
                              : question.status === "REJECTED"
                              ? "red"
                              : question.status === "FLAGGED"
                              ? "gray"
                              : "#e3e3e3"
                          }
                          size={20}
                        />
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "600",
                            marginLeft: 4,
                            color:
                              question.status === "VERIFIED"
                                ? "green"
                                : question.status === "PENDING"
                                ? "#F39300"
                                : question.status === "REJECTED"
                                ? "red"
                                : question.status === "FLAGGED"
                                ? "gray"
                                : "#e3e3e3",
                          }}
                        >
                          {question.status}
                        </Text>
                      </View>
                      {question.closed == true && (
                        <View
                          style={{
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "row",
                            paddingVertical: 4,
                            paddingHorizontal: 8,
                            marginLeft: 8,
                            borderRadius: 20,
                            borderWidth: 1.5,
                            borderColor: "black",
                          }}
                        >
                          <Ionicons
                            name="lock-closed"
                            color="black"
                            size={20}
                          />
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "600",
                              marginLeft: 4,
                            }}
                          >
                            Closed
                          </Text>
                        </View>
                      )}
                    </View>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      {question.taken === false && (
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedQuestion(question);
                            setOpenConfirm(true);
                          }}
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
                          <Ionicons name="checkmark" size={20} color="white" />
                          <Text
                            style={{
                              fontWeight: "500",
                              color: "white",
                              fontSize: 16,
                              marginLeft: 8,
                            }}
                          >
                            Take
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
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
                {questions?.data?.length != 0 ? currentPage : 0} /{" "}
                {questions.totalPages}
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
                  questions.totalPages == 0 ||
                  currentPage >= questions.totalPages
                    ? "#ccc"
                    : "#F39300",
                opacity:
                  questions.totalPages == 0 ||
                  currentPage >= questions.totalPages
                    ? 0.5
                    : 1,
              }}
              onPress={() => setCurrentPage(currentPage + 1)}
              disabled={
                questions.totalPages == 0 || currentPage >= questions.totalPages
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
                  questions.totalPages == 0 ||
                  currentPage >= questions.totalPages
                    ? "#ccc"
                    : "#F39300",
                opacity:
                  questions.totalPages == 0 ||
                  currentPage >= questions.totalPages
                    ? 0.5
                    : 1,
              }}
              onPress={() => setCurrentPage(questions.totalPages)}
              disabled={
                questions.totalPages == 0 || currentPage >= questions.totalPages
              }
            >
              <Text style={{ color: "#333", fontSize: 18, fontWeight: "600" }}>
                {">>"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <Modal
          animationType="slide"
          transparent={true}
          visible={openConfirm}
          onRequestClose={() => setOpenConfirm(false)}
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
                  marginBottom: 10,
                  textAlign: "center",
                }}
              >
                Taking Question Confirmation
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  marginBottom: 30,
                  textAlign: "center",
                }}
              >
                Are you sure you want to take this question? Only you can answer
                and chat with the student through this question
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
                  onPress={() => setOpenConfirm(false)}
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
                  onPress={handleTakenQuestion}
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
          animationType="slide"
          transparent={true}
          visible={openInfo}
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
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View style={{ flex: 1 }} />
                <View style={{ flex: 2, alignItems: "center" }}>
                  <Text style={{ fontWeight: "bold", fontSize: 24 }}>
                    Quesion Info
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#ededed",
                      padding: 4,
                      marginHorizontal: 20,
                      marginTop: 16,
                      marginBottom: 8,
                      borderRadius: 20,
                      alignSelf: "flex-end",
                      alignItems: "flex-end",
                    }}
                    onPress={handleCloseInfo}
                  >
                    <Ionicons name="close" size={28} />
                  </TouchableOpacity>
                </View>
              </View>
              <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
              >
                <View
                  style={{
                    padding: 20,
                    backgroundColor: "#f5f7fd",
                    borderRadius: 16,
                  }}
                >
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
                      Question
                    </Text>
                    <Text
                      style={{
                        fontSize: 20,
                        color: "#333",
                        fontWeight: "500",
                        opacity: 0.7,
                      }}
                    >
                      {info?.content}
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
                      Questioned by
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginVertical: 12,
                      }}
                    >
                      <View style={{ width: "40%" }}>
                        <Image
                          source={{
                            uri: info?.student?.profile?.avatarLink,
                          }}
                          style={{
                            width: 120,
                            height: 120,
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
                          {info?.student?.specialization?.name ||
                            info?.student?.expertise?.name}
                        </Text>
                        <Text
                          style={{
                            fontSize: 16,
                            color: "grey",
                            marginBottom: 2,
                          }}
                        >
                          Email: {info?.student?.email}
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
                      Your Answer
                    </Text>
                    {info?.answer !== null ? (
                      <Text
                        style={{
                          fontSize: 20,
                          color: "#333",
                          fontWeight: "500",
                          opacity: 0.7,
                        }}
                      >
                        {info?.answer}
                      </Text>
                    ) : (
                      <Text
                        style={{
                          fontSize: 20,
                          color: "#333",
                          fontWeight: "500",
                          opacity: 0.7,
                        }}
                      >
                        There's no answer yet
                      </Text>
                    )}
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
