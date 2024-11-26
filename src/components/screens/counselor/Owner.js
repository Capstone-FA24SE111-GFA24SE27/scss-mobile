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
  Image,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import axiosJWT, { BASE_URL } from "../../../config/Config";
import { AuthContext } from "../../context/AuthContext";
import { SocketContext } from "../../context/SocketContext";
import { QASkeleton } from "../../layout/Skeleton";
import { ChatContext } from "../../context/ChatContext";
import Pagination from "../../layout/Pagination";
import Toast from "react-native-toast-message";
import { FilterAccordion, FilterToggle } from "../../layout/FilterSection";

export default function QA() {
  const navigation = useNavigation();
  const { width, height } = Dimensions.get("screen");
  const { userData } = useContext(AuthContext);
  const {
    loading,
    setLoading,
    fetchData,
    questions,
    setQuestions,
    selectedQuestion,
    setSelectedQuestion,
    fetchQuestionCard,
    scrollViewRef2,
    filters,
    setFilters,
    keyword,
    setKeyword,
    debouncedKeyword,
    setDebouncedKeyword,
    currentPage,
    setCurrentPage,
    openChat,
    setOpenChat,
  } = useContext(ChatContext);
  const socket = useContext(SocketContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollViewRef = useRef(null);
  const [studentCode, setStudentCode] = useState(null);
  const [isClosed, setIsClosed] = useState("");
  const [sortDirection, setSortDirection] = useState("");
  const [openReject, setOpenReject] = useState(false);
  const [value, setValue] = useState("");
  const [openFlag, setOpenFlag] = useState(false);
  const [openAnswer, setOpenAnswer] = useState(false);
  const [openEditAnswer, setOpenEditAnswer] = useState(false);
  const [openInfo, setOpenInfo] = useState(false);
  // const [openChat, setOpenChat] = useState(false);
  const [info, setInfo] = useState({});
  const [content, setContent] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openCloseConfirm, setOpenCloseConfirm] = useState(false);
  const [openSucess, setOpenSuccess] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
      }
      fetchData(filters, { page: currentPage });
    }, [debouncedKeyword, filters, currentPage])
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 1000);
    return () => clearTimeout(timer);
  }, [keyword]);

  const applyFilters = () => {
    setLoading(true);
    setCurrentPage(1);
    const newFilters = {
      studentCode: studentCode,
      isClosed: isClosed,
      sortDirection: sortDirection,
    };
    setFilters(newFilters);
    fetchData(newFilters);
    setIsExpanded(false);
  };

  const cancelFilters = () => {
    setLoading(true);
    setCurrentPage(1);
    const resetFilters = {
      studentCode: null,
      isClosed: "",
      sortDirection: "",
    };
    setKeyword("");
    setStudentCode(resetFilters.studentCode);
    setIsClosed(resetFilters.isClosed);
    setSortDirection(resetFilters.sortDirection);
    setFilters(resetFilters);
    fetchData(resetFilters);
    setIsExpanded(false);
  };

  useEffect(() => {
    // if (debouncedKeyword) {
    fetchData();
    // }
  }, [debouncedKeyword]);

  useEffect(() => {
    setLoading(true);
    fetchData({ ...filters, page: currentPage });
    setTimeout(() => setLoading(false), 1500);
  }, [currentPage]);

  useEffect(() => {
    socket.on(`/user/${userData?.id}/question`, () => {
      fetchData(filters);
    });
  }, [filters]);

  const handleRejectQuestion = async (questionId) => {
    try {
      const response = await axiosJWT.post(
        `${BASE_URL}/question-cards/review/${questionId}/${value}?reviewReason=${content}`
        // {
        //   params: {
        //     reviewReason: content
        //   }
        // }
      );
      const data = await response.data;
      if (data && data.status == 200) {
        setOpenReject(false);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "This question has been rejected",
          onPress: () => {
            Toast.hide();
          }
        });
        setContent("");
        setInfo("");
        setOpenInfo(false);
        fetchData(filters, { page: currentPage });
      }
    } catch (error) {
      console.log("Can't reject this question", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Can't reject this question",
        onPress: () => {
          Toast.hide();
        }
      });
    }
  };

  const handleFlagQuestion = async (questionId) => {
    try {
      const response = await axiosJWT.post(
        `${BASE_URL}/question-cards/review/flag/${questionId}`,
        {
          reason: content,
        }
      );
      const data = await response.data;
      if (data && data.status == 200) {
        setOpenFlag(false);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "This question has been flagged",
          onPress: () => {
            Toast.hide();
          }
        });
        setContent("");
        setInfo("");
        setOpenInfo(false);
        fetchData(filters, { page: currentPage });
      }
    } catch (err) {
      console.log("Can't flag this question", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Can't flag this question",
      });
    }
  };

  const handleAnswerQuestion = async (questionId) => {
    try {
      const response = await axiosJWT.post(
        `${BASE_URL}/question-cards/answer/${questionId}`,
        {
          content: content,
        }
      );
      const data = await response.data;
      if (data && data.status == 200) {
        setOpenAnswer(false);
        setOpenConfirm(false);
        setContent("");
        setOpenSuccess(true);
        fetchData(filters, { page: currentPage });
      }
    } catch (error) {
      console.log("Can't answer this question", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Can't answer this question",
        onPress: () => {
          Toast.hide();
        }
      });
    }
  };

  const handleEditAnswer = async (questionId) => {
    try {
      const response = await axiosJWT.put(
        `${BASE_URL}/question-cards/answer/edit/${questionId}`,
        {
          content: content,
        }
      );
      const data = await response.data;
      if (data && data.status == 200) {
        setOpenEditAnswer(false);
        setContent("");
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Your answer has been updated",
          onPress: () => {
            Toast.hide();
          }
        });
        fetchData(filters, { page: currentPage });
      }
    } catch (err) {
      console.log("Can't edit question", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Can't edit question",
        onPress: () => {
          Toast.hide();
        }
      });
    }
  };

  const handleCloseQuestion = async (questionId) => {
    try {
      await axiosJWT.post(
        `${BASE_URL}/question-cards/counselor/close/${questionId}`
      );
      setOpenInfo(false);
      setOpenChat(false);
      setOpenCloseConfirm(false);
      setSelectedQuestion(null);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Your question has been closed",
        onPress: () => {
          Toast.hide();
        }
      });
      fetchData(filters);
    } catch (err) {
      console.log("Can't close question", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Can't close question",
        onPress: () => {
          Toast.hide();
        }
      });
    }
  };

  const handleSendMessage = async (chatSessionId) => {
    try {
      await axiosJWT.post(
        `${BASE_URL}/question-cards/send/${chatSessionId}/messages`,
        { content: content }
      );
      setContent("");
      if (scrollViewRef2.current) {
        setTimeout(() => {
          scrollViewRef2.current.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (err) {
      console.log("Can't send message to this chat", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Can't send message to this chat",
        onPress: () => {
          Toast.hide();
        }
      });
    }
  };

  const handleReadMessage = async (chatSessionId) => {
    try {
      await axiosJWT.put(
        `${BASE_URL}/question-cards/read/${chatSessionId}/messages`
      );
      fetchData(filters);
    } catch (err) {
      console.log("Can't read message in this chat", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Can't read message in this chat",
        onPress: () => {
          Toast.hide();
        }
      });
    }
  };

  const handleCloseSuccess = () => {
    setOpenSuccess(false);
    setContent("");
    setSelectedQuestion(null);
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
            // paddingTop: height * 0.095,
            paddingTop: height * 0.04,
            paddingBottom: height * 0.01,
            justifyContent: "flex-start",
          }}
        />
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
              {!loading ? (
                <Text
                  style={{
                    fontSize: 20,
                    opacity: 0.8,
                    color: "#333",
                    fontWeight: "bold",
                  }}
                >
                  {questions.totalElements} Questions{" "}
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
                    width: width * 0.4,
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
                  Student Code:
                </Text>
                <TextInput
                  value={studentCode}
                  onChangeText={(value) => setStudentCode(value)}
                  placeholder="Input Student Code"
                  style={{
                    backgroundColor: "white",
                    borderColor: "black",
                    height: 30,
                    flex: 1,
                    borderWidth: 1,
                    borderColor: "grey",
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    marginLeft: 16,
                  }}
                  placeholderTextColor="gray"
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
          </FilterAccordion>
        </>
        <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
          {loading ? (
            <>
              <QASkeleton />
              <QASkeleton />
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
                        alignItems: "flex-start",
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignSelf: "flex-start",
                          alignItems: "center",
                          marginBottom: 8,
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
                          {question.student.profile.fullName.length > 20
                            ? question.student.profile.fullName.substring(
                                0,
                                20
                              ) + "..."
                            : question.student.profile.fullName}
                        </Text>
                      </View>
                      {question.status === "PENDING" && (
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <TouchableOpacity
                            onPress={() => (
                              setOpenReject(true),
                              setSelectedQuestion(question),
                              setValue("REJECTED")
                            )}
                            style={{
                              marginRight: 8,
                              marginBottom: 8,
                              paddingHorizontal: 8,
                              paddingVertical: 2.5,
                              backgroundColor: "white",
                              borderRadius: 10,
                              borderWidth: 1.5,
                              borderColor: "red",
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <MaterialIcons
                              name="cancel"
                              size={20}
                              color="red"
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => (
                              setOpenFlag(true), setSelectedQuestion(question)
                            )}
                            style={{
                              marginBottom: 8,
                              paddingHorizontal: 8,
                              paddingVertical: 2.5,
                              backgroundColor: "white",
                              borderRadius: 10,
                              borderWidth: 1.5,
                              borderColor: "gray",
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <Ionicons name="flag" size={20} color="gray" />
                          </TouchableOpacity>
                        </View>
                      )}
                      {question?.chatSession?.messages?.some(
                        (message) =>
                          message.read === false &&
                          message.sender.role === "STUDENT"
                      ) && (
                        <View
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 20,
                            backgroundColor: "#F39300",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "bold",
                              color: "white",
                              opacity: 0.7,
                            }}
                          >
                            {question?.chatSession?.messages?.filter(
                              (message) =>
                                message.read === false &&
                                message.sender.role === "STUDENT"
                            )?.length || 0}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text
                      numberOfLines={2}
                      style={{
                        fontWeight: "bold",
                        fontSize: 18,
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
                            fontSize: 14,
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
                            borderColor: "gray",
                          }}
                        >
                          <Ionicons name="lock-closed" color="gray" size={20} />
                        </View>
                      )}
                    </View>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      {question.answer === null &&
                        question.status === "PENDING" && (
                          <TouchableOpacity
                            onPress={() => (
                              setOpenAnswer(true), setSelectedQuestion(question)
                            )}
                            style={{
                              backgroundColor: "#F39300",
                              borderRadius: 10,
                              paddingHorizontal: 12,
                              paddingVertical: 6,
                              marginRight: 8,
                              justifyContent: "center",
                            }}
                          >
                            <Text
                              style={{
                                fontWeight: "500",
                                color: "white",
                                fontSize: 16,
                              }}
                            >
                              Answer
                            </Text>
                          </TouchableOpacity>
                        )}
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
                  </View>
                  {question.answer !== null && (
                    <>
                      <View
                        style={{
                          borderTopWidth: 1,
                          borderColor: "lightgrey",
                          marginVertical: 12,
                        }}
                      />
                      <View
                        style={{
                          flexDirection: "row",
                          alignSelf: "flex-start",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 18,
                            color: "gray",
                            fontWeight: "500",
                          }}
                        >
                          Answered by{" "}
                          <Text style={{ fontWeight: "bold", color: "#333" }}>
                            You
                          </Text>
                        </Text>
                        {question.closed == false && (
                          <TouchableOpacity
                            style={{ marginLeft: 8 }}
                            onPress={() => (
                              setOpenEditAnswer(true),
                              setSelectedQuestion(question),
                              setContent(question.answer)
                            )}
                          >
                            <MaterialIcons
                              name="edit-note"
                              size={20}
                              color="#F39300"
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                      <View
                        style={{
                          alignSelf: "flex-start",
                          backgroundColor: "#ededed",
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 10,
                          borderWidth: 0.5,
                          borderColor: "lightgrey",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            color: "#333",
                          }}
                          numberOfLines={2}
                        >
                          {question.answer}
                        </Text>
                      </View>
                      <View
                        style={{
                          alignSelf: "flex-end",
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 16,
                        }}
                      >
                        {question.closed == false && (
                          <TouchableOpacity
                            onPress={() => (
                              setOpenCloseConfirm(true),
                              setSelectedQuestion(question)
                            )}
                            style={{
                              marginRight: 8,
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                              backgroundColor: "white",
                              borderRadius: 10,
                              flexDirection: "row",
                              alignItems: "center",
                              borderWidth: 1.5,
                              borderColor: "#F39300",
                            }}
                          >
                            <Ionicons
                              name="lock-closed"
                              size={16}
                              color="#F39300"
                            />
                            <Text
                              style={{
                                fontWeight: "500",
                                color: "#F39300",
                                fontSize: 16,
                                marginLeft: 4,
                              }}
                            >
                              Close
                            </Text>
                          </TouchableOpacity>
                        )}
                        {question.chatSession !== null && (
                          <TouchableOpacity
                            onPress={() => {
                              fetchQuestionCard(question.id);
                              setTimeout(() => {
                                handleReadMessage(question.chatSession.id);
                                setOpenChat(true);
                              }, 100);
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
                            <Ionicons name="chatbox" size={16} color="white" />
                            <Text
                              style={{
                                fontWeight: "500",
                                color: "white",
                                fontSize: 16,
                                marginLeft: 8,
                              }}
                            >
                              Chat
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </>
                  )}
                  {question.reviewReason !== null && (
                    <>
                      <View
                        style={{
                          borderTopWidth: 1,
                          borderColor: "lightgrey",
                          marginVertical: 12,
                        }}
                      />
                      <View
                        style={{
                          flexDirection: "row",
                          alignSelf: "flex-start",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            color: "gray",
                            fontWeight: "500",
                          }}
                        >
                          {question.status == "REJECTED"
                            ? "Rejected"
                            : "Flagged"}{" "}
                          by{" "}
                          <Text style={{ fontWeight: "bold", color: "#333" }}>
                            You
                          </Text>
                        </Text>
                      </View>
                      <View
                        style={{
                          alignSelf: "flex-start",
                          backgroundColor: "#ededed",
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 10,
                          borderWidth: 0.5,
                          borderColor: "lightgrey",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            color: "#333",
                          }}
                          numberOfLines={2}
                        >
                          {question.reviewReason}
                        </Text>
                      </View>
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
            length={questions?.data?.length}
            totalPages={questions?.totalPages}
          />
        )}
        <Modal
          transparent={true}
          visible={openReject}
          animationType="fade"
          onRequestClose={() => setOpenReject(false)}
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
                width: width * 0.9,
                padding: 20,
                backgroundColor: "white",
                borderRadius: 10,
                elevation: 10,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{ fontSize: 22, fontWeight: "bold", color: "#333" }}
                >
                  Reject This Question
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: "#ededed",
                    padding: 4,
                    borderRadius: 20,
                  }}
                  onPress={() => setOpenReject(false)}
                >
                  <Ionicons name="close" size={28} color="#333" />
                </TouchableOpacity>
              </View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#333",
                  marginBottom: 8,
                }}
              >
                Your reason:
              </Text>
              <TextInput
                placeholder="Type your reason here"
                placeholderTextColor="gray"
                keyboardType="default"
                multiline={true}
                numberOfLines={3}
                value={content}
                onChangeText={setContent}
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
              <TouchableOpacity
                disabled={content === ""}
                style={{
                  backgroundColor: content === "" ? "#ededed" : "#F39300",
                  marginTop: 12,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 10,
                  alignItems: "center",
                }}
                onPress={() => handleRejectQuestion(selectedQuestion?.id)}
              >
                <Text
                  style={{
                    color: content === "" ? "gray" : "white",
                    fontWeight: "bold",
                    fontSize: 20,
                  }}
                >
                  Send
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal
          transparent={true}
          visible={openFlag}
          animationType="fade"
          onRequestClose={() => setOpenFlag(false)}
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
                width: width * 0.9,
                padding: 20,
                backgroundColor: "white",
                borderRadius: 10,
                elevation: 10,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{ fontSize: 22, fontWeight: "bold", color: "#333" }}
                >
                  Flag This Question
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: "#ededed",
                    padding: 4,
                    borderRadius: 20,
                  }}
                  onPress={() => setOpenFlag(false)}
                >
                  <Ionicons name="close" size={28} color="#333" />
                </TouchableOpacity>
              </View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#333",
                  marginBottom: 8,
                }}
              >
                Your reason:
              </Text>
              <TextInput
                placeholder="Type your reason here"
                placeholderTextColor="gray"
                keyboardType="default"
                multiline={true}
                numberOfLines={3}
                value={content}
                onChangeText={setContent}
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
              <TouchableOpacity
                disabled={content === ""}
                style={{
                  backgroundColor: content === "" ? "#ededed" : "#F39300",
                  marginTop: 12,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 10,
                  alignItems: "center",
                }}
                onPress={() => handleFlagQuestion(selectedQuestion?.id)}
              >
                <Text
                  style={{
                    color: content === "" ? "gray" : "white",
                    fontWeight: "bold",
                    fontSize: 20,
                  }}
                >
                  Send
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal
          transparent={true}
          visible={openAnswer}
          animationType="fade"
          onRequestClose={() => setOpenAnswer(false)}
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
                width: width * 0.9,
                padding: 20,
                backgroundColor: "white",
                borderRadius: 10,
                elevation: 10,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{ fontSize: 22, fontWeight: "bold", color: "#333" }}
                >
                  Submit Answer
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: "#ededed",
                    padding: 4,
                    borderRadius: 20,
                  }}
                  onPress={() => setOpenAnswer(false)}
                >
                  <Ionicons name="close" size={28} color="#333" />
                </TouchableOpacity>
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: "#333",
                  marginBottom: 8,
                }}
              >
                Your answer:
              </Text>
              <TextInput
                placeholder="Type your answer here"
                placeholderTextColor="gray"
                keyboardType="default"
                multiline={true}
                numberOfLines={3}
                value={content}
                onChangeText={setContent}
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
              <TouchableOpacity
                disabled={content === ""}
                style={{
                  backgroundColor: content === "" ? "#ededed" : "#F39300",
                  marginTop: 12,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 10,
                  alignItems: "center",
                }}
                onPress={() => setOpenConfirm(true)}
              >
                <Text
                  style={{
                    color: content === "" ? "gray" : "white",
                    fontWeight: "bold",
                    fontSize: 20,
                  }}
                >
                  Send
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal
          transparent={true}
          visible={openEditAnswer}
          animationType="fade"
          onRequestClose={() => setOpenEditAnswer(false)}
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
                width: width * 0.9,
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
                }}
              >
                Edit Answer
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  marginBottom: 8,
                }}
              >
                Your answer
              </Text>
              <TextInput
                placeholder="Type your answer here"
                value={content}
                onChangeText={setContent}
                style={{
                  borderColor: "#ccc",
                  borderWidth: 1,
                  borderRadius: 8,
                  padding: 12,
                  height: 100,
                  backgroundColor: "#fff",
                  fontSize: 16,
                  marginVertical: 12,
                  textAlignVertical: "top",
                }}
                multiline
              />
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
                  onPress={() => (setOpenEditAnswer(false), setContent(""))}
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
                  onPress={() => handleEditAnswer(selectedQuestion?.id)}
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
                Send Answer Confirmation
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  marginBottom: 30,
                  textAlign: "center",
                }}
              >
                Are you sure you want to send answer to this question?
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
                  onPress={() => handleAnswerQuestion(selectedQuestion?.id)}
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
          visible={openSucess}
          animationType="fade"
          onRequestClose={handleCloseSuccess}
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
                width: width * 0.9,
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
                <Ionicons name="checkmark-circle" size={80} color="#F39300" />
                <Text
                  style={{
                    color: "#F39300",
                    fontSize: 30,
                    fontWeight: "bold",
                  }}
                >
                  Success!
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 16,
                  textAlign: "center",
                  marginBottom: 20,
                }}
              >
                Your answer has been sent successfully!
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: "#F39300",
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 30,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={handleCloseSuccess}
                activeOpacity={0.8}
              >
                <Text
                  style={{
                    fontSize: 18,
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
                        <View style={{ position: "relative" }}>
                          <Image
                            source={{
                              uri: info?.student?.profile?.avatarLink,
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
                  {(info.status == "PENDING" || info.status == "VERIFIED") && (
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
                            fontSize: 18,
                            fontStyle: "italic",
                            fontWeight: "600",
                            color: "gray",
                            opacity: 0.7,
                          }}
                        >
                          You have not answered yet
                        </Text>
                      )}
                    </View>
                  )}
                  {(info.status == "REJECTED" || info.status == "FLAGGED") && (
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
                        Your Reason
                      </Text>
                      {info?.reviewReason !== null && (
                        <Text
                          style={{
                            fontSize: 20,
                            color: "#333",
                            fontWeight: "500",
                            opacity: 0.7,
                          }}
                        >
                          {info?.reviewReason}
                        </Text>
                      )}
                    </View>
                  )}
                  {info.status == "PENDING" && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => (
                          setOpenReject(true),
                          setSelectedQuestion(info),
                          setValue("REJECTED")
                        )}
                        style={{
                          width: "49%",
                          marginRight: 8,
                          marginBottom: 8,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          backgroundColor: "white",
                          borderRadius: 10,
                          borderWidth: 1.5,
                          borderColor: "red",
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <MaterialIcons name="cancel" size={20} color="red" />
                        <Text
                          style={{
                            fontWeight: "500",
                            color: "red",
                            fontSize: 20,
                            marginLeft: 4,
                          }}
                        >
                          Cancel
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => (
                          setOpenFlag(true), setSelectedQuestion(info)
                        )}
                        style={{
                          width: "49%",
                          marginBottom: 8,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          backgroundColor: "white",
                          borderRadius: 10,
                          borderWidth: 1.5,
                          borderColor: "gray",
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Ionicons name="flag" size={20} color="gray" />
                        <Text
                          style={{
                            fontWeight: "500",
                            color: "gray",
                            fontSize: 20,
                            marginLeft: 4,
                          }}
                        >
                          Flag
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {info?.answer !== null && info?.closed == false && (
                    <TouchableOpacity
                      onPress={() => (
                        setOpenCloseConfirm(true), setSelectedQuestion(info)
                      )}
                      style={{
                        marginBottom: 8,
                        paddingHorizontal: 8,
                        paddingVertical: 8,
                        backgroundColor: "white",
                        borderRadius: 10,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 1.5,
                        borderColor: "#F39300",
                      }}
                    >
                      <Ionicons name="lock-closed" size={20} color="#F39300" />
                      <Text
                        style={{
                          fontWeight: "500",
                          color: "#F39300",
                          fontSize: 20,
                          marginLeft: 8,
                        }}
                      >
                        Close Question
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
        <Modal
          transparent={true}
          visible={openCloseConfirm}
          animationType="fade"
          onRequestClose={() => setOpenCloseConfirm(false)}
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
                width: width * 0.9,
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
                Close Question Confirmation
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  marginBottom: 30,
                  textAlign: "center",
                }}
              >
                Are you sure you want to close this question? You can't undo the
                change
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
                  onPress={() => setOpenCloseConfirm(false)}
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
                  onPress={() => handleCloseQuestion(selectedQuestion?.id)}
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
          visible={openChat}
          onRequestClose={() => setOpenChat(false)}
          onShow={() => {
            if (scrollViewRef2.current) {
              setTimeout(() => {
                scrollViewRef2.current.scrollToEnd({ animated: false });
              }, 100);
            }
          }}
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
                paddingHorizontal: 20,
                paddingVertical: 20,
              }}
            >
              {selectedQuestion && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 20,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => handleOpenInfo(selectedQuestion)}
                    style={{
                      backgroundColor: "#ededed",
                      flexDirection: "row",
                      alignSelf: "flex-start",
                      alignItems: "center",
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 10,
                    }}
                  >
                    <Image
                      source={{
                        uri: selectedQuestion?.student?.profile?.avatarLink,
                      }}
                      style={{ width: 50, height: 50, borderRadius: 40 }}
                    />
                    <View
                      style={{
                        flexDirection: "column",
                        alignSelf: "flex-start",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "bold",
                          opacity: 0.5,
                          marginLeft: 8,
                        }}
                      >
                        Now chatting
                      </Text>
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: "bold",
                          marginLeft: 8,
                        }}
                      >
                        {selectedQuestion?.student?.profile?.fullName?.length >
                        24
                          ? selectedQuestion?.student?.profile?.fullName.substring(
                              0,
                              24
                            ) + "..."
                          : selectedQuestion?.student?.profile?.fullName}
                      </Text>
                    </View>
                    <View style={{ marginLeft: 12 }}>
                      <Ionicons name="chevron-down" size={20} color="#F39300" />
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#ededed",
                      padding: 4,
                      borderRadius: 20,
                      alignSelf: "flex-start",
                      marginTop: -4,
                    }}
                    onPress={() => (
                      setOpenChat(false),
                      setContent(""),
                      setSelectedQuestion(null)
                    )}
                  >
                    <Ionicons name="close" size={28} />
                  </TouchableOpacity>
                </View>
              )}
              <ScrollView
                ref={scrollViewRef2}
                style={{ marginVertical: 8 }}
                showsVerticalScrollIndicator={false}
              >
                {selectedQuestion?.chatSession?.messages?.map((chat, index) => {
                  const isFirstMessageOfSender =
                    index === 0 ||
                    selectedQuestion.chatSession.messages[index - 1]?.sender
                      .role !== chat.sender.role;
                  const isConsecutiveMessage =
                    index > 0 &&
                    selectedQuestion.chatSession.messages[index - 1]?.sender
                      .role === chat.sender.role;
                  return (
                    <View
                      key={chat.id}
                      style={{
                        flexDirection:
                          chat.sender.role === "STUDENT"
                            ? "row"
                            : "row-reverse",
                        alignItems: "flex-start",
                        marginTop: isConsecutiveMessage ? 4 : 16,
                      }}
                    >
                      {chat.sender.role === "STUDENT" &&
                        isFirstMessageOfSender && (
                          <Image
                            source={{ uri: chat.sender.profile.avatarLink }}
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 20,
                              marginRight: 10,
                            }}
                          />
                        )}

                      <View
                        style={{
                          minWidth: "25%",
                          maxWidth: "85%",
                          backgroundColor:
                            chat.sender.role === "STUDENT"
                              ? "white"
                              : "#F39300",
                          padding: 12,
                          marginLeft:
                            chat.sender.role === "STUDENT" &&
                            !isFirstMessageOfSender
                              ? 50
                              : 0,
                          borderRadius: 10,
                          elevation: 1,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: "400",
                            color:
                              chat.sender.role === "STUDENT"
                                ? "black"
                                : "white",
                          }}
                        >
                          {chat.content}
                        </Text>
                        <Text
                          style={{
                            marginTop: 12,
                            fontSize: 16,
                            fontWeight: "400",
                            color:
                              chat.sender.role === "STUDENT" ? "gray" : "white",
                          }}
                        >
                          {chat.sentAt.split("T")[1].split(":")[0] +
                            ":" +
                            chat.sentAt.split("T")[1].split(":")[1]}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
              {selectedQuestion?.closed == true ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 8,
                    backgroundColor: "#ededed",
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: "lightgrey",
                  }}
                >
                  <Text
                    style={{
                      flex: 1,
                      textAlign: "center",
                      fontSize: 18,
                      fontWeight: "500",
                      color: "#333",
                      lineHeight: 24,
                      opacity: 0.8,
                    }}
                  >
                    You can't continue this chat{"\n"}This question is closed
                  </Text>
                </View>
              ) : (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#e3e3e3",
                    marginTop: 12,
                    padding: 12,
                    borderRadius: 10,
                  }}
                >
                  <TextInput
                    placeholder="Send a message"
                    value={content}
                    onChangeText={(value) => setContent(value)}
                    style={{ flex: 1, paddingRight: 8, fontSize: 18 }}
                  />
                  <TouchableOpacity
                    disabled={content.trim() === ""}
                    onPress={() => {
                      handleSendMessage(selectedQuestion.chatSession.id);
                    }}
                  >
                    <Ionicons
                      name="send"
                      size={20}
                      color={content.trim() === "" ? "gray" : "#F39300"}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}
