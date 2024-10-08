import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
  Modal,
  FlatList,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axiosJWT, { BASE_URL } from "../../config/Config";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import RNDateTimePicker from "@react-native-community/datetimepicker";

export default function Event() {
  const navigation = useNavigation();
  const { width, height } = Dimensions.get("screen");
  const scrollViewRef = useRef(null);
  useFocusEffect(
    React.useCallback(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
      }
      fetchData(filters);
    }, [filters])
  );

  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    semesterId: null,
    sortDirection: "",
  });
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [semester, setSemester] = useState(null);
  const [sortDirection, setSortDirection] = useState("");
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState({});

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDateShort = (date) => {
    const d = new Date(date);
    const month = d.toLocaleString("default", { month: "short" });
    const day = d.getDate();
    return `${month} ${day}`;
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
                  paddingHorizontal: 20,
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

  const fetchData = async (filters = {}) => {
    try {
      const eventRes = await axiosJWT.get(`${BASE_URL}/events`, {
        params: {
          keyword: debouncedKeyword,
          ...filters,
        },
      });
      const eventData = eventRes?.data?.content || [];
      setEvents(eventData);
      console.log(events);
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
      dateFrom: dateFrom,
      dateTo: dateTo,
      sortDirection: sortDirection,
    };
    setFilters(newFilters);
    fetchData(newFilters);
  };

  const cancelFilters = () => {
    const resetFilters = {
      dateFrom: "",
      dateTo: "",
      sortDirection: "",
    };
    setDateFrom(resetFilters.dateFrom);
    setDateTo(resetFilters.dateTo);
    setSortDirection(resetFilters.sortDirection);
    setFilters(resetFilters);
    fetchData(resetFilters);
  };

  useEffect(() => {
    fetchData();
  }, [debouncedKeyword]);

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

  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slideRef = useRef(null);
  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;
  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  useEffect(() => {
    const interval = setInterval(() => {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= selectedEvent?.contentImages?.length) {
        nextIndex = 0;
      }

      slideRef.current?.scrollToOffset({
        offset: nextIndex * width,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    }, 3000);
    return () => clearInterval(interval);
  }, [currentIndex, selectedEvent?.contentImages?.length, scrollX]);

  const register = async (id) => {
    try {
      const eventRes = await axiosJWT.get(`${BASE_URL}/events/${id}`);
      const eventData = eventRes?.data?.content || [];
      setSelectedEvent(eventData);
      setOpen(true);
    } catch (err) {
      console.log(err);
    }
  };

  const cancelRegister = () => {
    setSelectedEvent({});
    setOpen(false);
    fetchData(filters);
  };

  return (
    <>
      <View style={{ backgroundColor: "#f5f7fd", flex: 1 }}>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            paddingHorizontal: 30,
            paddingTop: 25,
            paddingVertical: 10,
          }}
        />
        <View
          style={{
            flexDirection: "row",
            marginHorizontal: 25,
            marginBottom: 10,
            alignItems: "center",
          }}
        >
          <View
            style={{
              flex: 0.85,
              flexDirection: "row",
              borderRadius: 30,
              paddingHorizontal: 16,
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
              placeholder="Search Events"
              placeholderTextColor="#F39300"
              value={keyword}
              onChangeText={(value) => setKeyword(value)}
              style={{
                flex: 1,
                fontSize: 18,
                opacity: 0.8,
              }}
            />
          </View>
          <View
            style={{
              flex: 0.15,
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
              <Animated.View style={{ transform: [{ rotate: rotateIcon }] }}>
                <Ionicons
                  name="filter"
                  size={26}
                  style={{ color: isExpanded ? "white" : "black" }}
                />
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{
            marginHorizontal: 30,
          }}
        >
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
                    paddingVertical: 8,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginLeft: 4,
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
                      <Text style={{ fontSize: 18, opacity: 0.8, flex: 1 }}>
                        {dateFrom !== "" ? dateFrom : "xxxx-xx-xx"}
                      </Text>
                      <TouchableOpacity onPress={() => setShowFromPicker(true)}>
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
                      <Text style={{ fontSize: 18, opacity: 0.8, flex: 1 }}>
                        {dateTo !== "" ? dateTo : "xxxx-xx-xx"}
                      </Text>
                      <TouchableOpacity onPress={() => setShowToPicker(true)}>
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
                      color: "black",
                    }}
                  >
                    Sort:
                  </Text>
                  <View style={{ flexDirection: "row", marginLeft: 4 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginHorizontal: 12,
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
        </View>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          style={{ marginHorizontal: 12, marginTop: 12 }}
        >
          {events.totalElements > 0 ? (
            <>
              {events?.data?.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  activeOpacity={0.7}
                  onPress={() => register(event.id)}
                  style={{
                    backgroundColor: "white",
                    borderRadius: 20,
                    marginBottom: 20,
                    overflow: "hidden",
                    elevation: 2,
                  }}
                >
                  <Image
                    source={{ uri: event.displayImage }}
                    style={{ height: width * 0.5 }}
                    resizeMode="cover"
                  />
                  <View
                    style={{
                      position: "absolute",
                      backgroundColor: "white",
                      top: 8,
                      left: 8,
                      padding: 8,
                      borderRadius: 10,
                      width: 50,
                      height: 50,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        color: "#F39300",
                        textAlign: "center",
                        fontWeight: "600",
                      }}
                    >
                      {
                        formatDateShort(
                          new Date(event.eventSchedules[0]?.startDate)
                            .toISOString()
                            .split("T")[0]
                        ).split(" ")[0]
                      }
                    </Text>
                    <Text
                      style={{
                        fontSize: 20,
                        color: "#F39300",
                        textAlign: "center",
                        fontWeight: "bold",
                        marginTop: -4,
                      }}
                    >
                      {
                        formatDateShort(
                          new Date(event.eventSchedules[0]?.startDate)
                            .toISOString()
                            .split("T")[0]
                        ).split(" ")[1]
                      }
                    </Text>
                    {/* <Ionicons name="eye" size={18} color="#F39300" />
                    <Text style={{fontSize: 20,
                        color: "#F39300",
                        textAlign: "center",
                        fontWeight: "bold",
                        marginTop: -4,}}>{event.view}</Text> */}
                  </View>
                  <View style={{ padding: 16 }}>
                    <Text
                      style={{
                        fontSize: 24,
                        fontWeight: "bold",
                        color: "black",
                        marginBottom: 12,
                      }}
                    >
                      {event.title}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <View
                        style={{
                          paddingVertical: 6,
                          paddingHorizontal: 10,
                          borderRadius: 20,
                          borderWidth: 1.5,
                          borderColor: "#F39300",
                          backgroundColor: "#FFF6EE",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            color: "#F39300",
                            fontWeight: "600",
                            textAlign: "center",
                          }}
                        >
                          {event.semester.name}
                        </Text>
                      </View>
                      <View
                        style={{
                          paddingVertical: 6,
                          paddingHorizontal: 10,
                          borderRadius: 10,
                          borderWidth: 1.5,
                          borderColor: "#F39300",
                          backgroundColor: "#fdfdfd",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <Ionicons name="eye" size={24} color="#F39300" />
                        <Text
                          style={{
                            fontSize: 18,
                            color: "#F39300",
                            fontWeight: "600",
                            marginLeft: 8,
                          }}
                        >
                          {event.view}
                        </Text>
                      </View>
                      {/* <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => register(event.id)}
                        style={{
                          backgroundColor: "#F39300",
                          borderRadius: 20,
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontWeight: "600",
                            color: "white",
                            fontSize: 16,
                            marginRight: 4,
                          }}
                        >
                          View Event
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color="white"
                        />
                      </TouchableOpacity> */}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              {/* <Text>There's no events available</Text> */}
            </View>
          )}
          <Modal
            transparent={true}
            visible={open}
            animationType="slide"
            onRequestClose={cancelRegister}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "flex-end",
                alignItems: "center",
                backgroundColor: "rgba(0, 0, 0, 0.2)",
              }}
            >
              {selectedEvent && (
                <ImageBackground
                  source={{ uri: selectedEvent.displayImage }}
                  resizeMode="cover"
                  style={{ flex: 1 }}
                  blurRadius={6}
                >
                  <View
                    style={{
                      width: "100%",
                      height: "100%",
                      // backgroundColor: "#f5f7fd",
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
                        position: "absolute",
                        top: 0,
                        left: 0,
                        zIndex: 2,
                      }}
                      onPress={cancelRegister}
                    >
                      <Ionicons name="chevron-back" size={28} />
                    </TouchableOpacity>
                    <ScrollView showsHorizontalScrollIndicator={false}>
                      <View>
                        <FlatList
                          data={selectedEvent?.contentImages}
                          renderItem={({ item }) => (
                            <Image
                              key={item.id}
                              source={{ uri: item.imageUrl }}
                              style={{
                                width: width,
                                height: height * 0.4,
                                marginBottom: 8,
                                alignItems: "center",
                                borderBottomLeftRadius: 20,
                                borderBottomRightRadius: 20
                              }}
                            />
                          )}
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          pagingEnabled
                          bounces={false}
                          keyExtractor={(item) => item.id}
                          onScroll={Animated.event(
                            [
                              {
                                nativeEvent: { contentOffset: { x: scrollX } },
                              },
                            ],
                            { useNativeDriver: false }
                          )}
                          scrollEventThrottle={32}
                          onViewableItemsChanged={viewableItemsChanged}
                          viewabilityConfig={viewConfig}
                          ref={slideRef}
                        />
                        <View
                          style={{
                            flexDirection: "row",
                            position: "absolute",
                            bottom: 20,
                            alignSelf: "center",
                          }}
                        >
                          {selectedEvent?.contentImages?.map((_, index) => {
                            const inputRange = [
                              (index - 1) * width,
                              index * width,
                              (index + 1) * width,
                            ];
                            const dotWidth = scrollX.interpolate({
                              inputRange,
                              outputRange: [10, 22, 10],
                              extrapolate: "clamp",
                            });
                            const dotOpacity = scrollX.interpolate({
                              inputRange,
                              outputRange: [0.3, 1, 0.3],
                              extrapolate: "clamp",
                            });
                            const dotScale = scrollX.interpolate({
                              inputRange,
                              outputRange: [0.8, 1.2, 0.8],
                              extrapolate: "clamp",
                            });
                            return (
                              <Animated.View
                                key={index}
                                style={{
                                  height: 10,
                                  width: dotWidth,
                                  borderRadius: 20,
                                  backgroundColor: "#F39300",
                                  marginHorizontal: 8,

                                  opacity: dotOpacity,
                                  transform: [{ scale: dotScale }],
                                }}
                              />
                            );
                          })}
                        </View>
                      </View>

                      <View
                        style={{
                          // backgroundColor: "white",
                          paddingHorizontal: 20,
                          paddingVertical: 16,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 16,
                          }}
                        >
                          <Text
                            style={{
                              flex: 0.8,
                              fontSize: 24,
                              fontWeight: "bold",
                              color: "white",
                            }}
                            numberOfLines={3}
                          >
                            {selectedEvent.title}
                          </Text>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "flex-end",
                              borderWidth: 1.5,
                              borderColor: "white",
                              borderRadius: 10,
                              paddingHorizontal: 8,
                              paddingVertical: 6,
                            }}
                          >
                            <Ionicons name="eye" size={26} color="white" />
                            <Text
                              style={{
                                fontSize: 20,
                                color: "white",
                                fontWeight: "600",
                                marginLeft: 8,
                              }}
                            >
                              {selectedEvent.view}
                            </Text>
                          </View>
                        </View>
                        <View
                          style={{
                            backgroundColor: "white",
                            padding: 16,
                            borderRadius: 12,
                            marginBottom: 20,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 22,
                              fontWeight: "600",
                              color: "black",
                              marginBottom: 12,
                            }}
                          >
                            About Event
                          </Text>
                          <Text
                            style={{
                              fontSize: 16,
                              color: "#666",
                              lineHeight: 24,
                            }}
                          >
                            {selectedEvent.content}
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            backgroundColor: "#f7f7f7",
                            padding: 12,
                            borderRadius: 12,
                            marginBottom: 16,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 18,
                              fontWeight: "600",
                              color: "#F39300",
                            }}
                          >
                            Video Preview
                          </Text>
                          <TouchableOpacity
                            style={{
                              backgroundColor: "white",
                              borderColor: "#F39300",
                              borderWidth: 1.5,
                              paddingVertical: 6,
                              paddingHorizontal: 16,
                              borderRadius: 8,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: "600",
                                color: "#F39300",
                              }}
                            >
                              View All
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <View  style={{
                            backgroundColor: "white",
                            padding: 16,
                            borderRadius: 12,
                            marginBottom: 20,
                          }}>
                          <Text>Time</Text>
                        </View>
                      </View>
                    </ScrollView>
                  </View>
                </ImageBackground>
              )}
            </View>
          </Modal>
        </ScrollView>
      </View>
    </>
  );
}
