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
import GettingStart from "../Screen/GettingStart";
import Schedule from "../Screen/Schedule";
import Personal from "../Screen/Personal";
import Notification from "../Screen/Notification";
import Profile from "../Screen/Profile";
import EditProfile from "../Screen/EditProfile";
import ResetPassword from "../Screen/ResetPassword";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export default function Navigation() {
  const { isLogin } = useContext(AuthContext);

  const screenOptions = () => ({
    headerShown: false,
    tabBarStyle: {
      height: 60,
      // position: "absolute",
      // margin: 16,
      // borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
    },
  });

  const TabArray = [
    {
      route: "Home",
      label: "Home",
      active: "home",
      inActive: "home-outline",
      component: Home,
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
          flex: focused ? 1 : 0.65,
          justifyContent: "center",
          alignItems: "center",
          height: 60,
        }}
      >
        <View>
          <Animated.View
            style={[StyleSheet.absoluteFillObject, {
              transform: [{ scale: viewScaleAnim }],
              backgroundColor: focused ? "#ff469e" : "white",
              borderRadius: 16,
            }]}
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
              color={focused ? "white" : "black"}
            />
            <Animated.View style={{ transform: [{ scale: textScaleAnim }] }}>
              {focused && (
                <Text
                  style={{
                    color: "white",
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
      ) : (
        <Tab.Navigator initialRouteName="Home" screenOptions={screenOptions}>
          {TabArray.map((item, index) => {
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
          <Tab.Screen name="Notification" component={Notification} options={tabOptions} />
          <Tab.Screen name="Profile" component={Profile} options={tabOptions} />
          <Tab.Screen
            name="EditProfile"
            component={EditProfile}
            options={tabOptions}
          />
          {/* <Tab.Screen
            name="Personal"
            component={Personal}
            options={tabOptions}
          />
          
          <Tab.Screen
            name="ChangePassword"
            component={ChangePassword}
            options={tabOptions}
          />
          <Tab.Screen
            name="DeleteAccount"
            component={DeleteAccount}
            options={tabOptions}
          />
          <Tab.Screen name="PT" component={PT} options={tabOptions} /> */}
        </Tab.Navigator>
      )}
    </>
  );
}
