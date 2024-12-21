import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Dimensions,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import axiosJWT, { BASE_URL } from "../../config/Config";

export default function ResetPassword() {
  const navigation = useNavigation();
  const { width, height } = Dimensions.get("screen");
  const [isFocused, setIsFocused] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      setEmailError("");
    }, [])
  );

  const handleForgotPassword = async () => {
    setEmailError("");
    // if (!email.includes("@fpt.edu.vn") && !email.includes("@gmail.com")) {
    //   setEmailError("Incorrect syntax of an email");
    //   setOpenConfirm(false);
    //   return;
    // }
    try {
      await axiosJWT.post(`${BASE_URL}/account/forgot-password`, {
        email: email,
      });
      setOpenConfirm(false);
      setOpenSuccess(true);
    } catch (error) {
      console.log("Can't send mail to provided email", error);
      setEmailError("Can't send mail to provided email");
      setOpenConfirm(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#f5f7fd",
        paddingHorizontal: 20,
      }}
    >
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          paddingTop: height * 0.05,
        }}
      >
        <View style={{ flex: 1, alignItems: "flex-start" }}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate("Login")}
          >
            <Ionicons
              name="chevron-back-circle-outline"
              size={36}
              color="#333"
            />
          </TouchableOpacity>
        </View>
      </View>
      <View
        style={{
          marginTop: height * 0.25,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          Reset Password
        </Text>
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 16, color: "gray" }}>
            * By providing your valid email, we will send a reset mail for you
            to start your reset password process.
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            borderWidth: 1,
            borderRadius: 10,
            paddingHorizontal: 16,
            height: 50,
            marginVertical: 8,
            alignItems: "center",
            backgroundColor: isFocused ? "white" : "#ededed",
            borderColor: isFocused ? "#F39300" : emailError ? "red" : "gray",
            alignContent: "center",
          }}
        >
          <Ionicons
            name="mail"
            size={24}
            style={{
              marginRight: 10,
              color: isFocused ? "#F39300" : "gray",
              opacity: 0.7,
            }}
          />
          <TextInput
            placeholder="Enter Email"
            value={email}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChangeText={(text) => setEmail(text)}
            style={{
              flex: 1,
              fontSize: 18,
              opacity: 0.8,
            }}
          />
          {email !== "" && (
            <TouchableOpacity activeOpacity={0.7} onPress={() => setEmail("")}>
              <Ionicons
                name="close"
                size={28}
                style={{
                  color: "#F39300",
                  opacity: 0.7,
                }}
              />
            </TouchableOpacity>
          )}
        </View>
        {emailError ? (
          <Text
            style={{
              color: "red",
              fontSize: 16,
              marginVertical: 2,
            }}
          >
            {emailError}
          </Text>
        ) : null}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setOpenConfirm(true)}
          style={{
            backgroundColor: "#F39300",
            paddingHorizontal: 12,
            paddingVertical: 8,
            marginTop: 12,
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
            borderColor: "#F39300",
            borderWidth: 1,
            width: "100%",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
            Send Reset Link
          </Text>
        </TouchableOpacity>
      </View>
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
              Forgot Password Confirmation
            </Text>
            <Text
              style={{
                fontSize: 18,
                marginBottom: 30,
                textAlign: "center",
              }}
            >
              Are you sure you forgot your current password? A mail will be sent
              to your provided email
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setOpenConfirm(false)}
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
                activeOpacity={0.7}
                onPress={handleForgotPassword}
                style={{
                  flex: 1,
                  backgroundColor: "#F39300",
                  padding: 10,
                  borderRadius: 10,
                  justifyContent: "center",
                  alignItems: "center",
                }}
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
        visible={openSuccess}
        animationType="fade"
        onRequestClose={() => setOpenSuccess(false)}
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
              width: width * 0.85,
              paddingVertical: 25,
              paddingHorizontal: 20,
              backgroundColor: "white",
              borderRadius: 20,
            }}
          >
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
              A mail has been sent to{" "}
              <Text style={{ fontWeight: "600", color: "#F39300" }}>
                {email}
              </Text>
              ! {"\n"}
              Please check it to start changing your password
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate("Login")}
              style={{
                backgroundColor: "#F39300",
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 30,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  color: "white",
                  fontWeight: "600",
                }}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
