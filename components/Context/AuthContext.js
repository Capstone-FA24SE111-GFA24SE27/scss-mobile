import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosJWT, { BASE_URL } from "../../config/Config";

// Create context
export const AuthContext = createContext();

// Create provider
export const AuthProvider = ({ children }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // AsyncStorage.clear();
    const checkUserSession = async () => {
      const userDataAsync = await AsyncStorage.getItem("userData");
      const sessionAsync = await AsyncStorage.getItem("session");
      if (userDataAsync !== null && sessionAsync !== null) {
        const sessionAfterParse = sessionAsync;
        const userDataAfterParse = JSON.parse(userDataAsync);
        // const currentTime = new Date().getTime();
        // if (sessionAfterParse.expires_at > currentTime) {
        setUserData(userDataAfterParse);
        setSession(sessionAfterParse);
        setIsLogin(true);
        // }
      }
      console.log("Async");
      console.log(JSON.stringify(JSON.parse(userDataAsync), undefined, 4));
      console.log(sessionAsync);
    };

    checkUserSession();
  }, []);

  const login = async (userInfo, sessionInfo) => {
    setUserData(userInfo);
    setSession(sessionInfo);
    await AsyncStorage.setItem("userData", JSON.stringify(userInfo));
    await AsyncStorage.setItem("session", sessionInfo);
    const userDataAsync = await AsyncStorage.getItem("userData");
    const sessionAsync = await AsyncStorage.getItem("session");
    console.log(JSON.stringify(JSON.parse(userDataAsync), undefined, 4));
    console.log(sessionAsync);
    setIsLogin(true);
  };

  const fetchProfile = async () => {
    try {
      const profileRes = await axiosJWT.get(`${BASE_URL}/profile`);
      const profileData = profileRes?.data?.content?.profile || null;
      setProfile(profileData);
    } catch (err) {
      console.log(err);
    }
  };

  const logout = () => {
    AsyncStorage.clear();
    setIsLogin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isLogin,
        login,
        logout,
        setIsLogin,
        userData,
        setUserData,
        session,
        setSession,
        profile,
        fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};