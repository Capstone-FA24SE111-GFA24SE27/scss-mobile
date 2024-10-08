import { View, Text, Dimensions } from "react-native";
import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import CounselorRand from "../Screen/CounselorRand";
import AcademicCounselor from "../Screen/AcademicCounselor";
import NonAcademicCounselor from "../Screen/NonAcademicCounselor";
const Tab = createMaterialTopTabNavigator();

export default function CounselorNavigation() {
  const { width, height } = Dimensions.get("screen");
  const screenOptions = () => ({
    tabBarStyle: {
      position: "absolute",
      marginTop: height * 0.045,
      backgroundColor: "white",
      width: width * 0.9,
      // height: height * 0.045,
      height: 42.5,
      alignSelf: "center",
      borderRadius: 20,
      elevation: 4,
    },
    tabBarContentContainerStyle: {
      alignItems: "center",
      justifyContent: "center",
    },
    tabBarIndicatorStyle: {
      backgroundColor: "#F39300",
      position: "absolute",
      zIndex: -1,
      borderRadius: 20,
      left: "1%",
      // width: "48%",
      width: "31.5%",
      bottom: "7.5%",
      height: "85%",
    },
    tabBarLabelStyle: {
      fontWeight: "600",
      fontSize: 16,
      textAlignVertical: "center",
      textAlign: "center",
    },
    tabBarActiveTintColor: "white",
    tabBarInactiveTintColor: "#F39300",
  });

  return (
    <Tab.Navigator
      initialRouteName="CounselorRand"
      screenOptions={screenOptions}
    >
      <Tab.Screen name="Quick Booking" component={CounselorRand} />
      <Tab.Screen name="Academic" component={AcademicCounselor} />
      <Tab.Screen name="Non Academic" component={NonAcademicCounselor} />
    </Tab.Navigator>
  );
}
