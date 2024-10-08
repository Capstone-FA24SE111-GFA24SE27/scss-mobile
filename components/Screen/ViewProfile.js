import {
  View,
  Text,
  Pressable,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../Context/AuthContext";

export default function ViewProfile() {
  const navigation = useNavigation();
  const { width, height } = Dimensions.get("screen");
  const { userData, profile, fetchProfile } = useContext(AuthContext);

  const formatDate = (value) => {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <>
      <View style={{ backgroundColor: "#f5f7fd", flex: 1 }}>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 30,
            paddingTop: height * 0.04,
            paddingVertical: 10,
          }}
        >
          <View style={{ flex: 1, alignItems: "flex-start" }}>
            <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
              <Ionicons name="return-up-back" size={36} />
            </TouchableOpacity>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontWeight: "bold", fontSize: 24 }}>
              Profile Details
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
              source={{ uri: userData?.profile?.avatarLink }}
              style={{
                width: 115,
                height: 115,
                borderRadius: 90,
                marginBottom: 8,
                borderWidth: 1.5,
                borderColor: "#F39300",
              }}
            />
            <Pressable
              style={{
                padding: 5,
                backgroundColor: "#F39300",
                borderRadius: 30,
                position: "absolute",
                right: 8,
                bottom: 8,
              }}
            >
              <Ionicons
                name={userData?.profile.gender == "MALE" ? "male" : "female"}
                size={24}
                style={{ color: "white" }}
              />
            </Pressable>
          </View>
          {/* <View style={{ width: "65%", display: "flex" }}>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                color: "#F39300",
                opacity: 0.8,
              }}
            >
              Update your picture
            </Text>
            <Text
              style={{
                fontSize: 16,
                marginVertical: 8,
                fontWeight: "600",
                opacity: 0.5,
              }}
            >
              * Upload a photo under 2 MB
            </Text>
          </View> */}
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ paddingHorizontal: 30 }}
        >
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>Full Name</Text>
            <TextInput
              editable={false}
              value={userData?.profile.fullName}
              style={{
                borderWidth: 1,
                borderRadius: 10,
                paddingHorizontal: 16,
                height: 50,
                marginVertical: 8,
                alignItems: "center",
                backgroundColor: "#ededed",
                borderColor: "gray",
                alignContent: "center",
                height: 50,
                fontSize: 18,
                opacity: 0.8,
                color: "black",
              }}
            />
          </View>
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>Code</Text>
            <TextInput
              editable={false}
              value={profile?.studentCode}
              style={{
                borderWidth: 1,
                borderRadius: 10,
                paddingHorizontal: 16,
                height: 50,
                marginVertical: 8,
                alignItems: "center",
                backgroundColor: "#ededed",
                borderColor: "gray",
                alignContent: "center",
                height: 50,
                fontSize: 18,
                opacity: 0.8,
                color: "black",
              }}
            />
          </View>
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>Email</Text>
            <TextInput
              editable={false}
              value={userData?.email}
              style={{
                borderWidth: 1,
                borderRadius: 10,
                paddingHorizontal: 16,
                height: 50,
                marginVertical: 8,
                alignItems: "center",
                backgroundColor: "#ededed",
                borderColor: "gray",
                alignContent: "center",
                height: 50,
                fontSize: 18,
                opacity: 0.8,
                color: "black",
              }}
            />
          </View>
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              Date of Birth
            </Text>
            <TextInput
              editable={false}
              value={formatDate(userData?.profile.dateOfBirth)}
              style={{
                borderWidth: 1,
                borderRadius: 10,
                paddingHorizontal: 16,
                height: 50,
                marginVertical: 8,
                alignItems: "center",
                backgroundColor: "#ededed",
                borderColor: "gray",
                alignContent: "center",
                height: 50,
                fontSize: 18,
                opacity: 0.8,
                color: "black",
              }}
            />
          </View>
          {/* <View
            style={{
              flexDirection: "row",
              marginTop: 4,
            }}
          >
            <TouchableOpacity
              onPress={() => navigation.navigate("Profile")}
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
          </View> */}
        </ScrollView>
      </View>
    </>
  );
}
