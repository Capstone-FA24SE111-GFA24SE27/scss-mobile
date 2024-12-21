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
import * as ImagePicker from "expo-image-picker";
import RenderHTML from "react-native-render-html";
import { storage } from "../../../config/FirebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import StudentInfoModal from "../../layout/StudentInfoModal";

export default function CounselorQA() {
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
  const [info, setInfo] = useState({});
  const [openStudentInfo, setOpenStudentInfo] = useState(false);
  const [selectedStudentInfo, setSelectedStudentInfo] = useState(null);
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [openPreview, setOpenPreview] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openCloseConfirm, setOpenCloseConfirm] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
      }
      fetchData(filters, { query: debouncedKeyword, page: currentPage });
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
    setLoading(true);
    fetchData();
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
          },
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
        },
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
          },
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

  const selectImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("You've refused to allow this app to access your photos!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.75,
    });
    if (!result.canceled) {
      const selectedImage = result.assets[0];
      const imageUri = selectedImage.uri;
      const imageRef = ref(
        storage,
        `images/${Date.now()}_${selectedImage.fileName}`
      );
      const response = await fetch(imageUri);
      const blob = await response.blob();
      await uploadBytes(imageRef, blob);
      const downloadURL = await getDownloadURL(imageRef);
      setImage({ uri: downloadURL });
    }
  };

  const renderPreviewContent = () => {
    return (
      <RenderHTML
        source={{
          html: `<div style="margin-top: -24px"><p style="font-size: 16px; font-weight: 400;">${content}</p>${
            image
              ? `<img src="${image.uri}" style="max-width: ${
                  width * 0.85
                }px; height: auto;">`
              : ""
          }</div>`,
        }}
        contentWidth={width * 0.9}
      />
    );
  };

  const renderContent = (source) => {
    return (
      <RenderHTML
        source={{
          html: source,
        }}
        contentWidth={width * 0.9}
      />
    );
  };

  const error = console.error;
  console.error = (...args) => {
    if (/defaultProps/.test(args[0])) return;
    error(...args);
  };

  const handleAnswerQuestion = async (questionId) => {
    try {
      const imageHTML = image
        ? `<img src="${image.uri}" style="max-width: ${
            width * 0.85
          }px; height: auto;">`
        : "";
      const finalContent = `<div style="margin-top: -24px"><p style="font-size: 16px; font-weight: 400;">${content}</p>${imageHTML}</div>`;
      const response = await axiosJWT.post(
        `${BASE_URL}/question-cards/answer/${questionId}`,
        {
          content: finalContent,
        }
      );
      const data = await response.data;
      if (data && data.status == 200) {
        setOpenAnswer(false);
        setOpenConfirm(false);
        setContent("");
        setImage(null);
        setOpenPreview(false);
        setSelectedQuestion(null);
        fetchData(filters, { page: currentPage });
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Your answer for this question has been submitted",
          onPress: () => {
            Toast.hide();
          },
        });
      }
    } catch (err) {
      console.log("Can't answer this question", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Can't answer this question",
        onPress: () => {
          Toast.hide();
        },
      });
    }
  };

  const handleEditAnswer = async (questionId) => {
    try {
      const imageHTML = image
        ? `<img src="${image.uri}" style="max-width: ${
            width * 0.85
          }px; height: auto;">`
        : "";
      const finalContent = `<div style="margin-top: -24px"><p style="font-size: 16px; font-weight: 400;">${content}</p>${imageHTML}</div>`;
      console.log(finalContent);
      const response = await axiosJWT.put(
        `${BASE_URL}/question-cards/answer/edit/${questionId}`,
        {
          content: finalContent,
        }
      );
      const data = await response.data;
      if (data && data.status == 200) {
        setOpenEditAnswer(false);
        setContent("");
        setImage(null);
        setOpenPreview(false);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Your answer has been updated",
          onPress: () => {
            Toast.hide();
          },
        });
        fetchData(filters, { page: currentPage });
      }
    } catch (err) {
      console.log("Can't edit this question's answer", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Can't edit this question's answer",
        onPress: () => {
          Toast.hide();
        },
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
        },
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
        },
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
        },
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
        },
      });
    }
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
              height: 40,
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
                  placeholder="Input Student Code"
                  value={studentCode}
                  onChangeText={(value) => setStudentCode(value)}
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
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => (
                          setOpenStudentInfo(true),
                          setSelectedStudentInfo(question.student.id)
                        )}
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
                      </TouchableOpacity>
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
                      {question.title}
                    </Text>
                    <View style={{ marginTop: 8 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontStyle: "italic",
                          fontWeight: "600",
                          textAlign: "left",
                          color: "gray",
                          opacity: 0.7,
                        }}
                      >
                        Asked at{" "}
                        {question.createdDate.split("T")[0] +
                          " " +
                          question.createdDate.split("T")[1].slice(0, 8)}
                      </Text>
                    </View>
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
                      <View
                        style={{
                          backgroundColor:
                            question.difficultyLevel === "Easy"
                              ? "green"
                              : question.difficultyLevel === "Medium"
                              ? "#F39300"
                              : "red",
                          alignItems: "center",
                          justifyContent: "center",
                          flexDirection: "row",
                          paddingVertical: 4,
                          paddingHorizontal: 8,
                          marginLeft: 8,
                          borderRadius: 20,
                          borderWidth: 1.5,
                          borderColor: "transparent",
                        }}
                      >
                        {Array.from({
                          length:
                            question.difficultyLevel === "Easy"
                              ? 1
                              : question.difficultyLevel === "Medium"
                              ? 2
                              : 3,
                        }).map((_, index) => (
                          <Ionicons
                            key={index}
                            name="star"
                            size={14}
                            color="white"
                            style={{ marginHorizontal: 1 }}
                          />
                        ))}
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: "white",
                            marginLeft: 4,
                          }}
                        >
                          {question.difficultyLevel}
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
                              marginRight: 4,
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                              backgroundColor: "white",
                              borderRadius: 10,
                              borderWidth: 1.5,
                              borderColor: "#F39300",
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            {/* <Text
                              style={{
                                fontWeight: "500",
                                color: "white",
                                fontSize: 16,
                              }}
                            >
                              Answer
                            </Text> */}
                            <MaterialIcons
                              name="question-answer"
                              size={20}
                              color="#F39300"
                            />
                          </TouchableOpacity>
                        )}
                      <TouchableOpacity
                        onPress={() => (setInfo(question), setOpenInfo(true))}
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
                            fontSize: 16,
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
                            onPress={() => {
                              setOpenEditAnswer(true);
                              setSelectedQuestion(question);
                              setContent(
                                question.answer
                                  .split(
                                    '<p style="font-size: 16px; font-weight: 400;">'
                                  )[1]
                                  ?.split("</p>")[0] || ""
                              );
                              const imgTag = question.answer.includes(
                                '<img src="'
                              )
                                ? question.answer
                                    .split('<img src="')[1]
                                    ?.split('"')[0]
                                : null;

                              if (imgTag) {
                                setImage({
                                  uri: imgTag,
                                });
                              } else {
                                setImage(null);
                              }
                              setOpenPreview(true);
                            }}
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
                        }}
                      >
                        {/* <Text
                          style={{
                          fontWeight: "400",
                            fontSize: 16,
                            color: "#333",
                          }}
                          numberOfLines={2}
                        >
                          {question.answer}
                        </Text> */}
                        {renderContent(question.answer)}
                      </View>
                      <View
                        style={{
                          alignSelf: "flex-end",
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 12,
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
                value={content}
                onChangeText={setContent}
                style={{
                  borderColor: "#ccc",
                  borderWidth: 1,
                  borderRadius: 10,
                  padding: 12,
                  backgroundColor: "#fff",
                  fontSize: 16,
                  textAlignVertical: "top",
                }}
                multiline
                numberOfLines={3}
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
                value={content}
                onChangeText={setContent}
                style={{
                  borderColor: "#ccc",
                  borderWidth: 1,
                  borderRadius: 10,
                  padding: 12,
                  backgroundColor: "#fff",
                  fontSize: 16,
                  textAlignVertical: "top",
                }}
                multiline
                numberOfLines={3}
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
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                }}
              >
                <Text
                  style={{ fontSize: 24, fontWeight: "bold", color: "white" }}
                >
                  Answer Question
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={{
                    backgroundColor: "white",
                    padding: 4,
                    borderRadius: 20,
                  }}
                  onPress={() => (setOpenAnswer(false), setImage(null))}
                >
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 20,
                  paddingTop: 12,
                  paddingBottom: 20,
                  backgroundColor: "#f5f7fd",
                  borderRadius: 16,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{ fontSize: 16, fontWeight: "bold", color: "#333" }}
                  >
                    Your Answer <Text style={{ color: "#F39300" }}>*</Text>
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        marginRight: 8,
                        backgroundColor: openPreview ? "#F39300" : "#e3e3e3",
                        borderRadius: 10,
                      }}
                      onPress={() => setOpenPreview(!openPreview)}
                    >
                      <MaterialIcons
                        name="preview"
                        size={28}
                        color={openPreview ? "white" : "black"}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        backgroundColor: "#e3e3e3",
                        borderRadius: 10,
                      }}
                      onPress={selectImage}
                    >
                      <Ionicons name="image" size={28} />
                    </TouchableOpacity>
                  </View>
                </View>
                <TextInput
                  placeholder="Type your answer"
                  value={content}
                  onChangeText={setContent}
                  style={{
                    borderColor: "#ccc",
                    borderWidth: 1,
                    borderRadius: 10,
                    padding: 12,
                    height: 100,
                    backgroundColor: "#fff",
                    fontSize: 16,
                    marginTop: 8,
                    marginBottom: 12,
                    textAlignVertical: "top",
                  }}
                  multiline
                  numberOfLines={3}
                />
                {image && (
                  <View style={{ marginBottom: 12 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "bold",
                          color: "#333",
                        }}
                      >
                        Uploaded Image
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        marginVertical: 8,
                        borderWidth: 1,
                        borderColor: "#f39300",
                        backgroundColor: "white",
                        borderRadius: 20,
                      }}
                    >
                      <Text
                        style={{
                          color: "#f39300",
                          fontSize: 14,
                          fontWeight: "bold",
                          flex: 1,
                          marginHorizontal: 8,
                        }}
                      >
                        {image?.uri
                          ? `${
                              image.uri.split("_")[1]?.split("?")[0] ||
                              "No URI available"
                            }`
                          : "No image selected"}
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setImage(null)}
                        style={{
                          padding: 4,
                        }}
                      >
                        <Ionicons name="trash" size={20} color="red" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                {openPreview && (
                  <>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        color: "#333",
                      }}
                    >
                      Preview
                    </Text>
                    <View
                      style={{
                        backgroundColor: "white",
                        padding: 8,
                        marginTop: 8,
                        marginBottom: 12,
                        borderRadius: 10,
                        borderWidth: 1.5,
                        borderColor: "#ccc",
                      }}
                    >
                      {content !== "" || image ? (
                        <>
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "400",
                              color: "gray",
                            }}
                          >
                            Your answer look like this:
                          </Text>
                          {renderPreviewContent()}
                        </>
                      ) : (
                        <Text
                          style={{
                            fontWeight: "400",
                            fontSize: 18,
                            fontStyle: "italic",
                            fontWeight: "600",
                            textAlign: "center",
                            color: "gray",
                            opacity: 0.7,
                          }}
                        >
                          Nothing to preview yet
                        </Text>
                      )}
                    </View>
                  </>
                )}
              </ScrollView>
              <TouchableOpacity
                disabled={content === ""}
                style={{
                  backgroundColor: content === "" ? "#ededed" : "#F39300",
                  marginHorizontal: 20,
                  marginVertical: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
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
                  Submit Answer
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
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "bold",
                    color: "white",
                  }}
                >
                  Edit Answer
                </Text>
              </View>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 20,
                  paddingTop: 12,
                  paddingBottom: 20,
                  backgroundColor: "#f5f7fd",
                  borderRadius: 16,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{ fontSize: 16, fontWeight: "bold", color: "#333" }}
                  >
                    Your answer <Text style={{ color: "#F39300" }}>*</Text>
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        marginRight: 8,
                        backgroundColor: openPreview ? "#F39300" : "#e3e3e3",
                        borderRadius: 10,
                      }}
                      onPress={() => setOpenPreview(!openPreview)}
                    >
                      <MaterialIcons
                        name="preview"
                        size={28}
                        color={openPreview ? "white" : "black"}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        backgroundColor: "#e3e3e3",
                        borderRadius: 10,
                      }}
                      onPress={selectImage}
                    >
                      <Ionicons name="image" size={28} />
                    </TouchableOpacity>
                  </View>
                </View>
                <TextInput
                  placeholder="Type your answer"
                  value={content}
                  onChangeText={setContent}
                  style={{
                    borderColor: "#ccc",
                    borderWidth: 1,
                    borderRadius: 10,
                    padding: 12,
                    height: 100,
                    backgroundColor: "#fff",
                    fontSize: 16,
                    marginTop: 8,
                    marginBottom: 12,
                    textAlignVertical: "top",
                  }}
                  multiline
                />
                {image && (
                  <View style={{ marginBottom: 12 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "bold",
                          color: "#333",
                        }}
                      >
                        Uploaded Image
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        marginVertical: 8,
                        borderWidth: 1,
                        borderColor: "#f39300",
                        backgroundColor: "white",
                        borderRadius: 20,
                      }}
                    >
                      <Text
                        style={{
                          color: "#f39300",
                          fontSize: 14,
                          fontWeight: "bold",
                          flex: 1,
                          marginHorizontal: 8,
                        }}
                      >
                        {image?.uri
                          ? `${
                              image.uri.split("_")[1]?.split("?")[0] ||
                              "No URI available"
                            }`
                          : "No image selected"}
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setImage(null)}
                        style={{
                          padding: 4,
                        }}
                      >
                        <Ionicons name="trash" size={20} color="red" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                {openPreview && (
                  <>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        color: "#333",
                      }}
                    >
                      Preview
                    </Text>
                    <View
                      style={{
                        backgroundColor: "white",
                        padding: 8,
                        marginTop: 8,
                        marginBottom: 12,
                        borderRadius: 10,
                        borderWidth: 1.5,
                        borderColor: "#ccc",
                      }}
                    >
                      {content !== "" || image ? (
                        <>
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "400",
                              color: "gray",
                            }}
                          >
                            Your question look like this:
                          </Text>
                          {renderPreviewContent()}
                        </>
                      ) : (
                        <Text
                          style={{
                            fontWeight: "400",
                            fontSize: 18,
                            fontStyle: "italic",
                            fontWeight: "600",
                            textAlign: "center",
                            color: "gray",
                            opacity: 0.7,
                          }}
                        >
                          Nothing to preview yet
                        </Text>
                      )}
                    </View>
                  </>
                )}
              </ScrollView>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginHorizontal: 20,
                  marginVertical: 12,
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
                    setOpenEditAnswer(false),
                    setContent(""),
                    setImage(null),
                    setOpenPreview(false)
                  )}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      color: "#333",
                      fontWeight: "600",
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: content === "" ? "#ededed" : "#F39300",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 10,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={() => handleEditAnswer(selectedQuestion?.id)}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      color: content === "" ? "gray" : "white",
                      fontWeight: "600",
                    }}
                  >
                    Edit
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
          visible={openInfo}
          animationType="slide"
          onRequestClose={() => setOpenInfo(false)}
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
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View style={{ flex: 1 }}>
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
                </View>
                <View style={{ flex: 2, alignItems: "center" }} />
                <View style={{ flex: 1 }} />
              </View>
              <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
              >
                <View
                  style={{
                    padding: 20,
                    backgroundColor: "#f5f7fd",
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
                      Title
                    </Text>
                    <Text
                      style={{
                        fontSize: 20,
                        color: "#333",
                        fontWeight: "500",
                      }}
                    >
                      {info?.title}
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
                      Question
                    </Text>
                    {/* <Text
                      style={{
                        fontSize: 20,
                        color: "#333",
                        fontWeight: "500",
                        opacity: 0.7,
                      }}
                    >
                      {info?.content}
                    </Text> */}
                    {renderContent(info?.content)}
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
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => (
                        setOpenStudentInfo(true),
                        setSelectedStudentInfo(info?.student?.id)
                      )}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 12,
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
                          {info?.student?.major?.name ||
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
                    </TouchableOpacity>
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
                        // <Text
                        //   style={{
                        //     fontSize: 20,
                        //     color: "#333",
                        //     fontWeight: "500",
                        //     opacity: 0.7,
                        //   }}
                        // >
                        //   {info?.answer}
                        // </Text>
                        renderContent(info?.answer)
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
                </View>
              </ScrollView>
              <View
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 8,
                  backgroundColor: "#f5f7fd",
                }}
              >
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
            </View>
          </View>
        </Modal>
        <StudentInfoModal
          openStudentInfo={openStudentInfo}
          setOpenStudentInfo={setOpenStudentInfo}
          selectedStudentInfo={selectedStudentInfo}
          setSelectedStudentInfo={setSelectedStudentInfo}
        />
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
          transparent={true}
          visible={openChat}
          animationType="slide"
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
                    onPress={() => (
                      setInfo(selectedQuestion), setOpenInfo(true)
                    )}
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
                        marginLeft: 8,
                      }}
                    >
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "bold",
                            opacity: 0.5,
                            marginRight: 8,
                          }}
                        >
                          Now chatting
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color="#F39300"
                        />
                      </View>
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: "bold",
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
