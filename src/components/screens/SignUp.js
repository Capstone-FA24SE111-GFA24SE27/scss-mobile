import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  ScrollView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { AuthContext } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";

export default function SignUp() {
  const navigation = useNavigation();
  const { login } = useContext(AuthContext);
  const [isFocused1, setIsFocused1] = useState(false);
  const [isFocused2, setIsFocused2] = useState(false);
  const [isFocused3, setIsFocused3] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = () => {
    login();
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#f5f7fd",
        paddingHorizontal: 25
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
          <Text style={{ fontSize: 40, fontWeight: "bold" }}>Hi!</Text>
          <Text
            style={{
              fontSize: 28,
              marginTop: 8,
              fontWeight: "bold",
              color: "#F39300",
              opacity: 0.5,
            }}
          >
            Create an account
          </Text>
        </View>
        <View style={{ marginTop: 40 }}>
          <View>
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
              <Ionicons
                name="person"
                size={24}
                style={{
                  marginRight: 10,
                  color: isFocused1 ? "#F39300" : "gray",
                  opacity: 0.7,
                }}
              />
              <TextInput
                placeholder="Enter Username"
                placeholderTextColor="gray"
                value={username}
                onFocus={() => setIsFocused1(true)}
                onBlur={() => setIsFocused1(false)}
                onChangeText={setUsername}
                style={{
                  flex: 1,
                  fontSize: 18,
                  opacity: 0.8,
                }}
              />
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
                backgroundColor: isFocused2 ? "white" : "#ededed",
                borderColor: isFocused2 ? "#F39300" : "gray",
                alignContent: "center",
              }}
            >
              <Ionicons
                name="mail"
                size={24}
                style={{
                  marginRight: 10,
                  color: isFocused2 ? "#F39300" : "gray",
                  opacity: 0.7,
                }}
              />
              <TextInput
                placeholder="Enter Email"
                placeholderTextColor="gray"
                value={email}
                onFocus={() => setIsFocused2(true)}
                onBlur={() => setIsFocused2(false)}
                onChangeText={setEmail}
                style={{
                  flex: 1,
                  fontSize: 18,
                  opacity: 0.8,
                }}
              />
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
                backgroundColor: isFocused3 ? "white" : "#ededed",
                borderColor: isFocused3 ? "#F39300" : "gray",
                alignContent: "center",
              }}
            >
              <Ionicons
                name="lock-closed"
                size={24}
                style={{
                  marginRight: 10,
                  color: isFocused3 ? "#F39300" : "gray",
                  opacity: 0.7,
                }}
              />
              <TextInput
                placeholder="Enter Password"
                placeholderTextColor="gray"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setIsFocused3(true)}
                onBlur={() => setIsFocused3(false)}
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
                  color={isFocused3 ? "#F39300" : "gray"}
                />
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleSignUp}
            style={{
              backgroundColor: "#F39300",
              paddingVertical: 8,
              borderRadius: 10,
              alignItems: "center",
              elevation: 3,
              marginTop: 24,
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
              Sign Up
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
            onPress={() => navigation.navigate("Login")}
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
              Already have an account?{" "}
              <Text style={{ color: "#F39300", fontWeight: "600" }}>
                Sign In
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
