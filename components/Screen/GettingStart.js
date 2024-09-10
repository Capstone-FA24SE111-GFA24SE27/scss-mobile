import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef } from "react";
import { View, Text, Image, TouchableOpacity, Animated } from "react-native";

export default function GettingStart() {
  const navigation = useNavigation();
  const fadeAnim1 = useRef(new Animated.Value(0)).current;
  const fadeAnim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim1, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim2, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#f5f7fd",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <View
        style={{
          alignItems: "center",
        }}
      >
        <Animated.Text
          style={{
            opacity: fadeAnim1,
            fontSize: 34,
            fontWeight: "bold",
            color: "#F39300",
          }}
        >
          EduSupport
        </Animated.Text>
        <Animated.Text
          style={{
            opacity: fadeAnim2,
            fontSize: 18,
            color: "gray",
            textAlign: "center",
            marginTop: 10,
            paddingHorizontal: 10,
            fontWeight: "600",
          }}
        >
          "Empowering Students, Guiding Success"
        </Animated.Text>
      </View>
      <Image
        source={{
          uri: "https://static.vecteezy.com/system/resources/thumbnails/006/054/695/small/flat-design-counseling-concept-art-free-vector.jpg",
        }}
        style={{ width: 200, height: 200, marginVertical: 40, resizeMode: "stretch" }}
      />
      <TouchableOpacity
        style={{
          width: "75%",
          backgroundColor: "#F39300",
          paddingVertical: 10,
          borderRadius: 10,
          marginBottom: 20,
          alignItems: "center",
        }}
        onPress={() => navigation.navigate("Login")}
      >
        <Text
          style={{
            color: "#FFF",
            fontSize: 18,
            fontWeight: "600",
          }}
        >
          LOGIN
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          width: "75%",
          paddingVertical: 8,
          borderRadius: 10,
          borderWidth: 3,
          borderColor: "#F39300",
          alignItems: "center",
        }}
        onPress={() => navigation.navigate("SignUp")}
      >
        <Text
          style={{
            color: "#F39300",
            fontSize: 18,
            fontWeight: "600",
          }}
        >
          SIGNUP
        </Text>
      </TouchableOpacity>
    </View>
  );
}
