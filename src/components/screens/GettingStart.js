import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import logo from "../../assets/logo-fpt.png";

export default function GettingStart() {
  const navigation = useNavigation();
  const { width, height } = Dimensions.get("screen");
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
      }),
    ]).start();
    const timeout = setTimeout(() => {
      navigation.navigate("Login");
    }, 1500);
    return () => clearTimeout(timeout);
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
      <View style={{ position: "absolute", top: 8, left: 8 }}>
        <Image
          source={logo}
          style={{ width: 200, height: 160, resizeMode: "contain" }}
        />
      </View>
      <View
        style={{
          alignItems: "center",
        }}
      >
        <Animated.Text
          style={{
            opacity: fadeAnim1,
            fontSize: 40,
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
            marginTop: 12,
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
        style={{
          width: width * 0.6,
          height: width * 0.6,
          marginVertical: height * 0.025,
          resizeMode: "stretch",
        }}
      />
      {/* <TouchableOpacity
        activeOpacity={0.7}
        style={{
          width: "75%",
          backgroundColor: "#F39300",
          paddingVertical: 8,
          borderRadius: 10,
          marginTop: height*0.05,
          marginBottom: 20,
          borderWidth: 3,
          borderColor: "#F39300",
          alignItems: "center",
        }}
        onPress={() => navigation.navigate("Login")}
      >
        <Text
          style={{
            color: "white",
            fontSize: 20,
            fontWeight: "600",
          }}
        >
          LOGIN
        </Text>
      </TouchableOpacity> */}
      {/* <TouchableOpacity
        activeOpacity={0.7}
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
            fontSize: 20,
            fontWeight: "600",
          }}
        >
          SIGNUP
        </Text>
      </TouchableOpacity> */}
      <View style={{ position: "absolute", bottom: 0, right: 0, margin: 10 }}>
        <Text style={{ fontSize: 16, color: "gray", fontWeight: "500" }}>
          Ver_1.0.0
        </Text>
      </View>
    </View>
  );
}
