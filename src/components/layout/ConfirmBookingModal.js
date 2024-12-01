import React from "react";
import { Modal, View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

export default function ConfirmBookingModal({
  openConfirm,
  setOpenConfirm,
  selectedDate,
  selectedSlot,
  online,
  reason,
  selectedCounselor,
  onPress,
}) {
  const { width, height } = Dimensions.get("screen");

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
              textAlign: "center",
            }}
          >
            Booking Confirmation
          </Text>
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
                justifyContent: "space-between",
                alignItems: "center",
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
                  {selectedSlot?.startTime?.slice(0, 5)} -{" "}
                  {selectedSlot?.endTime?.slice(0, 5)}
                </Text>
              </View>
            </View>
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
                  {selectedCounselor?.expertise?.name || selectedCounselor?.major?.name}
                </Text>
              </View>
            </View>
          </View>
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
