import React, { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { AuthContext } from "../context/AuthContext";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import axiosJWT, { BASE_URL } from "../../config/Config";
import Toast from "react-native-toast-message";
import Loading from "../layout/Loading";

export default function Login() {
  const navigation = useNavigation();
  const { width, height } = Dimensions.get("screen");
  const { login } = useContext(AuthContext);
  const [isFocused1, setIsFocused1] = useState(false);
  const [isFocused2, setIsFocused2] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      setEmailError("");
      setPasswordError("");
    }, [])
  );

  const handleLogin = async () => {
    setEmailError("");
    setPasswordError("");

    if (!email) {
      setEmailError("Email is empty.");
      return;
    }
    if (!password) {
      setPasswordError("Password is empty.");
      return;
    }

    try {
      setLoading(true);
      const response = await axiosJWT.post(`${BASE_URL}/auth/login/default`, {
        email: email,
        password: password,
      });
      const data = await response.data;
      if (data && data.status == 200) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Login successfully",
          onPress: () => {
            Toast.hide();
          },
        });
        login(data.content.account, data.content.accessToken);
        // login(data.content.account, data.content.accessToken, data.content.refreshToken);
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Login failed",
          onPress: () => {
            Toast.hide();
          },
        });
      }
    } catch (error) {
      // Alert.alert("Error", "An error occurred. Please try again.");
      console.log(error);
      setLoading(false);
      setEmailError("Email or password incorrect.");
      setPasswordError("Email or password incorrect.");
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1500);
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
      {loading ? (
        <Loading loading={loading} />
      ) : (
        <>
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
                onPress={() => navigation.navigate("GettingStart")}
              >
                <Ionicons
                  name="chevron-back-circle-outline"
                  size={36}
                  style={{ color: "#333" }}
                />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, alignItems: "center" }} />
            <View style={{ flex: 1 }} />
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ marginTop: height * 0.025 }}
          >
            <View>
              <Text style={{ fontSize: 40, fontWeight: "bold" }}>Welcome!</Text>
              <Text
                style={{
                  fontSize: 28,
                  marginTop: 8,
                  fontWeight: "bold",
                  color: "#F39300",
                  opacity: 0.5,
                }}
              >
                Sign in to continue
              </Text>
            </View>
            <View style={{ marginTop: height * 0.05 }}>
              <View>
                {emailError ? (
                  <Text
                    style={{
                      color: "red",
                      fontSize: 16,
                      marginLeft: 12,
                      marginVertical: 2,
                    }}
                  >
                    {emailError}
                  </Text>
                ) : null}
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
                    borderColor: isFocused1
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
                      color: isFocused1 ? "#F39300" : "gray",
                      opacity: 0.7,
                    }}
                  />
                  <TextInput
                    placeholder="Enter Email"
                    placeholderTextColor="gray"
                    value={email}
                    onFocus={() => setIsFocused1(true)}
                    onBlur={() => setIsFocused1(false)}
                    onChangeText={(text) => setEmail(text)}
                    style={{
                      flex: 1,
                      fontSize: 18,
                      opacity: 0.8,
                    }}
                  />
                  {/* {email !== "" && (
                    <TouchableOpacity onPress={() => setEmail("")}>
                      <Ionicons
                        name="close"
                        size={28}
                        style={{
                          color: "#F39300",
                          opacity: 0.7,
                        }}
                      />
                    </TouchableOpacity>
                  )} */}
                </View>
                {passwordError ? (
                  <Text
                    style={{
                      color: "red",
                      fontSize: 16,
                      marginLeft: 12,
                      marginVertical: 2,
                    }}
                  >
                    {passwordError}
                  </Text>
                ) : null}
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
                    borderColor: isFocused2
                      ? "#F39300"
                      : passwordError
                      ? "red"
                      : "gray",
                    alignContent: "center",
                  }}
                >
                  <Ionicons
                    name="lock-closed"
                    size={24}
                    style={{
                      marginRight: 10,
                      color: isFocused2 ? "#F39300" : "gray",
                      opacity: 0.7,
                    }}
                  />
                  <TextInput
                    placeholder="Enter Password"
                    placeholderTextColor="gray"
                    value={password}
                    onChangeText={(text) => setPassword(text)}
                    onFocus={() => setIsFocused2(true)}
                    onBlur={() => setIsFocused2(false)}
                    keyboardType="default"
                    secureTextEntry={!passwordVisible}
                    style={{
                      flex: 1,
                      fontSize: 18,
                      opacity: 0.8,
                    }}
                  />
                  {/* {password !== "" && (
                    <TouchableOpacity onPress={() => setPassword("")}>
                      <Ionicons
                        name="close"
                        size={28}
                        style={{
                          color: "#F39300",
                          opacity: 0.7,
                        }}
                      />
                    </TouchableOpacity>
                  )} */}
                  <TouchableOpacity
                    onPress={() => setPasswordVisible(!passwordVisible)}
                    style={{
                      paddingHorizontal: 4,
                    }}
                  >
                    <Ionicons
                      name={passwordVisible ? "eye-off" : "eye"}
                      size={26}
                      color={isFocused2 ? "#F39300" : "gray"}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleLogin()}
                style={{
                  width: "75%",
                  alignItems: "center",
                  alignSelf: "center",
                  backgroundColor: "#F39300",
                  paddingVertical: 8,
                  marginVertical: 20,
                  borderRadius: 10,
                  elevation: 3,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  Login
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleLogin()}
                style={{
                  width: "75%",
                  flexDirection: "row",
                  alignItems: "center",
                  alignSelf: "center",
                  justifyContent: "center",
                  backgroundColor: "#f9f9f9",
                  paddingVertical: 8,
                  borderRadius: 10,
                  paddingVertical: 8,
                  borderRadius: 10,
                  elevation: 3,
                }}
              >
                <Image
                  source={{
                    uri: "https://w7.pngwing.com/pngs/882/225/png-transparent-google-logo-google-logo-google-search-icon-google-text-logo-business.png",
                  }}
                  width={24}
                  height={24}
                />
                <Text
                  style={{
                    fontSize: 20,
                    color: "#333",
                    fontWeight: "600",
                    marginLeft: 10,
                  }}
                >
                  Continue by Google
                </Text>
              </TouchableOpacity>
              <View
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: "lightgrey",
                  marginTop: 30,
                  alignSelf: "center",
                  width: "85%"
                }}
              />
              <TouchableOpacity
                style={{ marginTop: 20, alignItems: "center" }}
                onPress={() => navigation.navigate("ResetPassword")}
              >
                <Text
                  style={{
                    fontSize: 18,
                    color: "#F39300",
                    marginTop: 1,
                    fontWeight: "600",
                    opacity: 0.8,
                  }}
                >
                  Forgot Password?
                </Text>
              </TouchableOpacity>
              {/* <View style={{ flexDirection: "row", marginVertical: 24 }}>
                <View
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: "lightgrey",
                    marginVertical: 8,
                    width: "48%",
                  }}
                />
                <View style={{ marginHorizontal: 8 }}>
                  <Text
                    style={{
                      color: "gray",
                      fontSize: 16,
                      fontWeight: "bold",
                      opacity: 0.7,
                    }}
                  >
                    Or
                  </Text>
                </View>
                <View
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: "lightgrey",
                    marginVertical: 8,
                    width: "42%",
                  }}
                />
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate("SignUp")}
                style={{
                  alignSelf: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    color: "#333",
                    fontWeight: "600",
                    opacity: 0.8,
                  }}
                >
                  Don't have an account?{" "}
                  <Text style={{ color: "#F39300", fontWeight: "600" }}>
                    Sign Up Here
                  </Text>
                </Text>
              </TouchableOpacity> */}
            </View>
          </ScrollView>
        </>
      )}
    </View>
  );
}
