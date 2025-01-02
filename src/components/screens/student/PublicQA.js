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
import { SocketContext } from "../../context/SocketContext";
import { QASkeleton } from "../../layout/Skeleton";
import Pagination from "../../layout/Pagination";
import { FilterAccordion, FilterToggle } from "../../layout/FilterSection";
import RenderHTML from "react-native-render-html";
import ExtendInfoModal from "../../layout/ExtendInfoModal";
import { AuthContext } from "../../context/AuthContext";

export default function PublicQA() {
  const navigation = useNavigation();
  const { width, height } = Dimensions.get("screen");
  const { userData } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const socket = useContext(SocketContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    type: null,
    sortDirection: "",
  });
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [type, setType] = useState(null);
  const [sortDirection, setSortDirection] = useState("");
  const [openInfo, setOpenInfo] = useState(false);
  const [info, setInfo] = useState({});
  const [openExtendInfo, setOpenExtendInfo] = useState(false);
  const [extendInfo, setExtendInfo] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const scrollViewRef = useRef(null);

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
      const questionsRes = await axiosJWT.get(
        `${BASE_URL}/question-cards/filter`,
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
    } catch (err) {
      console.log("Can't fetch questions", err);
    } finally {
      setLoading(false);
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
      type: null,
      sortDirection: "",
    };
    setKeyword("");
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

  const renderContent = (source) => {
    return (
      <RenderHTML
        source={{
          html: source,
        }}
        tagsStyles={{
          body: {
            fontSize: 16,
            marginTop: -4,
          },
          p: {
            fontSize: 16,
          },
          img: {
            marginTop: 12,
          },
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
                            marginLeft: 8,
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
                      {/* <View
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
                      </View> */}
                      <View
                        style={{
                          backgroundColor: "#F39300",
                          alignItems: "center",
                          justifyContent: "center",
                          flexDirection: "row",
                          paddingVertical: 4,
                          paddingHorizontal: 8,
                          // marginLeft: 8,
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
                      {/* {question.closed == true && (
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
                      )} */}
                    </View>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
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
          visible={openInfo}
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
                        fontWeight: "bold",
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
                      Content
                    </Text>
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
