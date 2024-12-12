import React from "react";
import { Modal, View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AlertModal({
  showModal,
  setShowModal,
  modalMessage,
  setModalMessage,
}) {
  const { width, height } = Dimensions.get("screen");

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={showModal}
      onRequestClose={() => {
        setShowModal(false);
        setModalMessage("");
      }}
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
            paddingHorizontal: 20,
            paddingVertical: 12,
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
            onPress={() => {
              setShowModal(false);
              setModalMessage("");
            }}
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
  );
}
