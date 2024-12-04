import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Modal,
  ActivityIndicator,
  Animated,
} from "react-native";
import React, { useState, useEffect, useRef, useContext } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../context/AuthContext";
import { SocketContext } from "../../context/SocketContext";
import axiosJWT, { BASE_URL } from "../../../config/Config";
import { Ionicons } from "@expo/vector-icons";
import { Calendar, CalendarProvider } from "react-native-calendars";
import { Dropdown } from "react-native-element-dropdown";
import ErrorModal from "../../layout/ErrorModal";
import Toast from "react-native-toast-message";
import ExtendInfoModal from "../../layout/ExtendInfoModal";
import ConfirmBookingModal from "../../layout/ConfirmBookingModal";

export default function CounselorRand() {
  const navigation = useNavigation();
  const { width, height } = Dimensions.get("screen");
  const { userData, profile } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const scrollViewRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [progress, setProgress] = useState(new Animated.Value(0));
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;
  const [slots, setSlots] = useState([]);
  const [expertises, setExpertises] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [majors, setMajors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedSlot, setSelectedSlot] = useState("");
  const [type, setType] = useState("ACADEMIC");
  const [gender, setGender] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [expanded2, setExpanded2] = useState(false);
  const [expanded3, setExpanded3] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedMajor, setSelectedMajor] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [online, isOnline] = useState(null);
  const [reason, setReason] = useState("");
  const [matcher, setMatcher] = useState(null);
  const [error, setError] = useState(null);
  const [openExtendInfo, setOpenExtendInfo] = useState(false);
  const [extendInfo, setExtendInfo] = useState(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openSucess, setOpenSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useFocusEffect(
    React.useCallback(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
      }
      fetchSlots();
      setSelectedDepartment(profile?.department);
      setSelectedMajor(profile?.major);
      // fetchExpertise();
    }, [selectedDate])
  );

  const fetchSlots = async () => {
    try {
      const response = await axiosJWT.get(
        `${BASE_URL}/counselors/counseling-slot`,
        {
          params: {
            date: selectedDate,
          },
        }
      );
      setSlots(response.data.content);
      setLoading(false);
    } catch (err) {
      console.log("Can't fetch slots on this day", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Can't fetch slot on this day",
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
        `${BASE_URL}/academic/departments/${selectedDepartment?.id}/majors`
      );
      const majorsData = majorsRes?.data || [];
      setMajors(majorsData);
    } catch (err) {
      console.log("Can't fetch majors");
    }
  };

  // const fetchSpecialization = async () => {
  //   try {
  //     const specializationsRes = await axiosJWT.get(
  //       `${BASE_URL}/academic/majors/${selectedMajor?.id}/specializations`
  //     );
  //     const specializationsData = specializationsRes?.data || [];
  //     setSpecializations(specializationsData);
  //   } catch (err) {
  //     console.log("Can't fetch specializations");
  //   }
  // };

  useEffect(() => {
    fetchDepartment();
    if (selectedDepartment !== "") {
      fetchMajor();
      // if (selectedMajor !== "") {
      //   fetchSpecialization();
      // }
    }
  }, [selectedDepartment, selectedMajor, selectedSpecialization]);

  // const fetchExpertise = async () => {
  //   try {
  //     const expertisesRes = await axiosJWT.get(
  //       `${BASE_URL}/counselors/expertise`
  //     );
  //     const expertisesData = expertisesRes?.data.content || [];
  //     setExpertises(expertisesData);
  //   } catch (error) {
  //     console.log("Can't fetch  expertises");
  //   }
  // };

  useEffect(() => {
    if (socket) {
      socket.on(`/user/${userData?.id}/appointment`, (data) => {
        console.log(data);
        fetchSlots();
      });
    }
    return () => {
      if (socket) {
        socket.off(`/user/${userData?.id}/appointment`);
      }
    };
  }, [socket]);

  useEffect(() => {
    fetchSlots();
    // fetchExpertise();
  }, [selectedDate]);

  const renderReason = () => {
    return (
      <View
        style={{
          paddingTop: 4,
          paddingBottom: 12,
        }}
      >
        <TextInput
          placeholder="Input here"
          placeholderTextColor="gray"
          keyboardType="default"
          multiline={true}
          numberOfLines={2}
          value={reason}
          onChangeText={(value) => setReason(value)}
          style={{
            flex: 1,
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
    );
  };

  const renderCalendar = () => {
    return (
      <CalendarProvider
        date={selectedDate}
        onDateChanged={(date) => setSelectedDate(date)}
      >
        <Calendar
          minDate={new Date().toISOString().split("T")[0]}
          hideExtraDays
          markedDates={{
            [selectedDate]: {
              selected: true,
              selectedColor: "#F39300",
              selectedTextColor: "white",
            },
          }}
          onDayPress={(newDate) => {
            if (newDate.dateString != selectedDate) {
              setSelectedDate(newDate.dateString),
                console.log(newDate.dateString),
                setLoading(true);
            }
          }}
          theme={{
            selectedDayBackgroundColor: "#F39300",
            selectedDayTextColor: "white",
            arrowColor: "#F39300",
            textDayHeaderFontSize: 14,
            textDayFontSize: 16,
            todayTextColor: "#F39300",
          }}
          renderArrow={(direction) => {
            return direction === "left" ? (
              <Ionicons name="chevron-back" size={22} color="#F39300" />
            ) : (
              <Ionicons name="chevron-forward" size={22} color="#F39300" />
            );
          }}
        />
      </CalendarProvider>
    );
  };

  const renderSlotsForSelectedDate = () => {
    if (loading) {
      return (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginVertical: width * 0.075,
          }}
        >
          <ActivityIndicator size={40} color="#F39300" animating />
        </View>
      );
    }
    if (slots.length == 0) {
      return (
        <Text
          style={{
            fontWeight: "400",
            fontSize: 18,
            fontStyle: "italic",
            fontWeight: "600",
            textAlign: "center",
            color: "gray",
            opacity: 0.7,
            marginVertical: 8,
          }}
        >
          No available slots for {selectedDate}
        </Text>
      );
    }
    return (
      <View
        style={{
          flexWrap: "wrap",
          flexDirection: "row",
          justifyContent: "flex-start",
        }}
      >
        {slots.map((slot, index) => (
          <TouchableOpacity
            key={slot.slotId}
            onPress={() => {
              console.log(selectedDate, slot.slotId);
              setSelectedSlot(slot);
            }}
            disabled={
              slot.status === "EXPIRED" ||
              slot.myAppointment === true ||
              slot.status === "UNAVAILABLE"
            }
            style={{
              width: "auto",
              padding: 8,
              marginVertical: 6,
              marginRight: 6,
              backgroundColor:
                slot.myAppointment === true
                  ? "#F39300"
                  : selectedSlot.slotId === slot.slotId &&
                    slot.status !== "EXPIRED"
                  ? "white"
                  : slot.status === "EXPIRED"
                  ? "#ededed"
                  : slot.status === "AVAILABLE"
                  ? "white"
                  : "#ededed",
              alignItems: "center",
              borderRadius: 10,
              borderWidth: 1.5,
              borderColor:
                slot.myAppointment === true
                  ? "transparent"
                  : selectedSlot.slotId === slot.slotId &&
                    slot.status !== "EXPIRED"
                  ? "#F39300"
                  : slot.status === "EXPIRED"
                  ? "transparent"
                  : slot.status === "AVAILABLE"
                  ? "black"
                  : "transparent",
            }}
          >
            {selectedSlot.slotId === slot.slotId &&
              slot.status !== "EXPIRED" &&
              slot.status !== "UNAVAILABLE" &&
              slot.myAppointment !== true && (
                <View style={{ position: "absolute", top: -12, right: -8 }}>
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    style={{ color: "#F39300" }}
                  />
                </View>
              )}
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color:
                  slot.myAppointment === true
                    ? "white"
                    : selectedSlot.slotId === slot.slotId &&
                      slot.status !== "EXPIRED"
                    ? "#F39300"
                    : slot.status === "EXPIRED"
                    ? "gray"
                    : slot.status === "AVAILABLE"
                    ? "black"
                    : "gray",
              }}
            >
              {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderCounselorType = () => {
    return (
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            width: "50%",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => setType("ACADEMIC")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: type == "ACADEMIC" ? "white" : "#ededed",
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 4,
              marginTop: 4,
              borderWidth: 1.5,
              borderColor: type == "ACADEMIC" ? "#F39300" : "transparent",
            }}
          >
            <Ionicons
              name={
                type == "ACADEMIC" ? "checkmark-circle" : "radio-button-off"
              }
              size={24}
              color={type == "ACADEMIC" ? "#F39300" : "gray"}
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                fontSize: 16,
                color: type == "ACADEMIC" ? "#F39300" : "gray",
                fontWeight: type == "ACADEMIC" ? "600" : "500",
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
            onPress={() => setType("NON-ACADEMIC")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: type == "NON-ACADEMIC" ? "white" : "#ededed",
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 4,
              marginTop: 4,
              borderWidth: 1.5,
              borderColor: type == "NON-ACADEMIC" ? "#F39300" : "transparent",
            }}
          >
            <Ionicons
              name={
                type == "NON-ACADEMIC" ? "checkmark-circle" : "radio-button-off"
              }
              size={24}
              color={type == "NON-ACADEMIC" ? "#F39300" : "gray"}
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                fontSize: 16,
                color: type == "NON-ACADEMIC" ? "#F39300" : "gray",
                fontWeight: type == "NON-ACADEMIC" ? "600" : "500",
              }}
            >
              Non-academic
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderGender = () => {
    return (
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            width: "50%",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => setGender("MALE")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "white",
              borderRadius: 10,
              padding: 12,
              marginTop: 4,
              borderWidth: 4,
              marginRight: 4,
              borderColor: gender == "MALE" ? "#F39300" : "transparent",
            }}
          >
            {/* <Ionicons name="man" size={40} color="#0000fa" /> */}
            <Image
              source={{
                uri: "https://static.vecteezy.com/system/resources/previews/014/608/856/original/man-avatar-icon-flat-vector.jpg",
              }}
              style={{ width: width * 0.325, height: width * 0.325 }}
            />
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
            activeOpacity={0.5}
            onPress={() => setGender("FEMALE")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "white",
              borderRadius: 10,
              padding: 12,
              marginTop: 4,
              borderWidth: 4,
              marginLeft: 4,
              borderColor: gender == "FEMALE" ? "#F39300" : "transparent",
            }}
          >
            {/* <Ionicons name="woman" size={40} color="#ff469e" /> */}
            <Image
              source={{
                uri: "https://static.vecteezy.com/system/resources/previews/014/426/967/original/new-woman-avatar-icon-flat-vector.jpg",
              }}
              style={{ width: width * 0.325, height: width * 0.325 }}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderDepartments = () => {
    return (
      <Dropdown
        style={{
          backgroundColor: "white",
          borderColor: expanded ? "#F39300" : "black",
          height: 40,
          borderWidth: 2,
          borderRadius: 10,
          marginVertical: 8,
          paddingHorizontal: 12,
        }}
        placeholderStyle={{ fontSize: 14 }}
        selectedTextStyle={{
          fontSize: 18,
          color: selectedDepartment ? "black" : "white",
        }}
        inputSearchStyle={{ height: 40, fontSize: 16 }}
        maxHeight={250}
        data={departments}
        labelField="name"
        search
        value={
          selectedDepartment !== ""
            ? selectedDepartment.name
            : "Select Department"
        }
        placeholder={
          selectedDepartment !== ""
            ? selectedDepartment.name
            : "Select Department"
        }
        searchPlaceholder="Search Department"
        onFocus={() => setExpanded(true)}
        onBlur={() => setExpanded(false)}
        onChange={(item) => {
          setSelectedDepartment(item);
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
                  item.name == selectedDepartment.name ? "#F39300" : "white",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "500",
                  color:
                    item.name == selectedDepartment.name ? "white" : "black",
                }}
              >
                {item.name}
              </Text>
              {selectedDepartment.name === item.name && (
                <Ionicons color="white" name="checkmark" size={24} />
              )}
            </View>
          );
        }}
      />
    );
  };

  const renderMajors = () => {
    return (
      <Dropdown
        style={{
          backgroundColor: "white",
          borderColor: expanded2 ? "#F39300" : "black",
          height: 40,
          borderWidth: 2,
          borderRadius: 10,
          marginVertical: 8,
          paddingHorizontal: 12,
        }}
        placeholderStyle={{ fontSize: 14 }}
        selectedTextStyle={{
          fontSize: 18,
          color: selectedMajor ? "black" : "white",
        }}
        inputSearchStyle={{ height: 40, fontSize: 16 }}
        maxHeight={250}
        data={majors}
        labelField="name"
        search
        value={selectedMajor !== "" ? selectedMajor.name : "Select Major"}
        placeholder={selectedMajor !== "" ? selectedMajor.name : "Select Major"}
        searchPlaceholder="Search Major"
        onFocus={() => setExpanded2(true)}
        onBlur={() => setExpanded2(false)}
        onChange={(item) => {
          setSelectedMajor(item);
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
                  item.name == selectedMajor.name ? "#F39300" : "white",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "500",
                  color: item.name == selectedMajor.name ? "white" : "black",
                }}
              >
                {item.name}
              </Text>
              {selectedMajor.name === item.name && (
                <Ionicons color="white" name="checkmark" size={24} />
              )}
            </View>
          );
        }}
      />
    );
  };

  const renderSpecializations = () => {
    return (
      <Dropdown
        style={{
          backgroundColor: "white",
          borderColor: expanded3 ? "#F39300" : "black",
          height: 40,
          borderWidth: 2,
          borderRadius: 10,
          marginVertical: 8,
          paddingHorizontal: 16,
        }}
        placeholderStyle={{ fontSize: 14 }}
        selectedTextStyle={{
          fontSize: 18,
          color: selectedSpecialization ? "black" : "white",
        }}
        inputSearchStyle={{ height: 40, fontSize: 16 }}
        maxHeight={250}
        data={specializations}
        labelField="name"
        search
        value={
          selectedSpecialization !== ""
            ? selectedSpecialization.name
            : "Select Specialization"
        }
        placeholder={
          selectedSpecialization !== ""
            ? selectedSpecialization.name
            : "Select Specialization"
        }
        searchPlaceholder="Search Specialization"
        onFocus={() => setExpanded3(true)}
        onBlur={() => setExpanded3(false)}
        onChange={(item) => {
          setSelectedSpecialization(item);
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
                  item.name == selectedSpecialization.name
                    ? "#F39300"
                    : "white",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "500",
                  color:
                    item.name == selectedSpecialization.name
                      ? "white"
                      : "black",
                }}
              >
                {item.name}
              </Text>
              {selectedSpecialization.name === item.name && (
                <Ionicons color="white" name="checkmark" size={24} />
              )}
            </View>
          );
        }}
      />
    );
  };

  const renderExpertises = () => {
    return (
      <Dropdown
        style={{
          backgroundColor: "white",
          borderColor: expanded ? "#F39300" : "black",
          height: 40,
          borderWidth: 2,
          borderRadius: 10,
          marginVertical: 8,
          paddingHorizontal: 16,
        }}
        placeholderStyle={{ fontSize: 14 }}
        selectedTextStyle={{
          fontSize: 18,
          color: selectedExpertise ? "black" : "white",
        }}
        inputSearchStyle={{ height: 40, fontSize: 16 }}
        maxHeight={250}
        data={expertises}
        labelField="name"
        search
        value={
          selectedExpertise !== "" ? selectedExpertise.name : "Select Expertise"
        }
        placeholder={
          selectedExpertise !== "" ? selectedExpertise.name : "Select Expertise"
        }
        searchPlaceholder="Search Expertise"
        onFocus={() => setExpanded(true)}
        onBlur={() => setExpanded(false)}
        onChange={(item) => {
          setSelectedExpertise(item);
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
                  item.name == selectedExpertise.name ? "#F39300" : "white",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "500",
                  color:
                    item.name == selectedExpertise.name ? "white" : "black",
                }}
              >
                {item.name}
              </Text>
              {selectedExpertise.name === item.name && (
                <Ionicons color="white" name="checkmark" size={24} />
              )}
            </View>
          );
        }}
      />
    );
  };

  const renderCarousel = () => {
    const items = [
      { title: "What are your concerns?", content: renderReason() },
      {
        title: "Select date",
        content: renderCalendar(),
      },
      {
        title: "Select a slot",
        content: renderSlotsForSelectedDate(),
      },
      {
        title: "Select counselor type",
        content: renderCounselorType(),
      },
      {
        title: "Select gender",
        content: renderGender(),
      },
      ...(type === "ACADEMIC"
        ? [
            {
              title: "Select department",
              content: renderDepartments(),
            },
            selectedDepartment !== "" && {
              title: "Select major",
              content: renderMajors(),
            },
            // selectedMajor !== "" && {
            //   title: "Select specialization",
            //   content: renderSpecializations(),
            // },
          ].filter(Boolean)
        : [
            // {
            //   title: "Select expertise",
            //   content: renderExpertises(),
            // },
          ]),
    ];

    const renderItem = (item, index) => {
      return (
        <View key={index} style={{ marginBottom: 12 }}>
          <Text
            style={{
              fontSize: item.title === "" ? 0 : 18,
              fontWeight: "600",
              marginBottom: item.title === "" ? 0 : 4,
            }}
          >
            {item.title}{" "}
            {(item.title !== "Select gender" ||
              item.title !== "Select department" ||
              item.title !== "Select major") && (
              <Text style={{ color: "#F39300" }}>*</Text>
            )}
          </Text>
          {item.content}
        </View>
      );
    };

    const renderPage = () => {
      // const startIndex = currentPage * 2;
      // const endIndex = startIndex + 2;
      // const pageItems = items.slice(startIndex, endIndex);

      let pageItems = [];
      if (currentPage === 0) {
        pageItems = items.slice(0, 3);
      } else if (currentPage === 1) {
        pageItems = items.slice(3);
      }

      return (
        <View>{pageItems.map((item, index) => renderItem(item, index))}</View>
      );
    };

    return (
      <View
        style={{
          backgroundColor: "#fff0e0",
          padding: 12,
          borderWidth: 2,
          borderColor: "gray",
          borderRadius: 20,
          // height: height * 0.6,
        }}
      >
        {!matcher && renderPage()}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {!matcher && (
            <>
              {currentPage > 0 ? (
                <TouchableOpacity
                  onPress={() => setCurrentPage(currentPage - 1)}
                  style={{
                    backgroundColor: "#F39300",
                    padding: 4,
                    borderRadius: 20,
                  }}
                >
                  <Ionicons name="chevron-back" size={28} color="white" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  disabled
                  style={{
                    backgroundColor: "#e3e3e3",
                    padding: 4,
                    borderRadius: 20,
                  }}
                >
                  <Ionicons name="chevron-back" size={28} color="gray" />
                </TouchableOpacity>
              )}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  flex: 1,
                }}
              >
                {[...Array(2).keys()].map((_, index) => (
                  <View
                    key={index}
                    style={{
                      height: currentPage === index ? 16 : 12,
                      width: currentPage === index ? 16 : 12,
                      borderRadius: 20,
                      backgroundColor: "#F39300",
                      marginHorizontal: 6,
                      opacity: currentPage === index ? 1 : 0.3,
                    }}
                  />
                ))}
              </View>
              {currentPage < 1 ? (
                <TouchableOpacity
                  onPress={() => setCurrentPage(currentPage + 1)}
                  style={{
                    backgroundColor: "#F39300",
                    padding: 4,
                    borderRadius: 20,
                  }}
                >
                  <Ionicons name="chevron-forward" size={28} color="white" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  disabled
                  style={{
                    backgroundColor: "#e3e3e3",
                    padding: 4,
                    borderRadius: 20,
                  }}
                >
                  <Ionicons name="chevron-forward" size={28} color="gray" />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          {!matcher ? (
            <>
              <TouchableOpacity
                onPress={() => (
                  setCurrentPage(0),
                  setSelectedSlot(""),
                  setGender(""),
                  setType("ACADEMIC"),
                  setSelectedDepartment(""),
                  setSelectedMajor(""),
                  setSelectedSpecialization(""),
                  setSelectedExpertise(""),
                  setMatcher(null),
                  setError(null),
                  isOnline(null),
                  setReason("")
                )}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  backgroundColor: "white",
                  borderRadius: 10,
                  paddingVertical: 8,
                  marginTop: 12,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1.5,
                  borderColor: "lightgrey",
                  marginRight: 4,
                }}
              >
                <Text
                  style={{
                    fontWeight: "500",
                    color: "#333",
                    fontSize: 18,
                  }}
                >
                  Clear
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={selectedSlot == "" || reason == ""}
                onPress={handleMatch}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  backgroundColor:
                    selectedSlot == "" || reason == "" ? "#ededed" : "#F39300",
                  borderRadius: 10,
                  paddingVertical: 8,
                  marginTop: 12,
                  justifyContent: "center",
                  alignItems: "center",
                  marginLeft: 4,
                }}
              >
                <Text
                  style={{
                    fontWeight: "500",
                    color:
                      selectedSlot == "" || reason == "" ? "gray" : "white",
                    fontSize: 18,
                  }}
                >
                  Find
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              onPress={() => setMatcher(null)}
              style={{
                flex: 1,
                flexDirection: "row",
                backgroundColor: "white",
                borderRadius: 10,
                paddingVertical: 8,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1.5,
                borderColor: "lightgrey",
              }}
            >
              <Text
                style={{
                  fontWeight: "500",
                  color: "#333",
                  fontSize: 18,
                  marginRight: 8,
                }}
              >
                Find again
              </Text>
              <Ionicons name="refresh" size={20} color="#333" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const handleMatch = async () => {
    setMatcher(null);
    setError(null);
    setLoading2(true);
    try {
      const typeRes = await axiosJWT.get(
        `${BASE_URL}/counselors/random/match/reason/meaning/${userData?.id}`,
        {
          params: {
            reason: reason,
          },
        }
      );
      console.log(typeRes?.data?.message);
      if (typeRes?.data?.message === "OK") {
        if (type === "ACADEMIC") {
          const response = await axiosJWT.get(
            `${BASE_URL}/counselors/academic/random/match/${userData?.id}`,
            {
              params: {
                slotId: selectedSlot.slotId,
                date: selectedDate,
                gender: gender,
                reason: reason,
                departmentId: selectedDepartment.id,
                majorId: selectedMajor.id,
                // specializationId: selectedSpecialization.id,
              },
            }
          );
          if (response.data && response.data.status == 200) {
            setMatcher(response.data.content);
            Toast.show({
              type: "success",
              text1: "Success",
              text2: "A counselor has been found",
              onPress: () => Toast.hide(),
            });
          } else if (response.data && response.data.status == 404) {
            setError(response.data.message);
          }
        } else if (type === "NON-ACADEMIC") {
          const response = await axiosJWT.get(
            `${BASE_URL}/counselors/non-academic/random/match`,
            {
              params: {
                slotId: selectedSlot.slotId,
                date: selectedDate,
                gender: gender,
                reason: reason,
                // expertiseId: selectedExpertise.id,
              },
            }
          );
          if (response.data && response.data.status == 200) {
            setMatcher(response.data.content);
            Toast.show({
              type: "success",
              text1: "Success",
              text2: "A counselor has been found",
              onPress: () => Toast.hide(),
            });
          } else if (response.data && response.data.status == 404) {
            setError(response.data.message);
          }
        }
      } else if (typeRes?.data?.message?.includes("INAPPROPRIATE_SENTENCE")) {
        setError("Contain meaningless, violate or inappropriate words");
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Contain meaningless, violate or inappropriate words",
          onPress: () => Toast.hide(),
        });
      }
    } catch (err) {
      console.log("Can't find counselor suitable with your request", err);
      setError("Can't find counselor suitable with your request");
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Can't find counselor suitable with your request",
        onPress: () => Toast.hide(),
      });
    }
  };

  useEffect(() => {
    if (loading2) {
      const bounceAnimation = (dot, delay) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(dot, {
              toValue: -16,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
          { iterations: -1, delay }
        ).start();
      };

      bounceAnimation(dot1Anim, 0);
      setTimeout(() => bounceAnimation(dot2Anim, 0), 250);
      setTimeout(() => bounceAnimation(dot3Anim, 0), 500);
      setTimeout(() => {
        setLoading2(false);
      }, 1000);
      setTimeout(() => {
        dot1Anim.stopAnimation(() => dot1Anim.setValue(0));
        dot2Anim.stopAnimation(() => dot2Anim.setValue(0));
        dot3Anim.stopAnimation(() => dot3Anim.setValue(0));
      }, 1000);
    }
  }, [loading2]);

  // useEffect(() => {
  //   if (loading2) {
  //     Animated.sequence([
  //       Animated.timing(progress, {
  //         toValue: 0,
  //         duration: 0,
  //         useNativeDriver: false,
  //       }),
  //       Animated.timing(progress, {
  //         toValue: 25,
  //         duration: 75,
  //         useNativeDriver: false,
  //       }),
  //       Animated.timing(progress, {
  //         toValue: 50,
  //         duration: 75,
  //         useNativeDriver: false,
  //       }),
  //       Animated.timing(progress, {
  //         toValue: 75,
  //         duration: 75,
  //         useNativeDriver: false,
  //       }),
  //       Animated.timing(progress, {
  //         toValue: 100,
  //         duration: 75,
  //         useNativeDriver: false,
  //       }),
  //     ]).start();
  //     setTimeout(() => {
  //       setLoading2(false);
  //     }, 500);
  //   }
  // }, [loading2]);

  const handleCreateRequest = async () => {
    try {
      const response = await axiosJWT.post(
        `${BASE_URL}/booking-counseling/${matcher?.id}/appointment-request/create`,
        {
          slotCode: selectedSlot?.slotCode,
          date: selectedDate,
          isOnline: online,
          reason: reason,
        }
      );
      const data = await response.data;
      if (data && data.status == 200) {
        setOpenConfirm(false);
        setOpenSuccess(true);
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to request",
        });
      }
    } catch (error) {
      console.log("Something error when booking", error);
      setIsError(true);
      setErrorMessage(
        "You already created a request that have the same chosen slot on this day. Please choose a different slot"
      );
    }
  };

  const handleCloseSuccess = () => {
    setOpenSuccess(false);
    isOnline(null);
    setReason("");
    fetchSlots();
  };

  return (
    <View style={{ backgroundColor: "#f5f7fd", flex: 1 }}>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          paddingHorizontal: 20,
          // paddingTop: height * 0.005,
          paddingTop: height * 0.095,
          paddingBottom: height * 0.01,
        }}
      />
      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
        <View style={{ paddingVertical: 8, paddingHorizontal: 20 }}>
          {renderCarousel()}
        </View>
        {matcher && loading2 == false ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => (setOpenExtendInfo(true), setExtendInfo(matcher))}
            key={matcher.id}
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              paddingHorizontal: 8,
              paddingVertical: 12,
              marginVertical: 12,
              marginHorizontal: 20,
              elevation: 1,
              borderWidth: 0.75,
              borderColor: "#e3e3e3",
            }}
          >
            <View style={{ flexDirection: "row", marginHorizontal: 8 }}>
              <View>
                <Image
                  source={{ uri: matcher.profile.avatarLink }}
                  style={{
                    width: width * 0.14,
                    height: width * 0.14,
                    marginRight: 8,
                    borderRadius: 40,
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "#333",
                    }}
                  >
                    {matcher.profile.fullName}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#F39300",
                      paddingHorizontal: 12,
                      paddingVertical: 2,
                      borderRadius: 20,
                    }}
                  >
                    <Ionicons name="star" size={18} color="white" />
                    <Text
                      style={{
                        fontSize: 16,
                        marginLeft: 6,
                        fontWeight: "bold",
                        color: "white",
                      }}
                    >
                      {matcher.rating}
                    </Text>
                  </View>
                </View>
                <Text
                  style={{
                    fontSize: 18,
                    color: "gray",
                    marginVertical: 2,
                  }}
                >
                  {matcher?.expertise?.name || matcher?.specialization?.name}
                </Text>
              </View>
            </View>
            <View
              style={{
                backgroundColor: "#f0f0f0",
                borderRadius: 10,
                paddingVertical: 8,
                marginTop: 8,
                marginHorizontal: 8,
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  flex: 1,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="mail" size={20} color="black" />
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      marginLeft: 8,
                    }}
                  >
                    Email
                  </Text>
                </View>
                <Text style={{ marginTop: 8, color: "#555" }}>
                  {matcher.email}
                </Text>
              </View>
              <View
                style={{
                  borderLeftWidth: 0.75,
                  borderColor: "#ccc",
                  height: "90%",
                  marginVertical: 4,
                }}
              />
              <View
                style={{
                  flex: 1,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="call" size={20} color="black" />
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      marginLeft: 8,
                    }}
                  >
                    Contact
                  </Text>
                </View>
                <Text style={{ marginTop: 8, color: "#555" }}>
                  {matcher.profile.phoneNumber}
                </Text>
              </View>
            </View>
            <View
              style={{
                paddingVertical: 12,
                marginHorizontal: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                }}
              >
                Meeting method <Text style={{ color: "#F39300" }}>*</Text>
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    width: "50%",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => isOnline(true)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: online == true ? "white" : "#ededed",
                      borderRadius: 10,
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                      marginTop: 10,
                      borderWidth: 1.5,
                      borderColor: online == true ? "#F39300" : "transparent",
                    }}
                  >
                    <Ionicons
                      name={
                        online == true ? "checkmark-circle" : "radio-button-off"
                      }
                      size={24}
                      color={online == true ? "#F39300" : "gray"}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{
                        fontSize: 20,
                        color: online == true ? "#F39300" : "black",
                        fontWeight: online == true ? "600" : "0",
                      }}
                    >
                      Online
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
                    onPress={() => isOnline(false)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: online == false ? "white" : "#ededed",
                      borderRadius: 10,
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                      marginTop: 10,
                      borderWidth: 1.5,
                      borderColor: online == false ? "#F39300" : "transparent",
                    }}
                  >
                    <Ionicons
                      name={
                        online == false
                          ? "checkmark-circle"
                          : "radio-button-off"
                      }
                      size={24}
                      color={online == false ? "#F39300" : "gray"}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{
                        fontSize: 20,
                        color: online == false ? "#F39300" : "black",
                        fontWeight: online == false ? "600" : "0",
                      }}
                    >
                      Offline
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              disabled={selectedSlot === "" || online === null || reason === ""}
              style={{
                backgroundColor:
                  selectedSlot === "" || online === null || reason === ""
                    ? "#ededed"
                    : "#F39300",
                borderRadius: 10,
                paddingVertical: 8,
                marginTop: 12,
                marginHorizontal: 8,
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
              }}
              onPress={() => setOpenConfirm(true)}
            >
              <Text
                style={{
                  fontWeight: "500",
                  color:
                    selectedSlot === "" || online === null || reason === ""
                      ? "gray"
                      : "white",
                  fontSize: 18,
                  marginRight: 8,
                }}
              >
                Book Appointment
              </Text>
              <Ionicons
                name="chevron-forward"
                size={24}
                style={{
                  color:
                    selectedSlot === "" || online === null || reason === ""
                      ? "gray"
                      : "white",
                }}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        ) : (
          <>
            {error && loading2 == false ? (
              <Text
                style={{
                  fontWeight: "400",
                  fontSize: 18,
                  fontStyle: "italic",
                  fontWeight: "600",
                  textAlign: "center",
                  color: "gray",
                  opacity: 0.7,
                  marginVertical: 20,
                }}
              >
                {error}
              </Text>
            ) : (
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 20,
                  fontWeight: "600",
                  marginTop: 12,
                }}
              ></Text>
            )}
          </>
        )}
      </ScrollView>
      {loading2 && (
        // <View
        //   style={{
        //     position: "absolute",
        //     top: 0,
        //     left: 0,
        //     right: 0,
        //     bottom: 0,
        //     justifyContent: "center",
        //     alignItems: "center",
        //   }}
        // >
        //   <Animated.View
        //     style={{
        //       width: 90,
        //       height: 90,
        //       borderRadius: 50,
        //       borderWidth: 10,
        //       borderColor: progress.interpolate({
        //         inputRange: [0, 25, 50, 75, 100],
        //         outputRange: [
        //           "#888888",
        //           "#aaaaaa",
        //           "#cccccc",
        //           "#eeeeee",
        //           "#F39300",
        //         ],
        //       }),
        //       justifyContent: "center",
        //       alignItems: "center",
        //       transform: [
        //         {
        //           rotate: progress.interpolate({
        //             inputRange: [0, 25, 50, 75, 100],
        //             outputRange: [
        //               "0deg",
        //               "90deg",
        //               "180deg",
        //               "270deg",
        //               "360deg",
        //             ],
        //           }),
        //         },
        //       ],
        //     }}
        //   >
        //     <Ionicons name="hourglass" size={40} color="#F39300" />
        //   </Animated.View>
        // </View>
        <View
          style={{
            flexDirection: "row",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            // width: 56,
          }}
        >
          <Animated.View
            style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: "#034ea2",
              transform: [{ translateY: dot1Anim }],
              marginHorizontal: 4,
            }}
          />
          <Animated.View
            style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: "#f37021",
              transform: [{ translateY: dot2Anim }],
              marginHorizontal: 4,
            }}
          />
          <Animated.View
            style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: "#51b848",
              transform: [{ translateY: dot3Anim }],
              marginHorizontal: 4,
            }}
          />
        </View>
      )}
      <ExtendInfoModal
        openExtendInfo={openExtendInfo}
        setOpenExtendInfo={setOpenExtendInfo}
        extendInfo={extendInfo}
        setExtendInfo={setExtendInfo}
      />
      <ConfirmBookingModal
        openConfirm={openConfirm}
        setOpenConfirm={setOpenConfirm}
        selectedDate={selectedDate}
        selectedSlot={selectedSlot}
        online={online}
        reason={reason}
        selectedCounselor={matcher}
        onPress={handleCreateRequest}
      />
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
              width: width * 0.85,
              padding: 20,
              backgroundColor: "white",
              borderRadius: 20,
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: "#ededed",
                padding: 4,
                borderRadius: 30,
                alignSelf: "flex-start",
              }}
              onPress={() => {
                setSelectedSlot(""),
                  setGender(""),
                  setSelectedSpecialization(""),
                  setSelectedExpertise(""),
                  setMatcher(null),
                  isOnline(null),
                  setReason(""),
                  handleCloseSuccess();
              }}
            >
              <Ionicons name="chevron-back" size={28} color="black" />
            </TouchableOpacity>
            <View
              style={{
                alignItems: "center",
                marginBottom: 12,
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
                fontSize: 18,
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              Request has been sent successfully! {"\n"}
              Please wait while the counselor processes your request.
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
              onPress={() => {
                handleCloseSuccess();
                setSelectedSlot("");
                setGender("");
                setSelectedSpecialization("");
                setSelectedExpertise("");
                setMatcher(null);
                isOnline(null);
                setReason("");
                navigation.navigate("Request", { prevScreen: "Quick Booking" });
              }}
              activeOpacity={0.8}
            >
              <Text
                style={{
                  fontSize: 18,
                  color: "white",
                  fontWeight: "600",
                }}
              >
                See your request
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <ErrorModal
        isError={isError}
        setIsError={setIsError}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />
    </View>
  );
}
