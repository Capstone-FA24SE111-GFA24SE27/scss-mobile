import React, { useContext, useEffect, useRef, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import Login from "../screens/Login";
import SignUp from "../screens/SignUp";
import Home from "../screens/Home";
import HomeCounselor from "../screens/counselor/Home";
import GettingStart from "../screens/GettingStart";
import Schedule from "../screens/Schedule";
import ScheduleCounselor from "../screens/counselor/Schedule";
import Personal from "../screens/Personal";
import PersonalCounselor from "../screens/counselor/Personal";
import Notification from "../screens/Notification";
import Profile from "../screens/Profile";
import ProfileCounselor from "../screens/counselor/Profile";
import ViewProfile from "../screens/ViewProfile";
import ResetPassword from "../screens/ResetPassword";
import CounselorProfile from "../screens/CounselorProfile";
import Request from "../screens/Request";
import RequestCounselor from "../screens/counselor/Request";
import Appointment from "../screens/Appointment";
import AppointmentCounselor from "../screens/counselor/Appointment";
import NotificationDetail from "../screens/NotificationDetail";
import CounselorNavigation from "./CounselorNavigation";
import QA from "../screens/QA";
import Owner from "../screens/counselor/Owner";
import QANavigation from "./QANavigation";
import Student from "../screens/counselor/Student";
import Demand from "../screens/counselor/Demand";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export default function Navigation() {
  const { isLogin, userData } = useContext(AuthContext);

  const screenOptions = () => ({
    headerShown: false,
    tabBarHideOnKeyboard: true,
    tabBarStyle: {
      height: 60,
      backgroundColor: "#F39300",
      borderTopRightRadius: 30,
      borderTopLeftRadius: 30,
      // position: "absolute",
      // margin: 16,
      // borderRadius: 30,
      justifyContent: "center",
      alignItems: "center",
    },
  });

  const TabArrayStudent = [
    {
      route: "Home",
      label: "Home",
      active: "home",
      inActive: "home-outline",
      component: Home,
    },
    {
      route: "Counselor",
      label: "Counselor",
      active: "clipboard",
      inActive: "clipboard-outline",
      component: CounselorNavigation,
    },
    {
      route: "Schedule",
      label: "Schedule",
      active: "calendar",
      inActive: "calendar-outline",
      component: Schedule,
    },
    {
      route: "QA",
      label: "QA",
      active: "chatbubbles",
      inActive: "chatbubbles-outline",
      component: QA,
    },
    {
      route: "Personal",
      label: "Personal",
      active: "person",
      inActive: "person-outline",
      component: Personal,
    },
  ];

  const TabArrayCounselor = [
    {
      route: "Home",
      label: "Home",
      active: "home",
      inActive: "home-outline",
      component: HomeCounselor,
    },
    {
      route: "Student",
      label: "Student",
      active: "clipboard",
      inActive: "clipboard-outline",
      component: Student,
    },
    {
      route: "Schedule",
      label: "Schedule",
      active: "calendar",
      inActive: "calendar-outline",
      component: ScheduleCounselor,
    },
    {
      route: "QA",
      label: "QA",
      active: "chatbubbles",
      inActive: "chatbubbles-outline",
      component: Owner,
      // component: QANavigation,
    },
    {
      route: "Personal",
      label: "Personal",
      active: "person",
      inActive: "person-outline",
      component: PersonalCounselor,
    },
  ];

  const TabButton = (props) => {
    const { item, onPress, accessibilityState } = props;
    const focused = accessibilityState.selected;

    const viewScaleAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;
    const textScaleAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;

    useEffect(() => {
      if (focused) {
        Animated.parallel([
          Animated.timing(viewScaleAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(textScaleAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        Animated.parallel([
          Animated.timing(viewScaleAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(textScaleAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [focused]);

    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={1}
        style={{
          flex: focused ? 1 : 0.55,
          justifyContent: "center",
          alignItems: "center",
          height: 60,
        }}
      >
        <View>
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              {
                transform: [{ scale: viewScaleAnim }],
                backgroundColor: focused ? "white" : "#F39300",
                borderRadius: 20,
              },
            ]}
          />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 8,
              borderRadius: 16,
            }}
          >
            <Ionicons
              name={item.active}
              size={22}
              color={focused ? "#F39300" : "white"}
            />
            <Animated.View style={{ transform: [{ scale: textScaleAnim }] }}>
              {focused && (
                <Text
                  style={{
                    color: "#F39300",
                    paddingHorizontal: 8,
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {item.label}
                </Text>
              )}
            </Animated.View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const tabOptions = {
    tabBarButton: () => null,
    tabBarStyle: { display: "none" },
  };

  return (
    <>
      {isLogin === false ? (
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName="GettingStart"
        >
          <Stack.Screen name="GettingStart" component={GettingStart} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="SignUp" component={SignUp} />
          <Stack.Screen name="ResetPassword" component={ResetPassword} />
        </Stack.Navigator>
      ) : userData.role === "STUDENT" ? (
        <Tab.Navigator initialRouteName="Home" screenOptions={screenOptions}>
          {TabArrayStudent.map((item, index) => {
            return (
              <Tab.Screen
                key={index}
                name={item.route}
                component={item.component}
                options={{
                  tabBarButton: (props) => <TabButton {...props} item={item} />,
                }}
              />
            );
          })}
          <Tab.Screen
            name="Notification"
            component={Notification}
            options={tabOptions}
          />
          <Tab.Screen
            name="NotificationDetail"
            component={NotificationDetail}
            options={tabOptions}
          />
          <Tab.Screen name="Profile" component={Profile} options={tabOptions} />
          <Tab.Screen
            name="ViewProfile"
            component={ViewProfile}
            options={tabOptions}
          />
          <Tab.Screen name="Request" component={Request} options={tabOptions} />
          <Tab.Screen
            name="Appointment"
            component={Appointment}
            options={tabOptions}
          />
        </Tab.Navigator>
      ) : userData.role === "ACADEMIC_COUNSELOR" ? (
        <Tab.Navigator initialRouteName="Home" screenOptions={screenOptions}>
          {TabArrayCounselor.map((item, index) => {
            return (
              <Tab.Screen
                key={index}
                name={item.route}
                component={item.component}
                options={{
                  tabBarButton: (props) => <TabButton {...props} item={item} />,
                }}
              />
            );
          })}
          <Tab.Screen
            name="Notification"
            component={Notification}
            options={tabOptions}
          />
          <Tab.Screen
            name="NotificationDetail"
            component={NotificationDetail}
            options={tabOptions}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileCounselor}
            options={tabOptions}
          />
          <Tab.Screen
            name="Request"
            component={RequestCounselor}
            options={tabOptions}
          />
          <Tab.Screen
            name="Appointment"
            component={AppointmentCounselor}
            options={tabOptions}
          />
          <Tab.Screen name="Demand" component={Demand} options={tabOptions} />
        </Tab.Navigator>
      ) : userData.role === "NON_ACADEMIC_COUNSELOR" ? (
        <Tab.Navigator initialRouteName="Home" screenOptions={screenOptions}>
          {TabArrayCounselor.map((item, index) => {
            return (
              <Tab.Screen
                key={index}
                name={item.route}
                component={item.component}
                options={{
                  tabBarButton: (props) => <TabButton {...props} item={item} />,
                }}
              />
            );
          })}
          <Tab.Screen
            name="Notification"
            component={Notification}
            options={tabOptions}
          />
          <Tab.Screen
            name="NotificationDetail"
            component={NotificationDetail}
            options={tabOptions}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileCounselor}
            options={tabOptions}
          />
          <Tab.Screen
            name="Request"
            component={RequestCounselor}
            options={tabOptions}
          />
          <Tab.Screen
            name="Appointment"
            component={AppointmentCounselor}
            options={tabOptions}
          />
          <Tab.Screen name="Demand" component={Demand} options={tabOptions} />
        </Tab.Navigator>
      ) : null}
    </>
  );
}
