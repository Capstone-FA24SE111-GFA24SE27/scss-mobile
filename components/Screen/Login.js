import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { AuthContext } from "../Context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import axiosJWT, { BASE_URL } from "../../config/Config";

export default function Login() {
  const { width, height } = Dimensions.get("screen");
  const navigation = useNavigation();
  const { login } = useContext(AuthContext);
  const [isFocused1, setIsFocused1] = useState(false);
  const [isFocused2, setIsFocused2] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleLogin = async () => {
    setEmailError("");
    setPasswordError("");

    if (!email) {
      setEmailError("Email is empty.");
    }
    if (!password) {
      setPasswordError("Password is empty.");
    }

    try {
      const response = await axiosJWT.post(`${BASE_URL}/auth/login/default`, {
        email: email,
        password: password,
      });
      const data = await response.data;
      if (data && data.status == 200) {
        Alert.alert("Login", "Login successfully");
        await login(data.content.account, data.content.accessToken);
      } else {
        Alert.alert("Login", "Login failed");
      }
    } catch (error) {
      // Alert.alert("Error", "An error occurred. Please try again.");
      console.log(error);
      setEmailError("Email or password incorrect.");
      setPasswordError("Email or password incorrect.");
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#f5f7fd",
        paddingHorizontal: 25,
      }}
    >
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          paddingTop: 40,
        }}
      >
        <View style={{ flex: 1, alignItems: "flex-start" }}>
          <TouchableOpacity onPress={() => navigation.navigate("GettingStart")}>
            <Ionicons
              name="chevron-back-circle-outline"
              size={36}
              style={{ color: "black" }}
            />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, alignItems: "center" }} />
        <View style={{ flex: 1 }} />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ marginTop: 20 }}
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
        <View style={{ marginTop: 40 }}>
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
            onPress={() => handleLogin()}
            style={{
              backgroundColor: "#F39300",
              paddingVertical: 8,
              borderRadius: 10,
              alignItems: "center",
              elevation: 2,
              marginTop: 24,
              marginBottom: 16,
              width: "75%",
              alignSelf: "center",
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
              backgroundColor: "#f9f9f9",
              paddingVertical: 8,
              borderRadius: 10,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              elevation: 2,
              width: "75%",
              alignSelf: "center",
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
                color: "black",
                fontWeight: "600",
                marginLeft: 10,
              }}
            >
              Continue by Google
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginTop: 12, alignItems: "center" }}
            onPress={() => navigation.navigate("ResetPassword")}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold", opacity: 0.4 }}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
          <View style={{ flexDirection: "row", marginVertical: 24 }}>
            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: "lightgrey",
                marginVertical: 8,
                width: "48%",
              }}
            />
            <View style={{ marginHorizontal: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", opacity: 0.6 }}>
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
                color: "black",
                fontWeight: "600",
                opacity: 0.8,
              }}
            >
              Don't have an account?{" "}
              <Text style={{ color: "#F39300", fontWeight: "600" }}>
                Sign Up Here
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}