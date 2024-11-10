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
import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";
import axiosJWT, { BASE_URL } from "../../config/Config";
import { Ionicons } from "@expo/vector-icons";
import { Calendar, CalendarProvider } from "react-native-calendars";
import { Dropdown } from "react-native-element-dropdown";
import ErrorModal from "../layout/ErrorModal";
export default function CounselorRand() {
  const navigation = useNavigation();
  const { width, height } = Dimensions.get("screen");
  const { userData } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const scrollViewRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [progress, setProgress] = useState(new Animated.Value(0));
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
      fetchExpertise();
    }, [selectedDate])
  );

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

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
    } catch (error) {
      console.error("Error fetching slots", error);
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

  const fetchSpecialization = async () => {
    try {
      const specializationsRes = await axiosJWT.get(
        `${BASE_URL}/academic/majors/${selectedMajor?.id}/specializations`
      );
      const specializationsData = specializationsRes?.data || [];
      setSpecializations(specializationsData);
    } catch (err) {
      console.log("Can't fetch specializations");
    }
  };

  useEffect(() => {
    fetchDepartment();
    if (selectedDepartment !== "") {
      fetchMajor();
      if (selectedMajor !== "") {
        fetchSpecialization();
      }
    }
  }, [selectedDepartment, selectedMajor, selectedSpecialization]);

  const fetchExpertise = async () => {
    try {
      const expertisesRes = await axiosJWT.get(
        `${BASE_URL}/counselors/expertise`
      );
      const expertisesData = expertisesRes?.data.content || [];
      setExpertises(expertisesData);
    } catch (error) {
      console.log("Can't fetch  expertises");
    }
  };

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
    fetchExpertise();
  }, [selectedDate]);

  const renderCalendar = () => {
    return (
      <CalendarProvider
        date={selectedDate}
        onDateChanged={(date) => setSelectedDate(date)}
        style={{ marginTop: 10 }}
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

  const renderSlots = () => {
    if (loading) {
      return (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginVertical: 38.5,
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
            textAlign: "center",
            fontSize: 18,
            fontWeight: "400",
            marginTop: 12,
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
              padding: 10,
              marginVertical: 8,
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
              borderRadius: 10,
              alignItems: "center",
              borderWidth: 1.5,
              marginRight: 12,
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
                <View style={{ position: "absolute", top: -10, right: -10 }}>
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
              {slot.startTime.split(":")[0] +
                ":" +
                slot.startTime.split(":")[1]}{" "}
              - {slot.endTime.split(":")[0] + ":" + slot.endTime.split(":")[1]}
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
            width: "47.5%",
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
              marginTop: 10,
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
              marginTop: 10,
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
              marginTop: 10,
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
              style={{ width: width * 0.35, height: width * 0.35 }}
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
              marginTop: 10,
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
              style={{ width: width * 0.35, height: width * 0.35 }}
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
          paddingHorizontal: 16,
        }}
        placeholderStyle={{ fontSize: 16 }}
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
          selectedDepartment !== "" ? selectedDepartment.name : "Select item"
        }
        placeholder={
          selectedDepartment !== "" ? selectedDepartment.name : "Select item"
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
          paddingHorizontal: 16,
        }}
        placeholderStyle={{ fontSize: 16 }}
        selectedTextStyle={{
          fontSize: 18,
          color: selectedMajor ? "black" : "white",
        }}
        inputSearchStyle={{ height: 40, fontSize: 16 }}
        maxHeight={250}
        data={majors}
        labelField="name"
        search
        value={selectedMajor !== "" ? selectedMajor.name : "Select item"}
        placeholder={selectedMajor !== "" ? selectedMajor.name : "Select item"}
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
        placeholderStyle={{ fontSize: 16 }}
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
            : "Select item"
        }
        placeholder={
          selectedSpecialization !== ""
            ? selectedSpecialization.name
            : "Select item"
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
        placeholderStyle={{ fontSize: 16 }}
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
          selectedExpertise !== "" ? selectedExpertise.name : "Select item"
        }
        placeholder={
          selectedExpertise !== "" ? selectedExpertise.name : "Select item"
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
      {
        title: "Select a date",
        content: renderCalendar(),
      },
      {
        title: "Select a slot",
        content: renderSlots(),
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
            selectedMajor !== "" && {
              title: "Select specialization",
              content: renderSpecializations(),
            },
          ].filter(Boolean)
        : [
            {
              title: "Select expertise",
              content: renderExpertises(),
            },
          ]),
    ];

    const renderItem = (item, index) => {
      return (
        <View key={index} style={{ marginBottom: 12 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
            }}
          >
            {item.title}{" "}
            {(item.title == "Select a date" ||
              item.title == "Select a slot" ||
              item.title == "Select counselor type") && (
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
        pageItems = items.slice(0, 2);
      } else if (currentPage === 1) {
        pageItems = items.slice(2);
      }

      return (
        <View>{pageItems.map((item, index) => renderItem(item, index))}</View>
      );
    };

    return (
      <View
        style={{
          backgroundColor: "#fff0e0",
          paddingVertical: 12,
          paddingHorizontal: 12,
          borderWidth: 2,
          borderColor: "black",
          borderRadius: 20,
        }}
      >
        {renderPage()}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
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
            <View style={{ width: 28, height: 28 }} />
          )}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
            }}
          >
            {/* {[...Array(Math.ceil(items.length / 2)).keys()].map((_, index) => ( */}
            {[...Array(2).keys()].map((_, index) => (
              <View
                key={index}
                style={{
                  height: currentPage === index ? 16 : 12,
                  width: currentPage === index ? 16 : 12,
                  borderRadius: 20,
                  backgroundColor: "#F39300",
                  marginHorizontal: 8,
                  opacity: currentPage === index ? 1 : 0.3,
                }}
              />
            ))}
          </View>
          {/* {currentPage < Math.ceil(items.length / 2) - 1 ? ( */}
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
            <View style={{ width: 28, height: 28 }} />
          )}
        </View>
        <View
          style={{
            paddingBottom: 12,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
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
              setMatcher(""),
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
            disabled={selectedSlot == ""}
            onPress={handleMatch}
            style={{
              flex: 1,
              flexDirection: "row",
              backgroundColor: selectedSlot == "" ? "#ededed" : "#F39300",
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
                color: selectedSlot == "" ? "gray" : "white",
                fontSize: 18,
              }}
            >
              Find
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handleMatch = async () => {
    setError(null);
    setLoading2(true);
    try {
      if (type === "ACADEMIC") {
        const response = await axiosJWT.get(
          `${BASE_URL}/counselors/academic/random/match`,
          {
            params: {
              slotId: selectedSlot.slotId,
              date: selectedDate,
              gender: gender,
              departmentId: selectedDepartment.id,
              majorId: selectedMajor.id,
              specializationId: selectedSpecialization.id,
            },
          }
        );
        setMatcher(response.data.content);
      }
      if (type === "NON-ACADEMIC") {
        const response = await axiosJWT.get(
          `${BASE_URL}/counselors/non-academic/random/match`,
          {
            params: {
              slotId: selectedSlot.slotId,
              date: selectedDate,
              gender: gender,
              expertiseId: selectedExpertise.id,
            },
          }
        );
        setMatcher(response.data.content);
      }
    } catch (error) {
      console.log("Can't find counselor", error);
      setError("No Counselor found");
    }
  };

  useEffect(() => {
    if (loading2) {
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
        Animated.timing(progress, {
          toValue: 25,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(progress, {
          toValue: 50,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(progress, {
          toValue: 75,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(progress, {
          toValue: 100,
          duration: 500,
          useNativeDriver: false,
        }),
      ]).start();
      setTimeout(() => {
        setLoading2(false);
      }, 2000);
    }
  }, [loading2]);

  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  const handleCreateRequest = async () => {
    try {
      const response = await axiosJWT.post(
        `${BASE_URL}/booking-counseling/${matcher?.id}/appointment-request/create`,
        {
          slotCode: selectedSlot.slotCode,
          date: selectedDate,
          isOnline: online,
          reason: reason,
        }
      );
      const data = await response.data;
      if (data && data.status == 200) {
        handleCloseConfirm();
        setOpenSuccess(true);
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to request",
        });
      }
      console.log(
        matcher?.id,
        selectedSlot.slotCode,
        selectedDate,
        online,
        reason
      );
    } catch (error) {
      console.log("Something error when booking", error);
      setIsError(true);
      setErrorMessage(
        "You already created a request that have the same chosen slot on this day. Please choose a different slot"
      );
    }
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
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
        <View style={{ paddingVertical: 6, paddingHorizontal: 12 }}>
          {renderCarousel()}
        </View>
        {loading2 && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Animated.View
              style={{
                width: 90,
                height: 90,
                borderRadius: 50,
                borderWidth: 10,
                borderColor: progress.interpolate({
                  inputRange: [0, 25, 50, 75, 100],
                  outputRange: [
                    "#888888",
                    "#aaaaaa",
                    "#cccccc",
                    "#eeeeee",
                    "#F39300",
                  ],
                }),
                justifyContent: "center",
                alignItems: "center",
                transform: [
                  {
                    rotate: progress.interpolate({
                      inputRange: [0, 25, 50, 75, 100],
                      outputRange: [
                        "0deg",
                        "90deg",
                        "180deg",
                        "270deg",
                        "360deg",
                      ],
                    }),
                  },
                ],
              }}
            >
              <Ionicons name="hourglass" size={40} color="#F39300" />
            </Animated.View>
          </View>
        )}
        {matcher && loading2 == false ? (
          <>
            <View
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
                        {matcher.rating.toFixed(1)}
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

              <TouchableOpacity
                disabled={
                  selectedSlot === "" || online === null || reason === ""
                }
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
                onPress={handleOpenConfirm}
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
            </View>
            <View
              style={{
                paddingVertical: 12,
                paddingHorizontal: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                }}
              >
                Form of counseling <Text style={{ color: "#F39300" }}>*</Text>
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
            <View
              style={{
                paddingVertical: 12,
                paddingHorizontal: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  marginBottom: 12,
                }}
              >
                What subject do you want counsel on?{" "}
                <Text style={{ color: "#F39300" }}>*</Text>
              </Text>
              <View>
                <TextInput
                  placeholder="Write for your right"
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
            </View>
          </>
        ) : (
          <>
            {error && loading2 == false ? (
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 20,
                  fontWeight: "600",
                  marginTop: 12,
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
              Booking Confirmation
            </Text>
            <Text
              style={{
                fontSize: 18,
                marginBottom: 30,
                textAlign: "center",
              }}
            >
              Are you sure you want to book with this chosen counselor?
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
                onPress={handleCreateRequest}
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
              width: width * 0.85,
              paddingVertical: 25,
              paddingHorizontal: 20,
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
                  setMatcher(""),
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
              Your request has been sent successfully! {"\n"}
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
                setMatcher("");
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
