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
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import axiosJWT, { BASE_URL } from "../../../config/Config";
import { Dropdown } from "react-native-element-dropdown";
import { AuthContext } from "../../context/AuthContext";
import { SocketContext } from "../../context/SocketContext";
import { ChatContext } from "../../context/ChatContext";
import { QASkeleton } from "../../layout/Skeleton";
import Pagination from "../../layout/Pagination";
import Toast from "react-native-toast-message";
import { FilterAccordion, FilterToggle } from "../../layout/FilterSection";
import * as ImagePicker from "expo-image-picker";
import RenderHTML from "react-native-render-html";
import ExtendInfoModal from "../../layout/ExtendInfoModal";
import { storage } from "../../../config/FirebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function StudentQA() {
  const navigation = useNavigation();
  const { width, height } = Dimensions.get("screen");
  const { userData, profile } = useContext(AuthContext);
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
  // const scrollViewRef2 = useRef(null);
  // const [questions, setQuestions] = useState([]);
  // const [filters, setFilters] = useState({
  //   status: "",
  //   isTaken: "",
  //   isClosed: "",
  //   type: "",
  //   sortDirection: "",
  // });
  // const [keyword, setKeyword] = useState("");
  // const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [status, setStatus] = useState("");
  const statusList = [
    { name: "PENDING" },
    { name: "VERIFIED" },
    { name: "FLAGGED" },
    { name: "REJECTED" },
  ];
  const [isTaken, setIsTaken] = useState("");
  const [isClosed, setIsClosed] = useState("");
  const [type, setType] = useState("");
  const [sortDirection, setSortDirection] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [expanded2, setExpanded2] = useState(false);
  const [expanded3, setExpanded3] = useState(false);
  const [expanded4, setExpanded4] = useState(false);
  // const [currentPage, setCurrentPage] = useState(1);
  const [openCreate, setOpenCreate] = useState(false);
  const [openInfo, setOpenInfo] = useState(false);
  // const [openChat, setOpenChat] = useState(false);
  const [info, setInfo] = useState({});
  const [openExtendInfo, setOpenExtendInfo] = useState(false);
  const [extendInfo, setExtendInfo] = useState(null);
  const [openBanInfo, setOpenBanInfo] = useState(false);
  const [banInfo, setBanInfo] = useState({});
  // const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [openPreview, setOpenPreview] = useState(false);
  const [counselorType, setCounselorType] = useState("ACADEMIC");
  const [departments, setDepartments] = useState([]);
  const [department, setDepartment] = useState("");
  const [majors, setMajors] = useState([]);
  const [major, setMajor] = useState("");
  const [specializations, setSpecializations] = useState([]);
  const [specialization, setSpecialization] = useState("");
  const [expertises, setExpertises] = useState([]);
  const [expertise, setExpertise] = useState("");
  const [openSuggestion, setOpenSuggestion] = useState(false);
  const [suggestQuestions, setSuggestQuestions] = useState([]);
  const [suggestQuestions2, setSuggestQuestions2] = useState([]);
  const [currentTab, setCurrentTab] = useState("Public Q&A");
  const [loading2, setLoading2] = useState(false);
  const [openInfo2, setOpenInfo2] = useState(false);
  const [info2, setInfo2] = useState({});
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openEditQuestion, setOpenEditQuestion] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [openCreateChatSessionConfirm, setOpenCreateChatSessionConfirm] =
    useState(false);
  const [openCloseConfirm, setOpenCloseConfirm] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
      }
      fetchData(filters, { page: currentPage });
      fetchBanInfo();
      fetchDepartment();
      setDepartment(profile?.department);
      setMajor(profile?.major);
    }, [debouncedKeyword, filters, currentPage])
  );

  // const fetchData = async (filters = {}) => {
  //   try {
  //     const questionsRes = await axiosJWT.get(
  //       `${BASE_URL}/question-cards/student/filter`,
  //       {
  //         params: {
  //           keyword: debouncedKeyword,
  //           ...filters,
  //           page: currentPage,
  //         },
  //       }
  //     );
  //     const questionsData = questionsRes?.data?.content || [];
  //     setQuestions(questionsData);
  //     setLoading(false);
  //     console.log(questions);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

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
      status: status,
      isTaken: isTaken,
      isClosed: isClosed,
      type: type,
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
      status: "",
      isTaken: "",
      isClosed: "",
      type: "",
      sortDirection: "",
    };
    setKeyword("");
    setStatus(resetFilters.status);
    setIsTaken(resetFilters.isTaken);
    setIsClosed(resetFilters.isClosed);
    setType(resetFilters.type);
    setSortDirection(resetFilters.sortDirection);
    setFilters(resetFilters);
    fetchData(resetFilters);
    setIsExpanded(false);
  };

  useEffect(() => {
    setLoading(true);
    setCurrentPage(1);
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

  const fetchBanInfo = async () => {
    try {
      const banRes = await axiosJWT.get(
        `${BASE_URL}/question-cards/student/ban-info`
      );
      const banData = banRes?.data || [];
      setBanInfo(banData);
    } catch (err) {
      console.log(err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Can't fetch ban info",
        onPress: () => Toast.hide(),
      });
    }
  };

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
        `${BASE_URL}/academic/departments/${department?.id}/majors`
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
        `${BASE_URL}/academic/majors/${major?.id}/specializations`
      );
      const specializationsData = specializationsRes?.data || [];
      setSpecializations(specializationsData);
    } catch (err) {
      console.log("Can't fetch specializations");
    }
  };

  const fetchExpertise = async () => {
    try {
      const expertisesRes = await axiosJWT.get(
        `${BASE_URL}/counselors/expertise`
      );
      const expertisesData = expertisesRes?.data?.content || [];
      setExpertises(expertisesData);
    } catch (error) {
      console.log("Can't fetch expertises");
    }
  };

  useEffect(() => {
    if (counselorType === "ACADEMIC") {
      setExpertise("");
      fetchDepartment();
      if (department !== "") {
        fetchMajor();
        if (major !== "") {
          fetchSpecialization();
        }
      }
    }
    if (counselorType === "NON_ACADEMIC") {
      setDepartment("");
      setMajor("");
      setSpecialization("");
      fetchExpertise();
    }
  }, [counselorType, department, major, specialization, expertise]);

  // const selectImage = async () => {
  //   const permissionResult =
  //     await ImagePicker.requestMediaLibraryPermissionsAsync();

  //   if (!permissionResult.granted) {
  //     alert("You've refused to allow this app to access your photos!");
  //     return;
  //   }

  //   const result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //     base64: true,
  //     allowsEditing: false,
  //     quality: 0.75,
  //   });

  //   if (!result.canceled) {
  //     const selectedImage = result.assets[0];
  //     setImage({
  //       uri: selectedImage.uri,
  //       base64: selectedImage.base64,
  //     });
  //   }
  // };

  // const renderPreviewContent = () => {
  //   return (
  //     <RenderHTML
  //       source={{
  //         html: `<div style="margin-top: -24px"><p style="font-size: 16px; font-weight: 400;">${content}</p>${
  //           image
  //             ? `<img src="data:image/jpeg;base64,${
  //                 image.base64
  //               }" style="max-width: ${width * 0.7}px; height: auto;">`
  //             : ""
  //         }</div>`,
  //       }}
  //       contentWidth={width * 0.9}
  //     />
  //   );
  // };

  const selectImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("You've refused to allow this app to access your photos!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
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
                  width * 0.7
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

  const fetchSuggestQuestions = async (content) => {
    setLoading2(true);
    try {
      const suggestQuestionsRes = await axiosJWT.get(
        `${BASE_URL}/question-cards/filter`,
        {
          params: {
            keyword: content,
            size: 10,
          },
        }
      );
      const suggestQuestionsRes2 = await axiosJWT.get(
        `${BASE_URL}/contribution-question-cards/search`,
        {
          params: {
            query: content,
            size: 10,
          },
        }
      );
      const suggestQuestionsData = suggestQuestionsRes?.data?.content || [];
      const suggestQuestionsData2 = suggestQuestionsRes2?.data?.content || [];
      setSuggestQuestions(suggestQuestionsData);
      setSuggestQuestions2(suggestQuestionsData2);
    } catch (err) {
      console.log(err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Can't fetch suggest questions",
        onPress: () => Toast.hide(),
      });
    } finally {
      setLoading2(false);
    }
  };

  const handleCreateQuestion = async () => {
    try {
      // const imageHTML = image
      //   ? `<img src="data:image/jpeg;base64,${
      //       image.base64
      //     }" style="max-width: ${width * 0.85}px; height: auto;">`
      //   : "";
      const imageHTML = image
        ? `<img src="${image.uri}" style="max-width: ${
            width * 0.7
          }px; height: auto;">`
        : "";
      const finalContent = `<div style="margin-top: -24px"><p style="font-size: 16px; font-weight: 400;">${content}</p>${imageHTML}</div>`;
      const response = await axiosJWT.post(`${BASE_URL}/question-cards`, {
        title: title,
        content: finalContent,
        questionType: counselorType,
        // ...(counselorType === "ACADEMIC"
        //   ? {
        //       departmentId: department?.id,
        //       majorId: major?.id,
        //       specializationId: specialization?.id || "",
        //     }
        //   : { expertiseId: expertise?.id }),
      });
      const data = await response.data;
      if (data && data.status == 200) {
        setOpenCreate(false);
        setOpenConfirm(false);
        setOpenSuggestion(false);
        setTitle("");
        setContent("");
        setImage(null);
        setOpenPreview(false);
        setCounselorType("ACADEMIC");
        setDepartment(profile?.department);
        setMajor(profile?.major);
        setSpecialization("");
        setExpertise("");
        fetchData(filters, { page: currentPage });
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "New question has been created",
          onPress: () => {
            Toast.hide();
          },
        });
      }
    } catch (err) {
      if (err.status === 404) {
        console.log("Question doesn't have enough context", err);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Question doesn't have enough context",
          onPress: () => {
            Toast.hide();
          },
        });
      } else {
        console.log("Can't create question", err);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Can't create question",
          onPress: () => {
            Toast.hide();
          },
        });
      }
    }
  };

  const handleEditQuestion = async (questionId) => {
    try {
      // const imageHTML = image
      //   ? `<img src="data:image/jpeg;base64,${
      //       image.base64
      //     }" style="max-width: ${width * 0.85}px; height: auto;">`
      //   : "";
      const imageHTML = image
        ? `<img src="${image.uri}" style="max-width: ${
            width * 0.7
          }px; height: auto;">`
        : "";
      const finalContent = `<div style="margin-top: -24px"><p style="font-size: 16px; font-weight: 400;">${content}</p>${imageHTML}</div>`;
      const response = await axiosJWT.put(
        `${BASE_URL}/question-cards/edit/${questionId}`,
        {
          title: title,
          content: finalContent,
          questionType: counselorType,
        }
      );
      const data = await response.data;
      if (data && data.status == 200) {
        setOpenEditQuestion(false);
        setTitle("");
        setContent("");
        setImage(null);
        setOpenPreview(false);
        setCounselorType("ACADEMIC");
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Your question has been updated",
          onPress: () => {
            Toast.hide();
          },
        });
        fetchData(filters, { page: currentPage });
        if (openInfo) {
          setInfo({ ...info, title: title, content: finalContent });
        }
      }
    } catch (err) {
      console.log("Can't edit question", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Can't edit question",
      });
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      const response = await axiosJWT.delete(
        `${BASE_URL}/question-cards/delete/${questionId}`
      );
      const data = await response.data;
      if (data && data.status == 200) {
        setOpenDeleteConfirm(false);
        setOpenInfo(false);
        setSelectedQuestion(null);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Your question has been deleted",
          onPress: () => {
            Toast.hide();
          },
        });
        fetchData(filters);
      }
    } catch (err) {
      console.log("Can't delete question", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Can't delete question",
        onPress: () => {
          Toast.hide();
        },
      });
    }
  };

  // const handleCloseQuestion = async (questionId) => {
  //   try {
  //     await axiosJWT.post(
  //       `${BASE_URL}/question-cards/student/close/${questionId}`
  //     );
  //     setOpenInfo(false);
  //     setOpenChat(false);
  //     setOpenCloseConfirm(false);
  //     setSelectedQuestion(null);
  //     Toast.show({
  //       type: "success",
  //       text1: "Success",
  //       text2: "Your question has been closed",
  //       onPress: () => {
  //         Toast.hide();
  //       },
  //     });
  //     fetchData(filters);
  //   } catch (err) {
  //     console.log("Can't close question", err);
  //     Toast.show({
  //       type: "error",
  //       text1: "Error",
  //       text2: "Can't close question",
  //       onPress: () => {
  //         Toast.hide();
  //       },
  //     });
  //   }
  // };

  const handleCreateChatSession = async (questionId) => {
    try {
      await axiosJWT.post(
        `${BASE_URL}/question-cards/student/chat-session/create/${questionId}`
      );
      fetchData(filters);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Chat sesstion of this question has been created",
        onPress: () => {
          Toast.hide();
        },
      });
      setOpenCreateChatSessionConfirm(false);
      fetchQuestionCard(questionId);
      setTimeout(() => {
        setOpenChat(true);
      }, 500);
    } catch (err) {
      console.log("Can't start a chat in this question", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Can't start a chat in this question",
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
              placeholderTextColor="gray"
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
              <TouchableOpacity
                activeOpacity={0.7}
                style={{
                  backgroundColor: banInfo?.ban === true ? "red" : "#e3e3e3",
                  borderRadius: 40,
                  padding: 8,
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "row",
                  marginRight: 8,
                }}
                onPress={() => setOpenBanInfo(true)}
              >
                <Ionicons
                  name="flag"
                  size={26}
                  style={{
                    color: banInfo?.ban === true ? "white" : "black",
                  }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                style={{
                  backgroundColor:
                    banInfo?.ban === true ? "#e3e3e3" : "#F39300",
                  borderRadius: 40,
                  padding: 8,
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "row",
                  marginRight: 8,
                }}
                onPress={() =>
                  banInfo?.ban === true
                    ? setOpenBanInfo(true)
                    : setOpenCreate(true)
                }
              >
                <Ionicons
                  name="add"
                  size={26}
                  style={{ color: banInfo?.ban === true ? "black" : "white" }}
                />
              </TouchableOpacity>
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
                    minWidth: "20%",
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
                    minWidth: "20%",
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
                    minWidth: "20%",
                  }}
                >
                  Type:
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
                      onPress={() => setType("ACADEMIC")}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Ionicons
                        name={
                          type == "ACADEMIC"
                            ? "radio-button-on"
                            : "radio-button-off"
                        }
                        size={20}
                        color={type == "ACADEMIC" ? "#F39300" : "gray"}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={{
                          color: type == "ACADEMIC" ? "#F39300" : "black",
                          fontSize: 15,
                        }}
                      >
                        Academic
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => setType("NON_ACADEMIC")}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Ionicons
                        name={
                          type == "NON_ACADEMIC"
                            ? "radio-button-on"
                            : "radio-button-off"
                        }
                        size={20}
                        color={type == "NON_ACADEMIC" ? "#F39300" : "gray"}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={{
                          color: type == "NON_ACADEMIC" ? "#F39300" : "black",
                          fontSize: 15,
                        }}
                      >
                        Non-Academic
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
                    minWidth: "20%",
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
                    paddingHorizontal: 12,
                    paddingVertical: 16,
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
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => (
                          setOpenExtendInfo(true),
                          setExtendInfo(question.counselor)
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
                            uri: question.counselor.profile.avatarLink,
                          }}
                          style={{ width: 30, height: 30 }}
                        />
                        <Text
                          style={{
                            fontWeight: "600",
                            fontSize: 16,
                            color: "#333",
                            marginLeft: 4,
                          }}
                        >
                          {question.counselor.profile.fullName.length > 20
                            ? question.counselor.profile.fullName.substring(
                                0,
                                20
                              ) + "..."
                            : question.counselor.profile.fullName}
                        </Text>
                      </TouchableOpacity>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        {question.status == "PENDING" && (
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <TouchableOpacity
                              onPress={() => {
                                setOpenEditQuestion(true);
                                setSelectedQuestion(question);
                                setTitle(question.title);
                                setContent(
                                  question.content
                                    .split(
                                      '<p style="font-size: 16px; font-weight: 400;">'
                                    )[1]
                                    ?.split("</p>")[0] || ""
                                );
                                const imgTag = question.content.includes(
                                  '<img src="'
                                )
                                  ? question.content
                                      .split('<img src="')[1]
                                      ?.split('"')[0]
                                  : null;

                                if (imgTag) {
                                  setImage({
                                    uri: imgTag,
                                    // base64: imgTag.split(",")[1] || null,
                                  });
                                } else {
                                  setImage(null);
                                }
                                setCounselorType(question.questionType);
                                setOpenPreview(true);
                              }}
                              style={{
                                marginRight: 8,
                                marginBottom: 8,
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                backgroundColor: "#F39300",
                                borderRadius: 10,
                                flexDirection: "row",
                                alignItems: "center",
                              }}
                            >
                              <MaterialIcons
                                name="edit-note"
                                size={20}
                                color="white"
                              />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => (
                                setOpenDeleteConfirm(true),
                                setSelectedQuestion(question)
                              )}
                              style={{
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
                              <Ionicons name="trash" size={20} color="red" />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                      {question?.chatSession?.messages?.some(
                        (message) =>
                          message.read === false &&
                          message.sender.role !== "STUDENT"
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
                                message.sender.role !== "STUDENT"
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
                        Created at{" "}
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
                          backgroundColor: "#F39300",
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
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: "white",
                          }}
                        >
                          {question.questionType}
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
                          <Ionicons name="lock-closed" color="gray" size={18} />
                        </View>
                      )}
                    </View>
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
                            {question.counselor.profile.fullName}
                          </Text>
                        </Text>
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
                        {/* {question.status == "VERIFIED" &&
                          question.closed == false &&
                          question.taken == false && (
                            <TouchableOpacity
                              onPress={() => (
                                setOpenCloseConfirm(true),
                                setSelectedQuestion(question)
                              )}
                              style={{
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                marginRight: 8,
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
                                  marginLeft: 8,
                                }}
                              >
                                Close
                              </Text>
                            </TouchableOpacity>
                          )} */}
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
                        {question.chatSession === null &&
                          question.closed === false &&
                          question.status === "VERIFIED" && (
                            <TouchableOpacity
                              onPress={() => {
                                setOpenCreateChatSessionConfirm(true);
                                setSelectedQuestion(question);
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
                              <Ionicons
                                name="chatbubble-ellipses"
                                size={16}
                                color="white"
                              />
                              <Text
                                style={{
                                  fontWeight: "500",
                                  color: "white",
                                  fontSize: 16,
                                  marginLeft: 8,
                                }}
                              >
                                Start a chat
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
                            {question.counselor.profile.fullName}
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
          animationType="slide"
          transparent={true}
          visible={openCreate}
          onRequestClose={() => setOpenCreate(false)}
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
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                }}
              >
                <Text
                  style={{ fontSize: 24, fontWeight: "bold", color: "white" }}
                >
                  Ask a Question
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={{
                    backgroundColor: "white",
                    padding: 4,
                    borderRadius: 20,
                  }}
                  onPress={() => (setOpenCreate(false), setImage(null))}
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
                <Text
                  style={{ fontSize: 16, fontWeight: "bold", color: "#333" }}
                >
                  Title <Text style={{ color: "#F39300" }}>*</Text>
                </Text>
                <TextInput
                  placeholder="Write your title here"
                  value={title}
                  onChangeText={(value) => setTitle(value)}
                  style={{
                    borderColor: "#ccc",
                    borderWidth: 1,
                    borderRadius: 10,
                    padding: 12,
                    height: 60,
                    backgroundColor: "#fff",
                    fontSize: 16,
                    marginTop: 8,
                    marginBottom: 12,
                    textAlignVertical: "top",
                  }}
                  multiline
                />
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
                    Your question <Text style={{ color: "#F39300" }}>*</Text>
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
                  placeholder="Write your question content here"
                  value={content}
                  onChangeText={(value) => setContent(value)}
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
                      {/* <TouchableOpacity
                        activeOpacity={0.7}
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          backgroundColor: "white",
                          borderRadius: 10,
                          borderWidth: 1.5,
                          borderColor: "red",
                        }}
                        onPress={() => setImage(null)}
                      >
                        <Ionicons name="trash" size={20} color="red" />
                      </TouchableOpacity> */}
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
                <Text
                  style={{ fontSize: 16, fontWeight: "bold", color: "#333" }}
                >
                  Question Type <Text style={{ color: "#F39300" }}>*</Text>
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    marginTop: 8,
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      width: "47.5%",
                      alignItems: "center",
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => setCounselorType("ACADEMIC")}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor:
                          counselorType == "ACADEMIC" ? "white" : "#ededed",
                        borderRadius: 10,
                        paddingHorizontal: 12,
                        paddingVertical: 4,
                        borderWidth: 1.5,
                        borderColor:
                          counselorType == "ACADEMIC"
                            ? "#F39300"
                            : "transparent",
                      }}
                    >
                      <Ionicons
                        name={
                          counselorType == "ACADEMIC"
                            ? "checkmark-circle"
                            : "radio-button-off"
                        }
                        size={24}
                        color={counselorType == "ACADEMIC" ? "#F39300" : "gray"}
                        style={{ marginRight: 8 }}
                      />
                      <Text
                        style={{
                          fontSize: 16,
                          color:
                            counselorType == "ACADEMIC" ? "#F39300" : "gray",
                          fontWeight:
                            counselorType == "ACADEMIC" ? "600" : "500",
                        }}
                      >
                        Academic
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      width: "50%",
                      alignItems: "center",
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => setCounselorType("NON_ACADEMIC")}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor:
                          counselorType == "NON_ACADEMIC" ? "white" : "#ededed",
                        borderRadius: 10,
                        paddingHorizontal: 12,
                        paddingVertical: 4,
                        borderWidth: 1.5,
                        borderColor:
                          counselorType == "NON_ACADEMIC"
                            ? "#F39300"
                            : "transparent",
                      }}
                    >
                      <Ionicons
                        name={
                          counselorType == "NON_ACADEMIC"
                            ? "checkmark-circle"
                            : "radio-button-off"
                        }
                        size={24}
                        color={
                          counselorType == "NON_ACADEMIC" ? "#F39300" : "gray"
                        }
                        style={{ marginRight: 8 }}
                      />
                      <Text
                        style={{
                          fontSize: 16,
                          color:
                            counselorType == "NON_ACADEMIC"
                              ? "#F39300"
                              : "gray",
                          fontWeight:
                            counselorType == "NON_ACADEMIC" ? "600" : "500",
                        }}
                      >
                        Non-academic
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {counselorType === "ACADEMIC" ? (
                  <>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        color: "#333",
                      }}
                    >
                      Department <Text style={{ color: "#F39300" }}>*</Text>
                    </Text>
                    <Dropdown
                      style={{
                        backgroundColor: "white",
                        borderColor: expanded2 ? "#F39300" : "black",
                        height: 40,
                        borderWidth: 1,
                        borderColor: "grey",
                        borderRadius: 10,
                        paddingHorizontal: 12,
                        marginTop: 8,
                        marginBottom: 12,
                      }}
                      placeholderStyle={{ fontSize: 14 }}
                      selectedTextStyle={{
                        fontSize: 14,
                        color: department ? "black" : "white",
                      }}
                      maxHeight={150}
                      data={[{ name: "Clear" }, ...departments]}
                      labelField="name"
                      search
                      value={
                        department !== ""
                          ? department.name
                          : "Select Department"
                      }
                      placeholder={
                        department !== ""
                          ? department.name
                          : "Select Department"
                      }
                      searchPlaceholder="Search Department"
                      onFocus={() => setExpanded2(true)}
                      onBlur={() => setExpanded2(false)}
                      onChange={(item) => {
                        if (item.name === "Clear") {
                          setDepartment("");
                        } else {
                          setDepartment(item);
                        }
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
                                item.name == department.name
                                  ? "#F39300"
                                  : "white",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: "500",
                                color:
                                  item.name == department.name
                                    ? "white"
                                    : item.name == "Clear"
                                    ? "red"
                                    : "black",
                              }}
                            >
                              {item.name}
                            </Text>
                            {item.name === department.name &&
                              item.name !== "Clear" && (
                                <Ionicons
                                  color="white"
                                  name="checkmark"
                                  size={20}
                                />
                              )}
                          </View>
                        );
                      }}
                    />
                    {department !== "" && (
                      <>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "bold",
                            color: "#333",
                          }}
                        >
                          Major <Text style={{ color: "#F39300" }}>*</Text>
                        </Text>
                        <Dropdown
                          style={{
                            backgroundColor: "white",
                            borderColor: expanded3 ? "#F39300" : "black",
                            height: 40,
                            borderWidth: 1,
                            borderColor: "grey",
                            borderRadius: 10,
                            paddingHorizontal: 12,
                            marginTop: 8,
                            marginBottom: 12,
                          }}
                          placeholderStyle={{ fontSize: 14 }}
                          selectedTextStyle={{
                            fontSize: 14,
                            color: major ? "black" : "white",
                          }}
                          maxHeight={150}
                          data={[{ name: "Clear" }, ...majors]}
                          labelField="name"
                          search
                          value={major !== "" ? major.name : "Select Major"}
                          placeholder={
                            major !== "" ? major.name : "Select Major"
                          }
                          searchPlaceholder="Search Major"
                          onFocus={() => setExpanded3(true)}
                          onBlur={() => setExpanded3(false)}
                          onChange={(item) => {
                            if (item.name === "Clear") {
                              setMajor("");
                            } else {
                              setMajor(item);
                            }
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
                                    item.name == major.name
                                      ? "#F39300"
                                      : "white",
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 16,
                                    fontWeight: "500",
                                    color:
                                      item.name == major.name
                                        ? "white"
                                        : item.name == "Clear"
                                        ? "red"
                                        : "black",
                                  }}
                                >
                                  {item.name}
                                </Text>
                                {item.name == major.name &&
                                  item.name !== "Clear" && (
                                    <Ionicons
                                      color="white"
                                      name="checkmark"
                                      size={20}
                                    />
                                  )}
                              </View>
                            );
                          }}
                        />
                      </>
                    )}
                    {/* {major !== "" && (
                    <>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "bold",
                          color: "#333",
                        }}
                      >
                        Specialization
                      </Text>
                      <Dropdown
                        style={{
                          backgroundColor: "white",
                          borderColor: expanded4 ? "#F39300" : "black",
                          height: 40,
                          borderWidth: 1,
                          borderColor: "grey",
                          borderRadius: 10,
                          paddingHorizontal: 12,
                          marginTop: 8,
                          marginBottom: 12,
                        }}
                        placeholderStyle={{ fontSize: 14 }}
                        selectedTextStyle={{
                          fontSize: 14,
                          color: specialization ? "black" : "white",
                        }}
                        maxHeight={150}
                        data={specializations}
                        labelField="name"
                        search
                        value={
                          specialization !== ""
                            ? specialization.name
                            : "Select Specialization"
                        }
                        placeholder={
                          specialization !== ""
                            ? specialization.name
                            : "Select Specialization"
                        }
                        searchPlaceholder="Search Specialization"
                        onFocus={() => setExpanded4(true)}
                        onBlur={() => setExpanded4(false)}
                        onChange={(item) => {
                          setSpecialization(item);
                          setExpanded4(false);
                        }}
                        renderRightIcon={() => (
                          <Ionicons
                            color={expanded4 ? "#F39300" : "black"}
                            name={expanded4 ? "caret-up" : "caret-down"}
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
                                  item.name == specialization.name
                                    ? "#F39300"
                                    : "white",
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 16,
                                  fontWeight: "500",
                                  color:
                                    item.name == specialization.name
                                      ? "white"
                                      : "black",
                                }}
                              >
                                {item.name}
                              </Text>
                              {specialization.name == item.name && (
                                <Ionicons
                                  color="white"
                                  name="checkmark"
                                  size={20}
                                />
                              )}
                            </View>
                          );
                        }}
                      />
                    </>
                  )} */}
                  </>
                ) : (
                  <>
                    {/* <Text
                    style={{ fontSize: 16, fontWeight: "bold", color: "#333" }}
                  >
                    Expertise <Text style={{ color: "#F39300" }}>*</Text>
                  </Text>
                  <Dropdown
                    style={{
                      backgroundColor: "white",
                      borderColor: expanded2 ? "#F39300" : "black",
                      height: 40,
                      borderWidth: 1,
                      borderColor: "grey",
                      borderRadius: 10,
                      paddingHorizontal: 12,
                      marginTop: 8,
                      marginBottom: 12,
                    }}
                    placeholderStyle={{ fontSize: 14 }}
                    selectedTextStyle={{
                      fontSize: 14,
                      color: expertise ? "black" : "white",
                    }}
                    maxHeight={150}
                    data={expertises}
                    labelField="name"
                    search
                    value={
                      expertise !== "" ? expertise.name : "Select Expertise"
                    }
                    placeholder={
                      expertise !== "" ? expertise.name : "Select Expertise"
                    }
                    searchPlaceholder="Search Expertise"
                    onFocus={() => setExpanded2(true)}
                    onBlur={() => setExpanded2(false)}
                    onChange={(item) => {
                      setExpertise(item);
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
                              item.name == expertise.name ? "#F39300" : "white",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "500",
                              color:
                                item.name == expertise.name ? "white" : "black",
                            }}
                          >
                            {item.name}
                          </Text>
                          {expertise.name == item.name && (
                            <Ionicons
                              color="white"
                              name="checkmark"
                              size={20}
                            />
                          )}
                        </View>
                      );
                    }}
                  /> */}
                  </>
                )}
              </ScrollView>
              <TouchableOpacity
                activeOpacity={0.7}
                disabled={
                  title === "" ||
                  content === "" ||
                  counselorType === "" ||
                  counselorType === "ACADEMIC"
                    ? department === "" || major === ""
                    : null
                }
                style={{
                  backgroundColor:
                    title === "" ||
                    content === "" ||
                    counselorType === "" ||
                    (counselorType === "ACADEMIC"
                      ? department === "" || major === ""
                      : null)
                      ? "#ededed"
                      : "#F39300",
                  marginHorizontal: 20,
                  marginVertical: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                // onPress={() => setOpenConfirm(true)}
                onPress={() => {
                  setOpenSuggestion(true), fetchSuggestQuestions(title);
                }}
              >
                <Text
                  style={{
                    color:
                      title === "" ||
                      content === "" ||
                      counselorType === "" ||
                      (counselorType === "ACADEMIC"
                        ? department === "" || major === ""
                        : null)
                        ? "gray"
                        : "white",
                    fontWeight: "bold",
                    fontSize: 20,
                  }}
                >
                  Create Question
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal
          animationType="slide"
          transparent={true}
          visible={openSuggestion}
          onRequestClose={() => setOpenSuggestion(false)}
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
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                }}
              >
                <Text
                  style={{ fontSize: 24, fontWeight: "bold", color: "white" }}
                >
                  Suggestion Questions
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={{
                    backgroundColor: "white",
                    padding: 4,
                    borderRadius: 20,
                  }}
                  onPress={() => {
                    setOpenSuggestion(false);
                    setSuggestQuestions([]);
                    setSuggestQuestions2([]);
                  }}
                >
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              {loading2 ? (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    marginVertical: width * 0.075,
                  }}
                >
                  <ActivityIndicator size={40} color="#F39300" animating />
                </View>
              ) : (
                <>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "center",
                      marginHorizontal: 20,
                      marginVertical: 8,
                    }}
                  >
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setCurrentTab("Public Q&A")}
                      style={{
                        flex: 1,
                        paddingVertical: 4,
                        backgroundColor:
                          currentTab === "Public Q&A" ? "#F39300" : "#e3e3e3",
                        alignItems: "center",
                        borderTopLeftRadius: 10,
                        borderBottomLeftRadius: 10,
                        elevation: 1,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 18,
                          color:
                            currentTab === "Public Q&A" ? "white" : "black",
                          fontWeight:
                            currentTab === "Public Q&A" ? "600" : "400",
                        }}
                      >
                        Public QA
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setCurrentTab("FAQ")}
                      style={{
                        flex: 1,
                        paddingVertical: 4,
                        backgroundColor:
                          currentTab === "FAQ" ? "#F39300" : "#e3e3e3",
                        alignItems: "center",
                        borderTopRightRadius: 10,
                        borderBottomRightRadius: 10,
                        elevation: 1,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 18,
                          color: currentTab === "FAQ" ? "white" : "black",
                          fontWeight: currentTab === "FAQ" ? "600" : "400",
                        }}
                      >
                        FAQ
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {(suggestQuestions.length !== 0 ||
                    suggestQuestions2.length !== 0) && (
                    <View style={{ marginHorizontal: 20, marginBottom: 4 }}>
                      <Text style={{ fontSize: 16, color: "gray" }}>
                        * We find questions that similar to your question have
                        been asked and answered, please consider these first
                        before deciding to ask
                      </Text>
                    </View>
                  )}
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={{ paddingHorizontal: 20 }}
                  >
                    {(currentTab === "Public Q&A" &&
                      suggestQuestions.length === 0) ||
                    (currentTab === "FAQ" && suggestQuestions2.length === 0) ? (
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
                        No suggest questions found
                      </Text>
                    ) : currentTab === "Public Q&A" ? (
                      suggestQuestions?.data?.map((question) => (
                        <View key={question.id}>
                          <View
                            style={{
                              paddingHorizontal: 12,
                              paddingVertical: 16,
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
                                    setOpenExtendInfo(true),
                                    setExtendInfo(question.counselor)
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
                                      uri: question.counselor.profile
                                        .avatarLink,
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
                                    {question.counselor.profile.fullName
                                      .length > 20
                                      ? question.counselor.profile.fullName.substring(
                                          0,
                                          20
                                        ) + "..."
                                      : question.counselor.profile.fullName}
                                  </Text>
                                </TouchableOpacity>
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
                                  Created at{" "}
                                  {question.createdDate.split("T")[0] +
                                    " " +
                                    question.createdDate
                                      .split("T")[1]
                                      .slice(0, 8)}
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
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                }}
                              >
                                <View
                                  style={{
                                    backgroundColor: "#F39300",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexDirection: "row",
                                    paddingVertical: 4,
                                    paddingHorizontal: 8,
                                    borderRadius: 20,
                                    borderWidth: 1.5,
                                    borderColor: "transparent",
                                  }}
                                >
                                  <Text
                                    style={{
                                      fontSize: 14,
                                      fontWeight: "600",
                                      color: "white",
                                    }}
                                  >
                                    {question.questionType}
                                  </Text>
                                </View>
                              </View>
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                }}
                              >
                                <TouchableOpacity
                                  onPress={() => (
                                    setInfo2(question), setOpenInfo2(true)
                                  )}
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
                                    <Text
                                      style={{
                                        fontWeight: "bold",
                                        color: "#333",
                                      }}
                                    >
                                      {question.counselor.profile.fullName}
                                    </Text>
                                  </Text>
                                </View>
                                <View
                                  style={{
                                    alignSelf: "flex-start",
                                  }}
                                >
                                  {renderContent(question.answer)}
                                </View>
                              </>
                            )}
                          </View>
                        </View>
                      ))
                    ) : (
                      suggestQuestions2?.data?.map((question) => (
                        <View
                          key={question.id}
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 16,
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
                                  setOpenExtendInfo(true),
                                  setExtendInfo(question.counselor)
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
                                    uri: question.counselor.profile.avatarLink,
                                  }}
                                  style={{ width: 30, height: 30 }}
                                />
                                <Text
                                  style={{
                                    fontWeight: "600",
                                    fontSize: 16,
                                    color: "#333",
                                    marginLeft: 4,
                                  }}
                                >
                                  {question.counselor.profile.fullName.length >
                                  20
                                    ? question.counselor.profile.fullName.substring(
                                        0,
                                        20
                                      ) + "..."
                                    : question.counselor.profile.fullName}
                                </Text>
                              </TouchableOpacity>
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
                          </View>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                              }}
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
                                      : question.status === "UNVERIFIED"
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
                                      : question.status === "UNVERIFIED"
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
                                      : question.status === "UNVERIFIED"
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
                                        : question.status === "UNVERIFIED"
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
                                  backgroundColor: "#F39300",
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
                                <Text
                                  style={{
                                    fontSize: 14,
                                    fontWeight: "600",
                                    color: "white",
                                  }}
                                >
                                  {question.category.name}
                                </Text>
                              </View>
                            </View>
                            <TouchableOpacity
                              onPress={() => (
                                setInfo2(question), setOpenInfo2(true)
                              )}
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
                                  <Text
                                    style={{
                                      fontWeight: "bold",
                                      color: "#333",
                                    }}
                                  >
                                    {question.counselor.profile.fullName}
                                  </Text>
                                </Text>
                              </View>
                              <View
                                style={{
                                  alignSelf: "flex-start",
                                }}
                              >
                                <Text
                                  style={{
                                    fontWeight: "400",
                                    fontSize: 16,
                                    color: "#333",
                                  }}
                                  numberOfLines={2}
                                >
                                  {question.answer}
                                </Text>
                              </View>
                            </>
                          )}
                        </View>
                      ))
                    )}
                  </ScrollView>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    disabled={
                      title === "" ||
                      content === "" ||
                      counselorType === "" ||
                      counselorType === "ACADEMIC"
                        ? department === "" || major === ""
                        : null
                    }
                    style={{
                      backgroundColor:
                        title === "" ||
                        content === "" ||
                        counselorType === "" ||
                        (counselorType === "ACADEMIC"
                          ? department === "" || major === ""
                          : null)
                          ? "#ededed"
                          : "#F39300",
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
                        color:
                          title === "" ||
                          content === "" ||
                          counselorType === "" ||
                          (counselorType === "ACADEMIC"
                            ? department === "" || major === ""
                            : null)
                            ? "gray"
                            : "white",
                        fontWeight: "bold",
                        fontSize: 20,
                      }}
                    >
                      Continue To Proceed?
                    </Text>
                  </TouchableOpacity>
                </>
              )}
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
                Create Question Confirmation
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  marginBottom: 30,
                  textAlign: "center",
                }}
              >
                Are you sure you want to create this question card?
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
                  onPress={handleCreateQuestion}
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
          visible={openEditQuestion}
          animationType="fade"
          onRequestClose={() => setOpenEditQuestion(false)}
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
                  paddingHorizontal: 20,
                  paddingVertical: 16,
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
                  Edit Question
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
                <Text
                  style={{ fontSize: 16, fontWeight: "bold", color: "#333" }}
                >
                  Title <Text style={{ color: "#F39300" }}>*</Text>
                </Text>
                <TextInput
                  placeholder="Write your title here"
                  value={title}
                  onChangeText={(value) => setTitle(value)}
                  style={{
                    borderColor: "#ccc",
                    borderWidth: 1,
                    borderRadius: 10,
                    padding: 12,
                    height: 60,
                    backgroundColor: "#fff",
                    fontSize: 16,
                    marginTop: 8,
                    marginBottom: 12,
                    textAlignVertical: "top",
                  }}
                  multiline
                />
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
                    Your question <Text style={{ color: "#F39300" }}>*</Text>
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
                  placeholder="Write your question content here"
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
                      {/* <TouchableOpacity
                        activeOpacity={0.7}
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          backgroundColor: "white",
                          borderRadius: 10,
                          borderWidth: 1.5,
                          borderColor: "red",
                        }}
                        onPress={() => setImage(null)}
                      >
                        <Ionicons name="trash" size={20} color="red" />
                      </TouchableOpacity> */}
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
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 10,
                    marginRight: 10,
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "gray",
                  }}
                  onPress={() => (
                    setOpenEditQuestion(false),
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
                  disabled={title === "" || content === ""}
                  style={{
                    flex: 1,
                    backgroundColor:
                      title === "" || content === "" ? "#ededed" : "#F39300",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 10,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={() => handleEditQuestion(selectedQuestion?.id)}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      color: title === "" || content === "" ? "gray" : "white",
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
          visible={openDeleteConfirm}
          animationType="fade"
          onRequestClose={() => setOpenDeleteConfirm(false)}
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
                Delete Question Confirmation
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  marginBottom: 30,
                  textAlign: "center",
                }}
              >
                Are you sure you want to delete this question?{"\n"}
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
                  onPress={() => (
                    setOpenDeleteConfirm(false), setSelectedQuestion(null)
                  )}
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
                  onPress={() => handleDeleteQuestion(selectedQuestion?.id)}
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
        {/* <Modal
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
        </Modal> */}
        <Modal
          transparent={true}
          visible={openCreateChatSessionConfirm}
          animationType="fade"
          onRequestClose={() => setOpenCreateChatSessionConfirm(false)}
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
                Start A Conversation Confirmation
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  marginBottom: 30,
                  textAlign: "center",
                }}
              >
                Are you sure you want to start to chat in this question?{"\n"}A
                new chat will be created
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
                    setOpenCreateChatSessionConfirm(false),
                    setSelectedQuestion(null)
                  )}
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
                  onPress={() => handleCreateChatSession(selectedQuestion?.id)}
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
          visible={openBanInfo}
          animationType="slide"
          onRequestClose={() => setOpenBanInfo(false)}
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
                height: banInfo?.banStartDate === null ? "20%" : "90%",
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
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                }}
              >
                <Text
                  style={{ fontSize: 24, fontWeight: "bold", color: "white" }}
                >
                  Ban Info
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={{
                    backgroundColor: "white",
                    padding: 4,
                    borderRadius: 20,
                  }}
                  onPress={() => setOpenBanInfo(false)}
                >
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              {banInfo?.banStartDate === null ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
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
                    You don't have ban problem
                  </Text>
                </View>
              ) : (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingVertical: 20,
                  }}
                >
                  <View
                    style={{
                      marginVertical: 12,
                      padding: 16,
                      backgroundColor: "#ededed",
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: "lightgrey",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 24,
                        fontWeight: "bold",
                        color: "red",
                        textAlign: "left",
                      }}
                    >
                      Banned for{" "}
                      {(() => {
                        const banStart = new Date(banInfo.banStartDate);
                        const banEnd = new Date(banInfo.banEndDate);
                        const timeDiff = banEnd - banStart;
                        const daysBan = Math.floor(
                          timeDiff / (1000 * 60 * 60 * 24)
                        );
                        return `${daysBan} Days`;
                      })()}
                    </Text>
                    <Text
                      style={{
                        marginVertical: 4,
                        fontSize: 16,
                        textAlign: "left",
                        color: "#333",
                      }}
                    >
                      Our staff have determined that your behavior has been in
                      violation of Create Question's principle.
                    </Text>
                    <View style={{ marginTop: 8 }}>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "bold",
                          color: "red",
                        }}
                      >
                        Reviewed:{" "}
                        <Text style={{ color: "#333", fontWeight: "600" }}>
                          {banInfo?.banStartDate?.split("T")[0]},{" "}
                          {banInfo?.banStartDate?.split("T")[1].split(":")[0]}:
                          {banInfo?.banStartDate?.split("T")[1].split(":")[1]}
                        </Text>
                      </Text>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "bold",
                          color: "red",
                        }}
                      >
                        Ban End:{" "}
                        <Text style={{ color: "#333", fontWeight: "600" }}>
                          {banInfo?.banEndDate?.split("T")[0]},{" "}
                          {banInfo?.banEndDate?.split("T")[1].split(":")[0]}:
                          {banInfo?.banEndDate?.split("T")[1].split(":")[1]}
                        </Text>
                      </Text>
                    </View>
                    <View
                      style={{
                        marginTop: 8,
                        padding: 12,
                        backgroundColor: "#ffefef",
                        borderWidth: 2,
                        borderColor: "red",
                        borderRadius: 10,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 18,
                          color: "red",
                          fontWeight: "500",
                          textAlign: "left",
                        }}
                      >
                        You have been banned from creating new questions.{"\n"}
                        {(() => {
                          const current = new Date();
                          const banEndTime = new Date(banInfo.banEndDate);
                          const timeDiff = banEndTime - current;

                          if (timeDiff > 0) {
                            const daysLeft = Math.floor(
                              timeDiff / (1000 * 60 * 60 * 24)
                            );
                            const hoursLeft = Math.floor(
                              (timeDiff % (1000 * 60 * 60 * 24)) /
                                (1000 * 60 * 60)
                            );

                            return `Time remaining: ${daysLeft} days and ${hoursLeft} hours.`;
                          } else {
                            return "Your ban has been lifted.";
                          }
                        })()}
                      </Text>
                    </View>
                  </View>
                  {banInfo?.questionFlags?.map((flag, index) => (
                    <View
                      key={index}
                      style={{
                        marginBottom: 12,
                        padding: 16,
                        backgroundColor: "#fff0e0",
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: "#F39300",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 20,
                          color: "#333",
                          fontWeight: "bold",
                        }}
                      >
                        {flag.questionCard.content}
                      </Text>
                      <Text
                        style={{ fontSize: 18, color: "#333", marginTop: 4 }}
                      >
                        <Text style={{ fontWeight: "bold", color: "#F39300" }}>
                          Reason:
                        </Text>{" "}
                        {flag.reason}
                      </Text>
                      <Text
                        style={{
                          fontSize: 18,
                          color: "#F39300",
                          fontWeight: "500",
                          marginTop: 4,
                        }}
                      >
                        Reviewed on:{" "}
                        <Text style={{ color: "#333", fontWeight: "500" }}>
                          {flag?.flagDate?.split("T")[0]},{" "}
                          {flag?.flagDate?.split("T")[1].split(":")[0]}:
                          {flag?.flagDate?.split("T")[1].split(":")[1]}
                        </Text>
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              )}
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
                      Your Question
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
                      Counselor in charge
                    </Text>
                    {info?.counselor !== null ? (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => (
                          setOpenExtendInfo(true),
                          setExtendInfo(info?.counselor)
                        )}
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
                                uri: info?.counselor?.profile?.avatarLink,
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
                                  info?.counselor?.profile?.gender == "MALE"
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
                            {info?.counselor?.profile?.fullName}
                          </Text>
                          <Text
                            style={{
                              fontSize: 20,
                              fontWeight: "500",
                              color: "#333",
                              marginBottom: 2,
                            }}
                          >
                            {info?.counselor?.major?.name ||
                              info?.counselor?.expertise?.name}
                          </Text>
                          <Text
                            style={{
                              fontSize: 16,
                              color: "grey",
                              marginBottom: 2,
                            }}
                          >
                            Email: {info?.counselor?.email}
                          </Text>
                          <Text
                            style={{
                              fontSize: 16,
                              color: "grey",
                            }}
                          >
                            Phone: {info?.counselor?.profile?.phoneNumber}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <Text
                        style={{
                          fontSize: 20,
                          color: "#333",
                          fontWeight: "500",
                          opacity: 0.7,
                        }}
                      >
                        No one has taken this question yet
                      </Text>
                    )}
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
                        Counselor's Answer
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
                          There's no answer yet
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
                        Reason
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
                      onPress={() => {
                        setOpenEditQuestion(true);
                        setSelectedQuestion(info);
                        setTitle(info?.title);
                        setContent(
                          info?.content
                            .split(
                              '<p style="font-size: 16px; font-weight: 400;">'
                            )[1]
                            ?.split("</p>")[0] || ""
                        );
                        const imgTag = info?.content.includes('<img src="')
                          ? info?.content.split('<img src="')[1]?.split('"')[0]
                          : null;

                        if (imgTag) {
                          setImage({
                            uri: imgTag,
                            // base64: imgTag.split(",")[1] || null,
                          });
                        } else {
                          setImage(null);
                        }
                        setCounselorType(info?.questionType);
                        setOpenPreview(true);
                      }}
                      style={{
                        width: "49%",
                        marginRight: 8,
                        marginBottom: 8,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        backgroundColor: "#F39300",
                        borderRadius: 10,
                        borderWidth: 1.5,
                        borderColor: "#F39300",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <MaterialIcons name="edit-note" size={24} color="white" />
                      <Text
                        style={{
                          fontWeight: "500",
                          color: "white",
                          fontSize: 20,
                          marginLeft: 4,
                        }}
                      >
                        Edit
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => (
                        setOpenDeleteConfirm(true), setSelectedQuestion(info)
                      )}
                      style={{
                        width: "49%",
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
                      <Ionicons name="trash" size={24} color="red" />
                      <Text
                        style={{
                          fontWeight: "500",
                          color: "red",
                          fontSize: 20,
                          marginLeft: 4,
                        }}
                      >
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                {/* {info.status == "VERIFIED" &&
                  info.closed == false &&
                  info.taken == false &&
                  info.answer !== null && (
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
                  )} */}
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          transparent={true}
          visible={openInfo2}
          animationType="slide"
          onRequestClose={() => setOpenInfo2(false)}
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
                    onPress={() => (setInfo2(""), setOpenInfo2(false))}
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
                      {info2?.title}
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
                      Your Question
                    </Text>
                    {/* <Text
                      style={{
                        fontSize: 20,
                        color: "#333",
                        fontWeight: "500",
                        opacity: 0.7,
                      }}
                    >
                      {info2?.content}
                    </Text> */}
                    {renderContent(info2?.content || info2?.question)}
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
                      Counselor
                    </Text>
                    {info2?.counselor !== null ? (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => (
                          setOpenExtendInfo(true),
                          setExtendInfo(info2?.counselor)
                        )}
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
                                uri: info2?.counselor?.profile?.avatarLink,
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
                                  info2?.counselor?.profile?.gender == "MALE"
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
                            {info2?.counselor?.profile?.fullName}
                          </Text>
                          <Text
                            style={{
                              fontSize: 20,
                              fontWeight: "500",
                              color: "#333",
                              marginBottom: 2,
                            }}
                          >
                            {info2?.counselor?.major?.name ||
                              info2?.counselor?.expertise?.name}
                          </Text>
                          <Text
                            style={{
                              fontSize: 16,
                              color: "grey",
                              marginBottom: 2,
                            }}
                          >
                            Email: {info2?.counselor?.email}
                          </Text>
                          <Text
                            style={{
                              fontSize: 16,
                              color: "grey",
                            }}
                          >
                            Phone: {info2?.counselor?.profile?.phoneNumber}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <Text
                        style={{
                          fontSize: 20,
                          color: "#333",
                          fontWeight: "500",
                          opacity: 0.7,
                        }}
                      >
                        No one has taken this question yet
                      </Text>
                    )}
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
                      Counselor's Answer
                    </Text>
                    {renderContent(info2?.answer)}
                  </View>
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
                        uri: selectedQuestion?.counselor?.profile?.avatarLink,
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
                        {selectedQuestion?.counselor?.profile?.fullName
                          ?.length > 24
                          ? selectedQuestion?.counselor?.profile?.fullName.substring(
                              0,
                              24
                            ) + "..."
                          : selectedQuestion?.counselor?.profile?.fullName}
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
                          chat.sender.role !== "STUDENT"
                            ? "row"
                            : "row-reverse",
                        alignItems: "flex-start",
                        marginTop: isConsecutiveMessage ? 4 : 16,
                      }}
                    >
                      {chat.sender.role !== "STUDENT" &&
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
                          minWidth: "30%",
                          maxWidth: "75%",
                          backgroundColor:
                            chat.sender.role !== "STUDENT"
                              ? "white"
                              : "#F39300",
                          padding: 12,
                          marginLeft:
                            chat.sender.role !== "STUDENT" &&
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
                              chat.sender.role !== "STUDENT"
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
                              chat.sender.role !== "STUDENT" ? "gray" : "white",
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
