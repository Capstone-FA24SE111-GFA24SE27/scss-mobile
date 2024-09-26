import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  ScrollView,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  Agenda,
  AgendaList,
  CalendarProvider,
  ExpandableCalendar,
} from "react-native-calendars";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import axiosJWT, { BASE_URL } from "../../config/Config";
import { useFocusEffect } from "@react-navigation/native";

export default function Schedule() {
  const { width, height } = Dimensions.get("screen");
  const [items, setItems] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [openInfo, setOpenInfo] = useState(false);
  const [openFeedback, setOpenFeedback] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [info, setInfo] = useState({});
  const [rating, setRating] = useState(0);
  const [value, setValue] = useState("");

  useEffect(() => {
    console.log(items);
  }, [items]);

  useFocusEffect(
    React.useCallback(() => {
      const date = new Date(selectedDate);
      const dayOfWeek = date.getDay();

      const startDate = new Date(
        date.getTime() - dayOfWeek * 24 * 60 * 60 * 1000
      );
      const endDate = new Date(
        date.getTime() + (6 - dayOfWeek) * 24 * 60 * 60 * 1000
      );

      const fromDate = startDate.toISOString().split("T")[0];
      const toDate = endDate.toISOString().split("T")[0];
      if (fromDate && toDate) {
        fetchData(fromDate, toDate);
      }
    }, [selectedDate])
  );

  const formatDate = (value) => {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  };

  const fetchData = async (fromDate, toDate) => {
    try {
      if (!fromDate || !toDate) return;
      console.log(fromDate, "|", toDate);

      const scheduleRes = await axiosJWT.get(
        `${BASE_URL}/booking-counseling/appointment?fromDate=${fromDate}&toDate=${toDate}`
      );

      const data = scheduleRes?.data;
      console.log(data);
      if (data.status === 200) {
        const formattedItems = data?.content?.reduce((acc, appointment) => {
          const date = appointment?.startDateTime.split("T")[0];
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push({
            id: appointment?.id,
            date: formatDate(date),
            startTime: appointment?.startDateTime.split("T")[1].slice(0, 5),
            endTime: appointment?.endDateTime.split("T")[1].slice(0, 5),
            meetingType: appointment?.meetingType,
            place:
              appointment?.meetingType === "ONLINE"
                ? `${appointment?.meetUrl}`
                : `${appointment?.address}`,
            counselorName: appointment?.counselorInfo?.fullName || "No name",
            counselorImage:
              appointment?.counselorInfo?.avatarLink || "Image-url",
            status: appointment?.status,
            feedback: appointment?.appointmentFeedback,
          });
          return acc;
        }, {});

        const items = Object.keys(formattedItems).map((date) => ({
          title: date,
          data: formattedItems[date],
        }));

        setItems(items);

        const marked = {};
        items.forEach((item) => {
          marked[item.title] = {
            marked: true,
            dotColor: selectedDate === item.title ? "white" : "#F39300",
          };
        });
        setMarkedDates(marked);
      } else {
        Alert.alert("Error", "Failed to fetch data");
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  const error = console.error;
  console.error = (...args) => {
    if (/defaultProps/.test(args[0])) return;
    error(...args);
  };

  const handleOpenInfo = (info) => {
    setInfo(info);
    setOpenInfo(true);
  };

  const handleOpenFeedback = async (id) => {
    setOpenFeedback(true);
    setSelectedAppointment(id);
  };

  const handleTakeFeedback = async () => {
    try {
      const response = await axiosJWT.post(
        `${BASE_URL}/booking-counseling/feedback/${selectedAppointment}`,
        {
          rating: rating,
          comment: value,
        }
      );
      const data = await response.data;
      if (data && data.status == 200) {
        setInfo({
          ...info,
          feedback: {
            rating: rating,
            comment: value,
            createdAt: new Date().toISOString().split("T")[0],
          },
        });
        handleCloseFeedback();
      }
    } catch {
      console.error("Something error", error);
    }
  };

  const handleCloseFeedback = () => {
    setSelectedAppointment(null);
    setRating(0);
    setValue(null);
    setOpenFeedback(false);
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay();

    const startDate = new Date(
      date.getTime() - dayOfWeek * 24 * 60 * 60 * 1000
    );
    const endDate = new Date(
      date.getTime() + (6 - dayOfWeek) * 24 * 60 * 60 * 1000
    );

    const fromDate = startDate.toISOString().split("T")[0];
    const toDate = endDate.toISOString().split("T")[0];
    if (fromDate && toDate) {
      fetchData(fromDate, toDate);
    }
  };

  const handleCloseInfo = () => {
    setInfo("");
    setOpenInfo(false);
  };

  const renderItem = ({ item }) => (
    <>
      <TouchableOpacity
        onPress={() => handleOpenInfo(item)}
        activeOpacity={0.8}
        style={{
          backgroundColor: "white",
          padding: 16,
          borderRadius: 10,
          margin: 8,
          elevation: 3,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Image
            source={{ uri: item.counselorImage }}
            style={{
              width: width * 0.14,
              height: width * 0.14,
              borderRadius: width * 0.07,
              marginRight: 16,
              borderWidth: 1.5,
              borderColor: "#F39300",
            }}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "black",
              }}
            >
              {item.counselorName}
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                color: "#555",
                marginTop: 4,
              }}
            >
              {item.startTime} - {item.endTime}
            </Text>
          </View>
          <View
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
            }}
          >
            <View
              style={{
                backgroundColor: "#fdfdfd",
                borderRadius: 20,
                paddingVertical: 6,
                borderWidth: 1,
                borderColor: "#F39300",
                paddingHorizontal: 12,
                flexDirection: "row",
                elevation: 1,
              }}
            >
              <Text
                style={[
                  { fontSize: 16, fontWeight: "bold" },
                  item.status === "ATTEND" && { color: "green" },
                  item.status === "WAITING" && { color: "#F39300" },
                  item.status === "ABSENT" && { color: "red" },
                  item.status === "CANCELED" && { color: "gray" },
                ]}
              >
                {item.status}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </>
  );

  return (
    <>
      <View style={{ backgroundColor: "#f5f7fd", flex: 1 }}>
        <View style={{ flex: 1, marginTop: 30 }}>
          <CalendarProvider
            date={selectedDate}
            onDateChanged={(date) => setSelectedDate(date)}
          >
            <ExpandableCalendar
              firstDay={0}
              markedDates={markedDates}
              hideKnob
              disablePan
              initialPosition="close"
              theme={{
                selectedDayBackgroundColor: "#F39300",
                selectedDayTextColor: "white",
                arrowColor: "#F39300",
                textDayHeaderFontSize: 14,
                textDayFontSize: 16,
                todayTextColor: "#F39300",
              }}
              style={{
                elevation: 1,
              }}
              renderArrow={(direction) => {
                return direction === "left" ? (
                  <Ionicons name="chevron-back" size={22} color="#F39300" />
                ) : (
                  <Ionicons name="chevron-forward" size={22} color="#F39300" />
                );
              }}
            />
            <AgendaList
              sections={items}
              renderItem={renderItem}
              style={{ marginTop: 8 }}
              sectionStyle={{
                color: "#F39300",
                backgroundColor: "#f5f7fd",
                fontSize: 16,
                marginHorizontal: 10,
                paddingTop: 12,
                paddingBottom: 4,
              }}
            />
          </CalendarProvider>
          <Modal
            transparent={true}
            visible={openInfo}
            animationType="slide"
            onRequestClose={handleCloseInfo}
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
                    marginTop: 16,
                    marginBottom: 8,
                    borderRadius: 20,
                    alignSelf: "flex-start",
                    alignItems: "flex-start",
                  }}
                  onPress={handleCloseInfo}
                >
                  <Ionicons name="chevron-back" size={28} />
                </TouchableOpacity>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={{ alignItems: "center" }}>
                    <Image
                      source={{ uri: info.counselorImage }}
                      style={{
                        width: width * 0.32,
                        height: width * 0.32,
                        borderRadius: 100,
                        marginBottom: 8,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 24,
                        fontWeight: "bold",
                        marginBottom: 30,
                      }}
                    >
                      {info.counselorName}
                    </Text>
                  </View>
                  <View
                    style={{
                      marginHorizontal: 20,
                      borderRadius: 20,
                      backgroundColor: "white",
                      paddingVertical: 12,
                      paddingHorizontal: 20,
                      borderWidth: 1.5,
                      borderColor: "lightgrey",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginVertical: 12,
                      }}
                    >
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Ionicons name="calendar" size={24} color="#F39300" />
                        <Text
                          style={{
                            fontSize: 18,
                            color: "gray",
                            fontWeight: "500",
                            marginLeft: 10,
                          }}
                        >
                          Date
                        </Text>
                      </View>
                      <View>
                        <Text
                          style={{
                            fontSize: 18,
                            color: "black",
                            fontWeight: "500",
                          }}
                        >
                          {info.date}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        borderTopWidth: 1,
                        borderColor: "lightgrey",
                        marginVertical: 4,
                      }}
                    />
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginVertical: 12,
                      }}
                    >
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Ionicons name="time" size={24} color="#F39300" />
                        <Text
                          style={{
                            fontSize: 18,
                            color: "gray",
                            fontWeight: "500",
                            marginLeft: 10,
                          }}
                        >
                          Time
                        </Text>
                      </View>
                      <View>
                        <Text
                          style={{
                            fontSize: 18,
                            color: "black",
                            fontWeight: "500",
                          }}
                        >
                          {info.startTime} - {info.endTime}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        borderTopWidth: 1,
                        borderColor: "lightgrey",
                        marginVertical: 4,
                      }}
                    />
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginVertical: 12,
                      }}
                    >
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <MaterialIcons
                          name="meeting-room"
                          size={24}
                          color="#F39300"
                        />
                        <Text
                          style={{
                            fontSize: 18,
                            color: "gray",
                            fontWeight: "500",
                            marginLeft: 10,
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
                          {info.meetingType}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        borderTopWidth: 1,
                        borderColor: "lightgrey",
                        marginVertical: 4,
                      }}
                    />
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginVertical: 12,
                      }}
                    >
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        {info.meetingType === "ONLINE" && (
                          <Ionicons name="videocam" size={24} color="#F39300" />
                        )}
                        {info.meetingType === "OFFLINE" && (
                          <MaterialIcons
                            name="place"
                            size={24}
                            color="#F39300"
                          />
                        )}

                        <Text
                          style={{
                            fontSize: 18,
                            color: "gray",
                            fontWeight: "500",
                            marginLeft: 10,
                          }}
                        >
                          {info.meetingType === "ONLINE"
                            ? "Meet URL"
                            : "Address"}
                        </Text>
                      </View>
                      <View style={{ flexDirection: "row", maxWidth: "50%" }}>
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: "bold",
                            color: "black",
                          }}
                        >
                          {info.place}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {info?.feedback !== null ? (
                    <View
                      style={{
                        margin: 20,
                        borderRadius: 20,
                        backgroundColor: "white",
                        padding: 16,
                        borderWidth: 1.5,
                        borderColor: "#E0E0E0",
                        elevation: 5,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
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
                          style={{
                            fontSize: 16,
                            fontWeight: "bold",
                            color: "#333",
                          }}
                        >
                          {formatDate(info?.feedback?.createdAt)}
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: "#F39300",
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 16,
                          }}
                        >
                          <Ionicons name="star" size={16} color="white" />
                          <Text
                            style={{
                              fontSize: 16,
                              marginLeft: 6,
                              fontWeight: "bold",
                              color: "white",
                            }}
                          >
                            {info?.feedback?.rating.toFixed(1)}
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={{
                          fontSize: 18,
                          color: "#555",
                          fontWeight: "500",
                          lineHeight: 24,
                        }}
                      >
                        {info?.feedback?.comment}
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={{
                        margin: 20,
                        borderRadius: 20,
                        backgroundColor: "white",
                        padding: 16,
                        borderWidth: 1.5,
                        borderColor: "lightgrey",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 18,
                          color: "black",
                          fontWeight: "500",
                        }}
                      >
                        There's no feedback yet
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleOpenFeedback(info.id)}
                        activeOpacity={0.6}
                      >
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: "bold",
                            color: "#F39300",
                            textDecorationLine: "underline",
                          }}
                        >
                          Leave a Review
                        </Text>
                      </TouchableOpacity>
                      <Modal
                        transparent={true}
                        visible={openFeedback}
                        animationType="slide"
                        onRequestClose={handleCloseFeedback}
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
                                marginVertical: 12,
                                textAlign: "center",
                              }}
                            >
                              Write a Review
                            </Text>
                            <View style={{ marginVertical: 8 }}>
                              <Text
                                style={{
                                  fontSize: 18,
                                  fontWeight: "600",
                                  marginBottom: 8,
                                }}
                              >
                                What do you think?
                              </Text>
                              <TextInput
                                placeholder="Type message here..."
                                placeholderTextColor="gray"
                                keyboardType="default"
                                multiline={true}
                                numberOfLines={2}
                                value={value}
                                onChangeText={(value) => setValue(value)}
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
                            </View>
                            <View style={{ marginVertical: 8 }}>
                              <Text
                                style={{
                                  fontSize: 18,
                                  fontWeight: "600",
                                  marginBottom: 8,
                                }}
                              >
                                Give a rating
                              </Text>
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                }}
                              >
                                {[1, 2, 3, 4, 5].map((star, index) => (
                                  <TouchableOpacity
                                    key={index}
                                    activeOpacity={0.6}
                                    onPress={() => setRating(star)}
                                  >
                                    <Ionicons
                                      name="star"
                                      size={24}
                                      color={
                                        rating >= star ? "#F39300" : "gray"
                                      }
                                      style={{ marginHorizontal: 2 }}
                                    />
                                  </TouchableOpacity>
                                ))}
                              </View>
                            </View>
                            <View
                              style={{
                                flexDirection: "row",
                                justifyContent: "flex-end",
                                alignItems: "flex-end",
                                marginTop: 8,
                              }}
                            >
                              <TouchableOpacity
                                style={{
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
                                onPress={handleCloseFeedback}
                              >
                                <Text
                                  style={{
                                    fontSize: 18,
                                    fontWeight: "bold",
                                    color: "black",
                                  }}
                                >
                                  Cancel
                                </Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={{
                                  backgroundColor: "#F39300",
                                  paddingHorizontal: 12,
                                  paddingVertical: 6,
                                  borderRadius: 10,
                                  justifyContent: "center",
                                  alignItems: "center",
                                  borderWidth: 1,
                                  borderColor: "#F39300",
                                }}
                                onPress={handleTakeFeedback}
                              >
                                <Text
                                  style={{
                                    fontSize: 18,
                                    fontWeight: "bold",
                                    color: "white",
                                  }}
                                >
                                  Save
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      </Modal>
                    </View>
                  )}
                </ScrollView>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </>
  );
}

