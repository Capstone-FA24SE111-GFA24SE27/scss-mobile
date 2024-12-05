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
import { Dropdown } from "react-native-element-dropdown";
import { SocketContext } from "../../context/SocketContext";
import { QASkeleton } from "../../layout/Skeleton";
import Pagination from "../../layout/Pagination";
import Toast from "react-native-toast-message";
import { FilterAccordion, FilterToggle } from "../../layout/FilterSection";
import * as ImagePicker from "expo-image-picker";
import RenderHTML from "react-native-render-html";
import ExtendInfoModal from "../../layout/ExtendInfoModal";
import { AuthContext } from "../../context/AuthContext";

export default function QA() {
  const navigation = useNavigation();
  const { width, height } = Dimensions.get("screen");
  const { userData } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const socket = useContext(SocketContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    categoryId: "",
    sortDirection: "",
  });
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [status, setStatus] = useState("");
  const statusList = [{ name: "UNVERIFIED" }, { name: "VERIFIED" }];
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [sortDirection, setSortDirection] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [expanded2, setExpanded2] = useState(false);
  const [expanded3, setExpanded3] = useState(false);
  const [openInfo, setOpenInfo] = useState(false);
  const [info, setInfo] = useState({});
  const [openExtendInfo, setOpenExtendInfo] = useState(false);
  const [extendInfo, setExtendInfo] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [openCreate, setOpenCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [content2, setContent2] = useState("");
  const [image, setImage] = useState(null);
  const [openPreview, setOpenPreview] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const scrollViewRef = useRef(null);

  useFocusEffect(
    React.useCallback(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
      }
      fetchData(filters, {query: debouncedKeyword, page: currentPage });
      fetchCategory();
    }, [debouncedKeyword, filters, currentPage])
  );

  const fetchData = async (filters = {}) => {
    try {
      const questionsRes = await axiosJWT.get(
        `${BASE_URL}/contribution-question-cards/search`,
        {
          params: {
            query: debouncedKeyword,
            ...filters,
            page: currentPage,
          },
        }
      );
      const questionsData = questionsRes?.data?.content || [];
      setQuestions(questionsData);
    } catch (err) {
      console.log("Can't fetch questions", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategory = async () => {
    try {
      const categoriesRes = await axiosJWT.get(
        `${BASE_URL}/contribution-question-cards/categories`
      );
      const categoriesData = categoriesRes?.data?.content || [];
      setCategories(categoriesData);
    } catch (err) {
      console.log("Can't fetch categories", err);
    }
  };

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
      categoryId: category?.id,
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
      categoryId: "",
      sortDirection: "",
    };
    setKeyword("");
    setStatus(resetFilters.status);
    setCategory(resetFilters.categoryId);
    setSortDirection(resetFilters.sortDirection);
    setFilters(resetFilters);
    fetchData(resetFilters);
    setIsExpanded(false);
  };

  useEffect(() => {
    fetchData();
  }, [debouncedKeyword]);

  useEffect(() => {
    setLoading(true);
    fetchData({ ...filters, page: currentPage });
    setTimeout(() => setLoading(false), 1500);
  }, [currentPage]);

  const selectImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert("You've refused to allow this app to access your photos!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      allowsEditing: false,
      quality: 0.75,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0];
      setImage({
        uri: selectedImage.uri,
        base64: selectedImage.base64,
      });
    }
  };

  const renderPreviewContent = () => {
    return (
      <RenderHTML
        source={{
          html: `<div style="margin-top: -24px"><p style="font-size: 16px; font-weight: 400;">${content}</p>${
            image
              ? `<img src="data:image/jpeg;base64,${
                  image.base64
                }" style="max-width: ${width * 0.85}px; height: auto;">`
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

  const handleCreateQuestion = async () => {
    try {
      const imageHTML = image
        ? `<img src="data:image/jpeg;base64,${
            image.base64
          }" style="max-width: ${width * 0.85}px; height: auto;">`
        : "";
      const finalContent = `<div style="margin-top: -24px"><p style="font-size: 16px; font-weight: 400;">${content}</p>${imageHTML}</div>`;
      const response = await axiosJWT.post(
        `${BASE_URL}/contribution-question-cards`,
        {
          title: title,
          question: finalContent,
          answer: content2,
          categoryId: selectedCategory?.id,
          counselorId: userData?.id,
        }
      );
      const data = await response.data;
      if (data && data.status == 200) {
        setOpenCreate(false);
        setOpenConfirm(false);
        setTitle("");
        setContent("");
        setContent2("");
        setCategory("");
        setImage(null);
        setOpenPreview(false);
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
              height: 50,
            }}
          >
            <Ionicons
              name="search"
              size={24}
              style={{ marginRight: 10, color: "#F39300", opacity: 0.7 }}
            />
            <TextInput
              placeholder="Search Question"
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
              <TouchableOpacity
                activeOpacity={0.7}
                style={{
                  backgroundColor: "#F39300",
                  borderRadius: 40,
                  padding: 8,
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "row",
                  marginRight: 8,
                }}
                onPress={() => setOpenCreate(true)}
              >
                <Ionicons name="add" size={26} style={{ color: "white" }} />
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
                    minWidth: "30%",
                  }}
                >
                  Category:
                </Text>
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
                <Dropdown
                  style={{
                    backgroundColor: "white",
                    borderColor: expanded2 ? "#F39300" : "black",
                    flex: 1,
                    height: 30,
                    borderWidth: 1,
                    borderColor: "grey",
                    borderRadius: 10,
                    paddingHorizontal: 12,
                  }}
                  placeholderStyle={{ fontSize: 14 }}
                  selectedTextStyle={{
                    fontSize: 14,
                    color: category ? "black" : "white",
                  }}
                  inputSearchStyle={{ height: 40, fontSize: 16 }}
                  maxHeight={250}
                  data={categories}
                  labelField="name"
                  search
                  value={category !== "" ? category?.name : "Select Category"}
                  placeholder={
                    category !== "" ? category?.name : "Select Category"
                  }
                  searchPlaceholder="Search Category"
                  onFocus={() => setExpanded2(true)}
                  onBlur={() => setExpanded2(false)}
                  onChange={(item) => {
                    setCategory(item);
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
                            item.name == category?.name ? "#F39300" : "white",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "500",
                            color:
                              item.name == category?.name ? "white" : "black",
                          }}
                        >
                          {item.name}
                        </Text>
                        {item.name == category?.name && (
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
              <View
                key={question.id}
                style={{
                  padding: 16,
                  marginVertical: 8,
                  backgroundColor: "white",
                  borderRadius: 20,
                  elevation: 1,
                  position: "relative",
                  borderWidth: 1.5,
                  borderColor: "#F39300",
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
                    </View>
                    <TouchableOpacity
                      hitSlop={10}
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
                <View style={{ flexDirection: "row", alignItems: "center" }}>
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
                      {question.category.type}
                    </Text>
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
                  Create Question
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
                    borderRadius: 8,
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
                    borderRadius: 8,
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
                        Imported Image URI
                      </Text>
                      <TouchableOpacity
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
                      </TouchableOpacity>
                    </View>
                    <Text>{image?.uri}</Text>
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
                  Category <Text style={{ color: "#F39300" }}>*</Text>
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
                    color: selectedCategory ? "black" : "white",
                  }}
                  maxHeight={150}
                  data={[{ name: "Clear" }, ...categories]}
                  labelField="name"
                  search
                  value={
                    selectedCategory !== ""
                      ? selectedCategory.name
                      : "Select Category"
                  }
                  placeholder={
                    selectedCategory !== ""
                      ? selectedCategory.name
                      : "Select Category"
                  }
                  searchPlaceholder="Search Category"
                  onFocus={() => setExpanded3(true)}
                  onBlur={() => setExpanded3(false)}
                  onChange={(item) => {
                    if (item.name === "Clear") {
                      setSelectedCategory("");
                    } else {
                      setSelectedCategory(item);
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
                            item.name == selectedCategory.name
                              ? "#F39300"
                              : "white",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "500",
                            color:
                              item.name == selectedCategory.name
                                ? "white"
                                : item.name == "Clear"
                                ? "red"
                                : "black",
                          }}
                        >
                          {item.name}
                        </Text>
                        {item.name === selectedCategory.name &&
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
                <Text
                  style={{ fontSize: 16, fontWeight: "bold", color: "#333" }}
                >
                  Your answer <Text style={{ color: "#F39300" }}>*</Text>
                </Text>
                <TextInput
                  placeholder="Write your answer here"
                  value={content2}
                  onChangeText={(value) => setContent2(value)}
                  style={{
                    borderColor: "#ccc",
                    borderWidth: 1,
                    borderRadius: 8,
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
              </ScrollView>
              <TouchableOpacity
                activeOpacity={0.7}
                disabled={
                  title === "" ||
                  content === "" ||
                  content2 === "" ||
                  selectedCategory === ""
                }
                style={{
                  backgroundColor:
                    title === "" ||
                    content === "" ||
                    content2 === "" ||
                    selectedCategory === ""
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
                      content2 === "" ||
                      selectedCategory === ""
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
                Create Question Confirmation
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  marginBottom: 30,
                  textAlign: "center",
                }}
              >
                Are you sure you want to create this question?
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
                      {info?.question}
                    </Text> */}
                    {renderContent(info?.question)}
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
                      Created by
                    </Text>
                    {info?.counselor !== null ? (
                      <TouchableOpacity
                        onPress={() => (
                          setOpenExtendInfo(true),
                          setExtendInfo(info?.counselor)
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
                      Answer
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
                        There's no answer yet
                      </Text>
                    )}
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
      </View>
    </>
  );
}
