import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  Animated,
  TextInput,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { AuthContext } from "../Context/AuthContext";

export default function Home() {
  const { width, height } = Dimensions.get("screen");
  const navigation = useNavigation();
  const { fetchProfile, profile } = useContext(AuthContext);
  const scrollViewRef = useRef(null);

  const workshops = [
    {
      title: "Student Stress Management (First Course)",
      coursesCount: "Sep 15, 2024",
      imageUri:
        "https://media.licdn.com/dms/image/D5612AQE00zOnoDzGEg/article-cover_image-shrink_720_1280/0/1683400315259?e=2147483647&v=beta&t=Ksr0RYLjuKlW7C4CuHbLevAWGLrBTPnAVDRvY5VPfzs",
    },
    {
      title: "Career Guidance for Students",
      coursesCount: "Sep 20, 2024",
      imageUri:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2DATqMHbW91YuWbGe524aUBXnR8_VYJSw_Q&s",
    },
    {
      title: "Mental Health Awareness",
      coursesCount: "Sep 25, 2024",
      imageUri:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtHYIS_WidgBIkc9s4rIJnT2dq5UHitQPz4A&s",
    },
  ];

  const counselors = [
    {
      id: 1,
      name: "Mr. John",
      experience: 10,
      skills: "Career Advisor, Mental Health Caretaker",
      image: require("../../assets/user.jpg"),
    },
    {
      id: 2,
      name: "Mr. Mathew",
      experience: 3,
      skills: "Technical Skills, Soft Skills",
      image: require("../../assets/user.jpg"),
    },
    {
      id: 3,
      name: "Mrs. Jean",
      experience: 5,
      skills: "Career Advisor, Soft Skills",
      image: require("../../assets/user.jpg"),
    },
    {
      id: 4,
      name: "Mr. Saul",
      experience: 10,
      skills: "PhD, Technical Skills",
      image: require("../../assets/user.jpg"),
    },
  ];

  useFocusEffect(
    React.useCallback(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
      }
    }, [])
  );

  const ringing = useRef(new Animated.Value(0)).current;
  const blinking = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(5000),
        Animated.timing(ringing, {
          toValue: -1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(ringing, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(ringing, {
          toValue: -1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(ringing, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(ringing, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const rotation = ringing.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-30deg", "30deg"],
  });

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinking, {
          toValue: 0.5,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(blinking, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

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
            justifyContent: "space-between",
            paddingHorizontal: 30,
            paddingVertical: 25,
            backgroundColor: "#F39300",
            borderBottomStartRadius: 40,
            borderBottomEndRadius: 40,
          }}
        >
          <View>
            {profile && (
              <Text
                style={{ fontSize: 18, fontWeight: "semibold", color: "white" }}
              >
                Hello, {profile.fullName}
              </Text>
            )}
            <Text style={{ fontSize: 26, fontWeight: "bold", color: "white" }}>
              Ready to discover
            </Text>
          </View>

          <View
            style={{ display: "flex", flexDirection: "row", marginTop: 12 }}
          >
            <Pressable
              onPress={() => navigation.navigate("Notification")}
              style={{ position: "relative", marginRight: 20, marginTop: 2 }}
            >
              <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                <Ionicons
                  name="notifications-outline"
                  size={40}
                  style={{ color: "white" }}
                />
              </Animated.View>
              <Animated.View
                style={{
                  opacity: blinking,
                  position: "absolute",
                  top: -6,
                  right: -3,
                  zIndex: 1,
                }}
              >
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: "white",
                  }}
                />
              </Animated.View>
            </Pressable>
            <Pressable>
              <Ionicons name="menu" size={40} color="white" />
            </Pressable>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            borderRadius: 30,
            marginHorizontal: 25,
            paddingHorizontal: 15,
            marginVertical: 16,
            alignItems: "center",
            backgroundColor: "#ededed",
            alignContent: "center",
            height: 50,
          }}
        >
          <Ionicons
            name="search"
            size={24}
            style={{ marginRight: 10, color: "#F39300", opacity: 0.7 }}
          />
          <TextInput
            placeholder="What are you searching for?"
            placeholderTextColor="#F39300"
            style={{
              fontSize: 18,
              opacity: 0.8,
            }}
          />
        </View>
        <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
          <View style={{ marginHorizontal: 30 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                Recommend Events for you
              </Text>
              <TouchableOpacity>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    opacity: 0.6,
                    marginRight: 4,
                  }}
                >
                  See all
                </Text>
                {/* <Ionicons
                  name="arrow-forward-circle-outline"
                  size={20}
                  style={{ color: "black" }}
                /> */}
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {workshops.map((course, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    width: width * 0.75,
                    // height: height * 0.3,
                    height: "auto",
                    backgroundColor: "white",
                    borderRadius: 20,
                    marginVertical: 15,
                    marginRight: 12,
                    overflow: "hidden",
                    position: "relative",
                    flexDirection: "column",
                  }}
                >
                  <Image
                    source={{ uri: course.imageUri }}
                    style={{
                      resizeMode: "cover",
                      width: width * 0.75,
                      height: height * 0.15,
                    }}
                  />
                  <View style={{ padding: 8 }}>
                    <Text
                      style={{
                        color: "black",
                        fontSize: 22,
                        fontWeight: "bold",
                      }}
                    >
                      {course.title}
                    </Text>
                    <Text
                      style={{
                        color: "gray",
                        fontSize: 18,
                        fontWeight: "600",
                        opacity: 0.7,
                        marginTop: 4,
                      }}
                    >
                      {course.coursesCount}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={{ marginHorizontal: 30 }}>
            <View>
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                Recommend Counselors
              </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {counselors.map((counselor) => (
                <TouchableOpacity
                  key={counselor.id}
                  style={{
                    width: Dimensions.get("screen").width * 0.5,
                    height: "auto",
                    backgroundColor: "white",
                    borderRadius: 20,
                    marginVertical: 15,
                    marginRight: 12,
                    overflow: "hidden",
                    borderWidth: 2,
                    borderColor: "#e3e3e3",
                  }}
                  // onPress={() => alert(`${counselor.name} clicked`)}
                  onPress={() =>
                    navigation.navigate("CounselorProfile", { counselor })
                  } // Pass the counselor object
                >
                  <Image
                    source={counselor.image}
                    style={{
                      width: "100%",
                      height: 120,
                      resizeMode: "contain",
                    }}
                  />
                  <View
                    style={{
                      position: "absolute",
                      top: 12,
                      right: -12,
                      backgroundColor: "#F39300",
                      paddingRight: 14,
                      paddingLeft: 4,
                      paddingVertical: 4,
                      borderRadius: 10,
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: 14,
                        fontWeight: "bold",
                      }}
                    >
                      {counselor.experience} Years
                    </Text>
                  </View>
                  <View
                    style={{
                      paddingHorizontal: 15,
                      paddingVertical: 10,
                    }}
                  >
                    <Text
                      style={{
                        color: "black",
                        fontSize: 22,
                        fontWeight: "bold",
                        marginBottom: 4,
                      }}
                    >
                      {counselor.name}
                    </Text>
                    <Text
                      style={{
                        color: "gray",
                        fontSize: 16,
                        fontWeight: "600",
                      }}
                    >
                      {counselor.skills}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={{
                  width: 80,
                  height: 200,
                  backgroundColor: "white",
                  borderRadius: 20,
                  marginVertical: 15,
                  marginRight: 12,
                  overflow: "hidden",
                  position: "relative",
                  alignItems: "center",
                  alignSelf: "center",
                  justifyContent: "center",
                  borderWidth: 2,
                  borderColor: "#e3e3e3",
                }}
                onPress={() => navigation.navigate("PT")}
              >
                <Ionicons
                  name="arrow-forward-circle"
                  size={34}
                  style={{ color: "#F39300" }}
                />
                <Text
                  style={{ fontSize: 12, fontWeight: "600", marginTop: 10 }}
                >
                  View more
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