{
  /* <Calendar
            style={{
              marginHorizontal: 12,
              padding: 10,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "#F39300",
            }}
            enableSwipeMonths
            arrowsHitSlop={4}
            renderArrow={(direction) => {
              return direction === "left" ? (
                <Ionicons name="caret-back-circle-outline" size={30} color="#F39300" />
              ) : (
                <Ionicons name="caret-forward-circle-outline" size={30} color="#F39300"/>
              );
            }}
            theme={{
              monthTextColor: "#F39300",
              textMonthFontSize: 24,
              textMonthFontWeight: "bold",
              // arrowColor: "#F39300",
              calendarBackground: "#ffe4ec",
              dayTextColor: "black",
              textInactiveColor: "#adadad",
              todayTextColor: "#F39300",
              textSectionTitleColor: "#F39300",
              textDayHeaderFontSize: 14,
              textDayFontSize: 14,
              textDayFontWeight: "semibold",
              textDisabledColor: "#adadad",
            }}
            markingType="period"
            markedDates={{
              // Default markingType
              // '2024-09-15': {selected: true, marked: true, selectedColor: '#F39300'},

              // *Multi-dot
              // '2024-09-16': {selected: true, dots: [{key: 'running', color: 'red', selectedDotColor: 'yellow'}, {key: 'lifting', color: 'blue', selectedDotColor: 'green'}] , selectedColor: "#F39300", selectedTextColor: "white"},

              // *Period
              "2024-09-22": {
                startingDay: true,
                color: "#F39300",
                textColor: "white",
              },
              "2024-09-23": { color: "#FA9F54FF", textColor: "white" },
              "2024-09-24": { color: "#FF9C4BFF", textColor: "white" },
              "2024-09-25": {
                endingDay: true,
                color: "#F39300",
                textColor: "white",
              },
            }}
          /> */
}
