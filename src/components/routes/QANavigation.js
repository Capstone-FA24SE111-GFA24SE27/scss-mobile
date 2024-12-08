import { Dimensions } from "react-native";
import React, { useContext } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import StudentQA from "../screens/student/StudentQA";
import StudentPublicQA from "../screens/student/PublicQA";
import StudentQuestionBoard from "../screens/student/QuestionBoard";
import CounselorQA from "../screens/counselor/CounselorQA";
import CounselorPublicQA from "../screens/counselor/PublicQA";
import CounselorQuestionBoard from "../screens/counselor/QA";
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
    <>
      {userData.role === "STUDENT" ? (
        <Tab.Navigator
          initialRouteName="My Q&A"
          screenOptions={screenOptions}
        >
          <Tab.Screen name="My Q&A" component={StudentQA} />
          <Tab.Screen name="Public Q&A" component={StudentPublicQA} />
          <Tab.Screen name="FAQ" component={StudentQuestionBoard} />
        </Tab.Navigator>
      ) : userData.role === "ACADEMIC_COUNSELOR" ||
        userData.role === "NON_ACADEMIC_COUNSELOR" ? (
        <Tab.Navigator
          initialRouteName="My Q&A"
          screenOptions={screenOptions}
        >
          <Tab.Screen name="My Q&A" component={CounselorQA} />
          <Tab.Screen name="Public Q&A" component={CounselorPublicQA} />
          <Tab.Screen name="FAQ" component={CounselorQuestionBoard} />
        </Tab.Navigator>
      ) : null}
    </>
  );
}
