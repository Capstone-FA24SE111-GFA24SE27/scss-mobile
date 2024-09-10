import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  Animated,
} from "react-native";
import React, { useEffect, useRef } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function Personal() {
  const navigation = useNavigation();
  const blinking = useRef(new Animated.Value(0)).current;

  const scrollViewRef = useRef(null);
  useFocusEffect(
    React.useCallback(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
      }
    }, [])
  );

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinking, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(blinking, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(blinking, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <>
      <View style={{ backgroundColor: "#f5f7fd", flex: 1 }}>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            paddingHorizontal: 30,
            marginTop: 25,
            paddingVertical: 10,
          }}
        >
          <View style={{ flex: 1, alignItems: "flex-start" }} />
          <View style={{ flex: 2, alignItems: "center" }} />
          <View style={{ flex: 1 }} />
        </View>
        <View
          style={{
            flex: 0.15,
            backgroundColor: "#fff4fc",
            borderRadius: 20,
            elevation: 5,
            marginHorizontal: 30,
            paddingHorizontal: 15,
            justifyContent: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <Image
                source={require("../../assets/user.jpg")}
                style={{ width: 50, height: 50, borderRadius: 25 }}
              />
              <View style={{ marginLeft: 20 }}>
                <Text style={{ fontSize: 22, fontWeight: "bold" }}>
                  Mr. ABC
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Animated.View
                    style={{
                      opacity: blinking,
                      marginVertical: 4
                    }}
                  >
                    <View
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 20,
                        backgroundColor: "#F39300",
                      }}
                    />
                  </Animated.View>
                  <Text style={{ fontSize: 18, marginLeft: 8 }}>Online</Text>
                </View>
              </View>
            </View>
            <Pressable
              style={{ justifyContent: "flex-end" }}
              onPress={() => navigation.navigate("Profile")}
            >
              <Ionicons name="arrow-forward-circle" size={40} />
            </Pressable>
          </View>
        </View>
        <View
          style={{ flex: 0.15, marginHorizontal: 30, justifyContent: "center" }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 24, fontWeight: "bold" }}>
                Your History
              </Text>
            </View>
            <View style={{ justifyContent: "flex-end" }}>
              <Text
                style={{ fontSize: 20, color: "#F39300", fontWeight: "600" }}
              >
                View all
              </Text>
            </View>
          </View>
        </View>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          style={{
            flex: 0.65,
            backgroundColor: "#fff4fc",
            borderRadius: 20,
            elevation: 5,
            marginHorizontal: 30,
            paddingHorizontal: 5,
            marginBottom: 20,
          }}
        >
        </ScrollView>
      </View>
    </>
  );
}
