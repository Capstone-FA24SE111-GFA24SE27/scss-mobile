import React, { useContext, useEffect, useRef } from "react";
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
import { AuthContext } from "../Context/AuthContext";
import Login from "../Screen/Login";
import SignUp from "../Screen/SignUp";
import Home from "../Screen/Home";
import HomeCounselor from "../Screen/counselor/Home";
import GettingStart from "../Screen/GettingStart";
import Schedule from "../Screen/Schedule";
import ScheduleCounselor from "../Screen/counselor/Schedule";
import Personal from "../Screen/Personal";
import PersonalCounselor from "../Screen/counselor/Personal";
import Notification from "../Screen/Notification";
import Profile from "../Screen/Profile";
import ProfileCounselor from "../Screen/counselor/Profile";
import ViewProfile from "../Screen/ViewProfile";
import ResetPassword from "../Screen/ResetPassword";
import CounselorProfile from "../Screen/CounselorProfile";
import Counselor from "../Screen/Counselor";
import Request from "../Screen/Request";
import RequestCounselor from "../Screen/counselor/Request";
import Event from "../Screen/Event";

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
      component: Counselor,
    },{
      route: "Event",
      label: "Event",
      active: "megaphone",
      inActive: "megaphone-outline",
      component: Event,
    },
    {
      route: "Schedule",
      label: "Schedule",
      active: "calendar",
      inActive: "calendar-outline",
      component: Schedule,
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
      route: "Schedule",
      label: "Schedule",
      active: "calendar",
      inActive: "calendar-outline",
      component: ScheduleCounselor,
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
          flex: focused ? 1 : 0.5,
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
          <Tab.Screen name="Profile" component={Profile} options={tabOptions} />
          <Tab.Screen
            name="CounselorProfile"
            component={CounselorProfile}
            options={tabOptions}
          />
          <Tab.Screen
            name="ViewProfile"
            component={ViewProfile}
            options={tabOptions}
          />
          <Tab.Screen name="Request" component={Request} options={tabOptions} />
        </Tab.Navigator>
      ) : userData.role === "COUNSELOR" ? (
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
            name="Request"
            component={RequestCounselor}
            options={tabOptions}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileCounselor}
            options={tabOptions}
          />
        </Tab.Navigator>
      ) : null}
    </>
  );
}
