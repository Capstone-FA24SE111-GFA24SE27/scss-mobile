import React from "react";
import { Modal, View, Text, TouchableOpacity, Dimensions } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function ErrorModal({
  isError,
  setIsError,
  errorMessage,
  setErrorMessage,
}) {
  const { width, height } = Dimensions.get("screen");

  return (
    <Modal
      transparent={true}
      visible={isError}
      animationType="fade"
      onRequestClose={() => {
        setIsError(false);
        setErrorMessage("");
      }}
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
            backgroundColor: "white",
            borderRadius: 10,
          }}
        >
          <View
            style={{
              backgroundColor: "red",
              flexDirection: "row",
              alignItems: "center",
              padding: 12,
            }}
          >
            <MaterialIcons name="error" size={40} color="white" />
            <Text
              style={{
                fontSize: 28,
                color: "white",
                fontWeight: "600",
                marginLeft: 8,
              }}
            >
              Error
            </Text>
          </View>
          <View style={{ paddingHorizontal: 12, paddingVertical: 20 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "500",
                color: "gray",
                textAlign: "left",
              }}
            >
              {errorMessage}
            </Text>
          </View>
          <View
            style={{
              alignSelf: "flex-end",
              paddingHorizontal: 16,
              paddingBottom: 12,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setIsError(false);
                setErrorMessage("");
              }}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                backgroundColor: "#ededed",
                borderRadius: 10,
                borderWidth: 1.5,
                borderColor: "red",
              }}
            >
              <Text style={{ color: "red", fontSize: 18, fontWeight: "600" }}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
