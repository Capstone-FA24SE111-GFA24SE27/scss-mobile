import {
  View,
  Text,
  Pressable,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function EditProfile() {
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isFocused1, setIsFocused1] = useState(false);
  const [isFocused2, setIsFocused2] = useState(false);
  const [isFocused3, setIsFocused3] = useState(false);
  const [isFocused4, setIsFocused4] = useState(false);

  return (
    <>
      <View style={{ backgroundColor: "#f5f7fd", flex: 1 }}>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 30,
            paddingTop: 25,
            paddingVertical: 10,
          }}
        >
          <View style={{ flex: 1, alignItems: "flex-start" }} >
          <Pressable onPress={() => navigation.navigate("Profile")}>
              <Ionicons name="return-up-back" size={36} />
            </Pressable>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontWeight: "bold", fontSize: 24 }}>
              Edit Profile
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: "flex-end" }} />
        </View>
        <View
          style={{
            borderRadius: 20,
            marginHorizontal: 30,
            marginVertical: 12,
            flexDirection: "row",
          }}
        >
          <View style={{ width: "35%" }}>
            <Image
              source={require("../../assets/user.jpg")}
              style={{
                width: 110,
                height: 110,
                borderRadius: 90,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: "#ff469e"
              }}
            />
            <Pressable
                style={{
                  padding: 5,
                  backgroundColor: "#ff469e",
                  borderRadius: 30,
                  position: "absolute", right: 8, bottom: 8
                }}
              >
                <Ionicons
                  name="image-outline"
                  size={24}
                  style={{ color: "white" }}
                />
              </Pressable>
          </View>
          <View style={{ width: "65%", display: "flex" }}>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                color: "#ff469e",
                opacity: 0.8,
              }}
            >
              Update your picture
            </Text>
            <Text style={{ fontSize: 16, marginVertical: 8, fontWeight: "600", opacity: 0.5 }}>
              * Upload a photo under 2 MB
            </Text>
            {/* <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Pressable
                style={{
                  marginTop: 2,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  backgroundColor: "#ff469e",
                  borderRadius: 10,
                  flexDirection: "row",
                }}
              >
                <Ionicons
                  name="image-outline"
                  size={20}
                  style={{ color: "white", marginRight: 8 }}
                />
                <Text
                  style={{ fontSize: 16, color: "white", fontWeight: "600" }}
                >
                  Upload
                </Text>
              </Pressable>
            </View> */}
          </View>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ paddingHorizontal: 30 }}
        >
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>First Name</Text>
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
                borderColor: isFocused1 ? "#ff469e" : "gray",
              }}
            >
              <TextInput
                placeholder="Enter First Name"
                placeholderTextColor="gray"
                value={username}
                onChangeText={setUsername}
                onFocus={() => setIsFocused1(true)}
                onBlur={() => setIsFocused1(false)}
                style={{
                  flex: 1,
                  fontSize: 18,
                  opacity: 0.8,
                }}
              />
              <Pressable onPress={() => setUsername("")}>
                <Ionicons
                  name="close"
                  size={28}
                  style={{
                    marginRight: 10,
                    color: isFocused1 ? "#ff469e" : "gray",
                    opacity: 0.7,
                    display: username !== "" ? "flex" : "none",
                  }}
                />
              </Pressable>
            </View>
          </View>
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>Last Name</Text>
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
                borderColor: isFocused2 ? "#ff469e" : "gray",
              }}
            >
              <TextInput
                placeholder="Enter Last Name"
                placeholderTextColor="gray"
                onFocus={() => setIsFocused2(true)}
                onBlur={() => setIsFocused2(false)}
                style={{
                  flex: 1,
                  fontSize: 18,
                  opacity: 0.8,
                }}
              />
              <Pressable onPress={() => setUsername("")}>
                <Ionicons
                  name="close"
                  size={28}
                  style={{
                    marginRight: 10,
                    color: isFocused2 ? "#ff469e" : "gray",
                    opacity: 0.7,
                    display: username !== "" ? "flex" : "none",
                  }}
                />
              </Pressable>
            </View>
          </View>
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              Phone Number
            </Text>
            <TextInput
              placeholder="Enter Phone Number"
              placeholderTextColor="gray"
              keyboardType="number-pad"
              onFocus={() => setIsFocused3(true)}
              onBlur={() => setIsFocused3(false)}
              style={{
                borderWidth: 1,
                borderRadius: 10,
                paddingHorizontal: 16,
                height: 50,
                marginVertical: 8,
                alignItems: "center",
                backgroundColor: isFocused3 ? "white" : "#ededed",
                borderColor: isFocused3 ? "#ff469e" : "gray",
                alignContent: "center",
                height: 50,
                fontSize: 18,
                opacity: 0.8,
              }}
            />
          </View>
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>Email</Text>
            <TextInput
              placeholder="Enter Email"
              placeholderTextColor="gray"
              onFocus={() => setIsFocused4(true)}
              onBlur={() => setIsFocused4(false)}
              style={{
                borderWidth: 1,
                borderRadius: 10,
                paddingHorizontal: 16,
                height: 50,
                marginVertical: 8,
                alignItems: "center",
                backgroundColor: isFocused4 ? "white" : "#ededed",
                borderColor: isFocused4 ? "#ff469e" : "gray",
                alignContent: "center",
                height: 50,
                fontSize: 18,
                opacity: 0.8,
              }}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              marginTop: 4
            }}
          >
            <TouchableOpacity
              onPress={() => navigation.navigate("Profile")}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                backgroundColor: "#ff469e",
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "white",
                width: "100%"
              }}
            >
              <Text style={{ fontSize: 20, color: "white", textAlign: "center", fontWeight: "600" }}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
