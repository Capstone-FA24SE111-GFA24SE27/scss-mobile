import { View, Text, Dimensions, Animated, Image } from "react-native";
import React, { useEffect, useRef } from "react";
import logo from "../../assets/logo-fpt.png";

const Loading = ({ loading }) => {
  const { width, height } = Dimensions.get("window");

  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading) {
      const bounceAnimation = (dot, delay) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(dot, {
              toValue: -16,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
          { iterations: -1, delay }
        ).start();
      };

      bounceAnimation(dot1Anim, 0);
      setTimeout(() => bounceAnimation(dot2Anim, 0), 150);
      setTimeout(() => bounceAnimation(dot3Anim, 0), 300);
    }
  }, [loading]);
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <Image
        source={logo}
        style={{ width: width * 0.8, height: width * 0.2 }}
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 40,
          width: 56,
        }}
      >
        <Animated.View
          style={{
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: "#034ea2",
            transform: [{ translateY: dot1Anim }],
            marginHorizontal: 4,
          }}
        />
        <Animated.View
          style={{
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: "#f37021",
            transform: [{ translateY: dot2Anim }],
            marginHorizontal: 4,
          }}
        />
        <Animated.View
          style={{
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: "#51b848",
            transform: [{ translateY: dot3Anim }],
            marginHorizontal: 4,
          }}
        />
      </View>
    </View>
  );
}

export default Loading