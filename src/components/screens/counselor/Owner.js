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
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import axiosJWT, { BASE_URL } from "../../../config/Config";
import { AuthContext } from "../../context/AuthContext";
import { SocketContext } from "../../context/SocketContext";
import { QASkeleton } from "../../layout/Skeleton";
import { ChatContext } from "../../context/ChatContext";

export default function QA() {
  const navigation = useNavigation();
  const { width, height } = Dimensions.get("screen");
  const [loading, setLoading] = useState(true);
  const { userData } = useContext(AuthContext);
  const {
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
  const scrollViewRef = useRef(null);
  const [isClosed, setIsClosed] = useState("");
  const [sortDirection, setSortDirection] = useState("");
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
    const newFilters = {
      isClosed: isClosed,
      sortDirection: sortDirection,
    };
    setFilters(newFilters);
    fetchData(newFilters);
  };

  const cancelFilters = () => {
    const resetFilters = {
      isClosed: "",
      sortDirection: "",
    };
    setKeyword("");
    setIsClosed(resetFilters.isClosed);
    setSortDirection(resetFilters.sortDirection);
    setFilters(resetFilters);
    fetchData(resetFilters);
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
    socket.on(`/user/${userData?.id}/private/notification`, () => {
      fetchData(filters);
    });
  }, [filters]);

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
      console.log(err);
    }
  };

  const handleCloseQuestion = async (questionId) => {
    try {
      await axiosJWT.post(
        `${BASE_URL}/question-cards/counselor/close/${questionId}`
      );
      fetchData(filters);
      setOpenInfo(false);
      setOpenChat(false);
      setOpenCloseConfirm(false);
      setSelectedQuestion(null);
    } catch (err) {
      console.log(err);
    }
  };

  const handleReadMessage = async (chatSessionId) => {
    try {
      await axiosJWT.put(
        `${BASE_URL}/question-cards/read/${chatSessionId}/messages`
      );
      fetchData(filters);
    } catch (err) {
      console.log(err);
    }
  };

  const handleOpenConfirm = () => {
    setOpenConfirm(true);
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
        handleCloseConfirm();
        setContent("");
        setOpenSuccess(true);
        fetchData(filters, { page: currentPage });
      }
    } catch (error) {
      console.error("Can't create question", error);
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
        fetchData(filters, { page: currentPage });
      }
    } catch (error) {
      console.error("Can't edit answer", error);
    }
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
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
                    color: "black",
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
                  flexDirection: "row",
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
                        color: "black",
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
                        color: "black",
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
                            color: "black",
                            marginLeft: 8,
                          }}
                        >
                          {question.student.profile.fullName}
                        </Text>
                      </View>
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
                            borderColor: "gray",
                          }}
                        >
                          <Ionicons
                            name="lock-closed"
                            color="gray"
                            size={20}
                          />
                        </View>
                      )}
                    </View>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      {question.answer === null && (
                        <TouchableOpacity
                          onPress={() => (
                            setOpenAnswer(true), setSelectedQuestion(question)
                          )}
                          style={{
                            backgroundColor: "#F39300",
                            borderRadius: 10,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
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
                          <Text style={{ fontWeight: "bold", color: "black" }}>
                            You
                          </Text>
                        </Text>
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
                      </View>
                      <View
                        style={{
                          alignSelf: "flex-start",
                          backgroundColor: "#ededed",
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 16,
                          borderWidth: 0.5,
                          borderColor: "lightgrey",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            color: "black",
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
                              marginBottom: 8,
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
                        <TouchableOpacity
                          disabled={question.close == true}
                          onPress={() => {
                            fetchQuestionCard(question.id);
                            setTimeout(() => {
                              handleReadMessage(question.chatSession.id);
                              setOpenChat(true);
                            }, 100);
                          }}
                          style={{
                            marginBottom: 8,
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
                      </View>
                    </>
                  )}
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
              <Text style={{ color: "black", fontSize: 18, fontWeight: "600" }}>
                {">>"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <Modal
          animationType="slide"
          transparent={true}
          visible={openAnswer}
          onRequestClose={() => setOpenAnswer(false)}
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
                height: "35%",
                backgroundColor: "#f5f7fd",
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                padding: 20,
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
              <Text style={{ fontSize: 16, fontWeight: "bold", color: "#333" }}>
                Your answer:
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
              <TouchableOpacity
                disabled={content === ""}
                style={{
                  backgroundColor: content === "" ? "#ededed" : "#F39300",
                  marginTop: 8,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 10,
                  alignItems: "center",
                }}
                onPress={handleOpenConfirm}
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
                      color: "black",
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
          onRequestClose={handleCloseConfirm}
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
                  onPress={handleCloseConfirm}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      color: "black",
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
                        color: "black",
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
                            color: "black",
                            marginBottom: 4,
                          }}
                        >
                          {info?.student?.profile?.fullName}
                        </Text>
                        <Text
                          style={{
                            fontSize: 20,
                            fontWeight: "500",
                            color: "black",
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
                          color: "black",
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
                          color: "black",
                          fontWeight: "500",
                          opacity: 0.7,
                        }}
                      >
                        There's no answer yet
                      </Text>
                    )}
                  </View>
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
                  onPress={() => (
                    setOpenCloseConfirm(false), setSelectedQuestion(null)
                  )}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      color: "black",
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
                        {selectedQuestion?.student?.profile?.fullName
                          ?.length > 24
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
                {/* {selectedQuestion?.chatSession?.messages?.map((chat, index) => (
                  <View
                    key={chat.id}
                    style={{
                      flexDirection:
                        chat.sender.role === "STUDENT" ? "row" : "row-reverse",
                      alignItems: "center",
                      marginTop: 2,
                    }}
                  >
                    <View
                      style={{
                        minWidth: "25%",
                        maxWidth: "75%",
                        backgroundColor:
                          chat.sender.role === "STUDENT" ? "white" : "#F39300",
                        padding: 12,
                        borderRadius: 10,
                        elevation: 1,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "400",
                          color:
                            chat.sender.role === "STUDENT" ? "black" : "white",
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
                ))} */}
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
                      color: "black",
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
                    placeholder="Type message"
                    value={content}
                    onChangeText={(value) => setContent(value)}
                    style={{ flex: 1, paddingRight: 8, fontSize: 18 }}
                  />
                  <TouchableOpacity
                    disabled={content === ""}
                    onPress={() => {
                      handleSendMessage(selectedQuestion.chatSession.id);
                    }}
                  >
                    <Ionicons name="send" size={20} color="#F39300" />
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
