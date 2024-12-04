import { View, Text, Dimensions } from "react-native";
import React, { useContext } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import QuestionBoard from "../screens/student/QuestionBoard";
import StudentQA from "../screens/student/StudentQA";
import QA from "../screens/counselor/QA";
import CounselorQA from "../screens/counselor/CounselorQA";
import { AuthContext } from "../context/AuthContext";
const Tab = createMaterialTopTabNavigator();

export default function QANavigation() {
  const { width, height } = Dimensions.get("screen");
  const { userData } = useContext(AuthContext);
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
      width: "48%",
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
    <>
      {userData.role === "STUDENT" ? (
        <Tab.Navigator
          initialRouteName="FAQ"
          screenOptions={screenOptions}
        >
          <Tab.Screen name="FAQ" component={QuestionBoard} />
          <Tab.Screen name="My Q&A" component={StudentQA} />
        </Tab.Navigator>
      ) : userData.role === "ACADEMIC_COUNSELOR" ||
        userData.role === "NON_ACADEMIC_COUNSELOR" ? (
        <Tab.Navigator
          initialRouteName="My Q&A"
          screenOptions={screenOptions}
        >
          <Tab.Screen name="My Q&A" component={CounselorQA} />
          <Tab.Screen name="FAQ" component={QA} />
        </Tab.Navigator>
      ) : null}
    </>
  );
}
