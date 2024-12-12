import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
} from "react-native";
import React, { useContext, useRef, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import axiosJWT, { BASE_URL } from "../../config/Config";

export default function ChangePassword() {
  const navigation = useNavigation();
  const { width, height } = Dimensions.get("screen");
  const [isFocused1, setIsFocused1] = useState(false);
  const [isFocused2, setIsFocused2] = useState(false);
  const [isFocused3, setIsFocused3] = useState(false);
  const [isFocused4, setIsFocused4] = useState(false);
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] =
    useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openForgot, setOpenForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [openConfirm2, setOpenConfirm2] = useState(false);
  const [openSuccess2, setOpenSuccess2] = useState(false);
  const { logout } = useContext(AuthContext);
  const scrollViewRef = useRef(null);
  useFocusEffect(
    React.useCallback(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
      }
      setCurrentPasswordError("");
      setNewPasswordError("");
      setConfirmPasswordError("");
      setEmailError("");
    }, [])
  );

  const handleChangePassword = async () => {
    setCurrentPasswordError("");
    setNewPasswordError("");
    setConfirmPasswordError("");

    if (!currentPassword) {
      setCurrentPasswordError("Current Password is empty.");
      setOpenConfirm(false);
      return;
    }
    if (!newPassword) {
      setNewPasswordError("New Password is empty.");
      setOpenConfirm(false);
      return;
    }
    if (!confirmPassword) {
      setConfirmPasswordError("Confirm Password is empty.");
      setOpenConfirm(false);
      return;
    }
    if (confirmPassword !== newPassword) {
      setConfirmPasswordError(
        "Confirm Password must be the same as New Password."
      );
      setOpenConfirm(false);
      return;
    }
    if (newPassword === currentPassword) {
      setNewPasswordError(
        "Your New Password is the same as Current Password. Why don't you change it?"
      );
      setOpenConfirm(false);
      return;
    }
    try {
      const response = await axiosJWT.put(
        `${BASE_URL}/account/change-password`,
        {
          currentPassword: currentPassword,
          newPassword: newPassword,
        }
      );
      const data = await response.data;
      if (data && data.status == 200) {
        setOpenConfirm(false);
        setOpenSuccess(true);
      }
    } catch (error) {
      console.log("Can't change password", error);
    }
  };

  const handleForgotPassword = async () => {
    setEmailError("");
    // if (!email.includes("@fpt.edu.vn") && !email.includes("@gmail.com")) {
    //   setEmailError("Incorrect syntax of an email");
    //   setOpenConfirm2(false);
    //   return;
    // }
    try {
      await axiosJWT.post(`${BASE_URL}/account/forgot-password`, {
        email: email,
      });
      setOpenConfirm2(false);
      setOpenSuccess2(true);
    } catch (err) {
      console.log("Can't send mail to provided email", err);
      setEmailError("Can't send mail to provided email");
      setOpenConfirm2(false);
    }
  };

  return (
    <>
      <View style={{ backgroundColor: "#f5f7fd", flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 20,
            paddingTop: height * 0.035,
            paddingBottom: 10,
          }}
        >
          <View style={{ flex: 1, alignItems: "flex-start" }}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate("Profile")}
            >
              <Ionicons name="return-up-back" size={36} />
            </TouchableOpacity>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontWeight: "bold", fontSize: 24 }}>
              Change Password
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: "flex-end" }} />
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ paddingHorizontal: 20, marginTop: 30 }}
        >
          <View style={{ marginBottom: 20 }}>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                Current Password
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setOpenForgot(true)}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: "#F39300",
                    marginTop: 1,
                    fontWeight: "600",
                    opacity: 0.8,
                  }}
                >
                  Forgot Password?
                </Text>
              </TouchableOpacity>
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
                backgroundColor: isFocused1 ? "white" : "#ededed",
                borderColor: isFocused1 ? "#F39300" : "gray",
                alignContent: "center",
              }}
            >
              <TextInput
                placeholder="Enter Current Password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                onFocus={() => setIsFocused1(true)}
                onBlur={() => setIsFocused1(false)}
                secureTextEntry={!isCurrentPasswordVisible}
                style={{
                  flex: 1,
                  fontSize: 18,
                  opacity: 0.8,
                }}
              />
              {currentPassword !== "" && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setCurrentPassword("")}
                >
                  <Ionicons
                    name="close"
                    size={28}
                    style={{
                      color: "#F39300",
                      opacity: 0.7,
                      paddingHorizontal: 4,
                    }}
                  />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  setIsCurrentPasswordVisible(!isCurrentPasswordVisible)
                }
                style={{
                  paddingHorizontal: 4,
                }}
              >
                <Ionicons
                  name={isCurrentPasswordVisible ? "eye-off" : "eye"}
                  size={26}
                  color={isFocused1 ? "#F39300" : "gray"}
                />
              </TouchableOpacity>
            </View>
            {currentPasswordError ? (
              <Text
                style={{
                  color: "red",
                  fontSize: 16,
                  marginVertical: 2,
                }}
              >
                {currentPasswordError}
              </Text>
            ) : null}
          </View>
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              New Password
            </Text>
            <View
              style={{
                flexDirection: "row",
                borderWidth: 1,
                borderRadius: 10,
                paddingHorizontal: 16,
                height: 50,
                marginVertical: 8,
                alignItems: "center",
                backgroundColor: isFocused2 ? "white" : "#ededed",
                borderColor: isFocused2 ? "#F39300" : "gray",
                alignContent: "center",
              }}
            >
              <TextInput
                placeholder="Enter New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                onFocus={() => setIsFocused2(true)}
                onBlur={() => setIsFocused2(false)}
                secureTextEntry={!isNewPasswordVisible}
                style={{
                  flex: 1,
                  fontSize: 18,
                  opacity: 0.8,
                }}
              />
              {newPassword !== "" && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setNewPassword("")}
                >
                  <Ionicons
                    name="close"
                    size={28}
                    style={{
                      color: "#F39300",
                      opacity: 0.7,
                      paddingHorizontal: 4,
                    }}
                  />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
                style={{
                  paddingHorizontal: 4,
                }}
              >
                <Ionicons
                  name={isNewPasswordVisible ? "eye-off" : "eye"}
                  size={26}
                  color={isFocused2 ? "#F39300" : "gray"}
                />
              </TouchableOpacity>
            </View>
            {newPasswordError ? (
              <Text
                style={{
                  color: "red",
                  fontSize: 16,
                  marginVertical: 2,
                }}
              >
                {newPasswordError}
              </Text>
            ) : null}
          </View>
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              Confirm Password
            </Text>
            <View
              style={{
                flexDirection: "row",
                borderWidth: 1,
                borderRadius: 10,
                paddingHorizontal: 16,
                height: 50,
                marginVertical: 8,
                alignItems: "center",
                backgroundColor: isFocused3 ? "white" : "#ededed",
                borderColor: isFocused3 ? "#F39300" : "gray",
                alignContent: "center",
              }}
            >
              <TextInput
                placeholder="Enter Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onFocus={() => setIsFocused3(true)}
                onBlur={() => setIsFocused3(false)}
                secureTextEntry={!isConfirmPasswordVisible}
                style={{
                  flex: 1,
                  height: 50,
                  fontSize: 18,
                  opacity: 0.8,
                }}
              />
              {confirmPassword !== "" && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setConfirmPassword("")}
                >
                  <Ionicons
                    name="close"
                    size={28}
                    style={{
                      color: "#F39300",
                      opacity: 0.7,
                      paddingHorizontal: 4,
                    }}
                  />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                }
                style={{
                  paddingHorizontal: 4,
                }}
              >
                <Ionicons
                  name={isConfirmPasswordVisible ? "eye-off" : "eye"}
                  size={26}
                  color={isFocused3 ? "#F39300" : "gray"}
                />
              </TouchableOpacity>
            </View>
            {confirmPasswordError ? (
              <Text
                style={{
                  color: "red",
                  fontSize: 16,
                  marginVertical: 2,
                }}
              >
                {confirmPasswordError}
              </Text>
            ) : null}
          </View>
          <View style={{ marginVertical: 12 }}>
            <Text style={{ fontSize: 16, color: "gray" }}>
              * Your new password must be different from current password
            </Text>
            <Text style={{ fontSize: 16, color: "gray" }}>
              * Your confirm password must be the same as your new password
            </Text>
            <Text style={{ fontSize: 16, color: "gray" }}>
              * Do not share your password to others
            </Text>
          </View>
        </ScrollView>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            paddingHorizontal: 20,
            paddingVertical: 16,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setOpenConfirm(true)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 10,
              backgroundColor: "#F39300",
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "white",
              width: "100%",
            }}
          >
            <Text
              style={{
                fontSize: 20,
                color: "white",
                textAlign: "center",
                fontWeight: "600",
              }}
            >
              Save Changes
            </Text>
          </TouchableOpacity>
        </View>
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
              Change Password Confirmation
            </Text>
            <Text
              style={{
                fontSize: 18,
                marginBottom: 30,
                textAlign: "center",
              }}
            >
              Are you sure you want to change your password? You'll have to
              logout in order to activate the new password
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <TouchableOpacity
                activeOpacity={0.7}
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
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  backgroundColor: "#F39300",
                  padding: 10,
                  borderRadius: 10,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={handleChangePassword}
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
        onRequestClose={() => (
          setOpenSuccess(false),
          setCurrentPassword(""),
          setNewPassword(""),
          setConfirmPassword("")
        )}
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
              Your password has been changed! {"\n"}
              Now you'll be logouted this account. Please login again using your
              new password
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => logout()}
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
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        transparent={true}
        visible={openForgot}
        animationType="slide"
        onRequestClose={() => setOpenForgot(false)}
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
              paddingHorizontal: 12,
              paddingVertical: 20,
              backgroundColor: "white",
              borderRadius: 10,
              elevation: 10,
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              Reset Password
            </Text>
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 16, color: "gray" }}>
                * By providing your valid email, we will send a reset mail for
                you to start your reset password process.
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
                backgroundColor: isFocused4 ? "white" : "#ededed",
                borderColor: isFocused4
                  ? "#F39300"
                  : emailError
                  ? "red"
                  : "gray",
                alignContent: "center",
              }}
            >
              <Ionicons
                name="mail"
                size={24}
                style={{
                  marginRight: 10,
                  color: isFocused4 ? "#F39300" : "gray",
                  opacity: 0.7,
                }}
              />
              <TextInput
                placeholder="Enter Email"
                value={email}
                onFocus={() => setIsFocused4(true)}
                onBlur={() => setIsFocused4(false)}
                onChangeText={(text) => setEmail(text)}
                style={{
                  flex: 1,
                  fontSize: 18,
                  opacity: 0.8,
                }}
              />
              {email !== "" && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setEmail("")}
                >
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
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                alignItems: "flex-end",
                marginTop: 12,
              }}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => (setOpenForgot(false), setIsFocused4(false))}
                style={{
                  backgroundColor: "#ededed",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 10,
                  marginRight: 8,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "gray",
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={email === ""}
                style={{
                  backgroundColor: email === "" ? "#ededed" : "#F39300",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 10,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: email === "" ? "gray" : "#F39300",
                }}
                onPress={() => setOpenConfirm2(true)}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: email === "" ? "gray" : "white",
                  }}
                >
                  Send Reset Link
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        transparent={true}
        visible={openConfirm2}
        animationType="fade"
        onRequestClose={() => setOpenConfirm2(false)}
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
                onPress={() => setOpenConfirm2(false)}
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
        visible={openSuccess2}
        animationType="fade"
        onRequestClose={() => setOpenSuccess2(false)}
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
              onPress={() => logout()}
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
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}
