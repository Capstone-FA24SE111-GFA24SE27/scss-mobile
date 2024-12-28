import React, { useContext, useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";
import axiosJWT, { BASE_URL } from "../../config/Config";

export default function ConfirmBookingModal({
  openConfirm,
  setOpenConfirm,
  selectedDate,
  selectedSlot,
  setSelectedSlot,
  online,
  reason,
  selectedCounselor,
  onPress,
}) {
  const { width, height } = Dimensions.get("screen");
  const { userData, profile } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState([]);
  const [repick, setRepick] = useState(false);

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
        onPress: () => Toast.hide(),
      });
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
  }, [selectedDate, openConfirm]);

  useEffect(() => {
    if (selectedSlot != "" || selectedSlot != null) {
      setRepick(true);
    } else {
      setRepick(false);
    }
  }, [selectedSlot]);

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
          justifyContent: "space-between",
          marginBottom: 8,
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
              width: "48%",
              padding: 6,
              marginVertical: 4,
              marginRight: 4,
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

  return (
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
            width: width * 0.9,
            maxHeight: "90%",
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
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            Booking Confirmation
          </Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 12,
                borderWidth: 1.5,
                borderColor: "#e3e3e3",
                borderRadius: 10,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Ionicons name="calendar" size={20} color="#F39300" />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    marginLeft: 8,
                  }}
                >
                  {selectedDate}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Ionicons name="time" size={20} color="#F39300" />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    marginLeft: 8,
                  }}
                >
                  {selectedSlot == "" || selectedSlot == null
                    ? "Select a slot"
                    : `${selectedSlot?.startTime?.slice(
                        0,
                        5
                      )} - ${selectedSlot?.endTime?.slice(0, 5)}`}
                </Text>
                {selectedSlot && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      setSelectedSlot("");
                      setRepick(true);
                    }}
                  >
                    <Ionicons
                      name="refresh"
                      size={20}
                      style={{ marginLeft: 8, color: "#F39300" }}
                    />
                  </TouchableOpacity>
                )}
              </View>
              {(selectedSlot == "" || selectedSlot == null) &&
                repick &&
                renderSlotsForSelectedDate()}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <MaterialIcons name="meeting-room" size={20} color="#F39300" />
                <View
                  style={{
                    backgroundColor: "#F39300",
                    borderRadius: 20,
                    paddingVertical: 2,
                    paddingHorizontal: 12,
                    marginLeft: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "white",
                    }}
                  >
                    {online ? "ONLINE" : "OFFLINE"}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  height: 1,
                  backgroundColor: "#F39300",
                  marginBottom: 8,
                }}
              />
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  marginBottom: 8,
                }}
              >
                <MaterialIcons name="notes" size={20} color="#F39300" />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "400",
                    marginLeft: 8,
                    maxWidth: "90%",
                  }}
                >
                  {reason}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                }}
              >
                <Ionicons name="person" size={20} color="#F39300" />
                <View style={{ marginLeft: 8, maxWidth: "90%" }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "500",
                    }}
                  >
                    {selectedCounselor?.profile?.fullName}
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      color: "gray",
                    }}
                  >
                    {selectedCounselor?.expertise?.name ||
                      selectedCounselor?.major?.name}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
          <Text
            style={{
              fontSize: 18,
              marginVertical: 12,
              textAlign: "left",
            }}
          >
            Are you sure you want to book?{"\n"}A request will be sent to the
            chosen counselor
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
                borderWidth: 1,
                borderColor: "#F39300",
              }}
              onPress={onPress}
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
  );
}
