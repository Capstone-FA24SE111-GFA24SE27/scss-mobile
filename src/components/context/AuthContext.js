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
      console.log(JSON.stringify(JSON.parse(userDataAsync), undefined, 4));
      // console.log(sessionAsync);
    };

    checkUserSession();
  }, []);

  const login = async (userInfo, sessionInfo) => {
    await AsyncStorage.setItem("userData", JSON.stringify(userInfo));
    await AsyncStorage.setItem("session", sessionInfo);
    // await AsyncStorage.setItem("refreshToken", refreshToken);
    setUserData(userInfo);
    setSession(sessionInfo);
    // const userDataAsync = await AsyncStorage.getItem("userData");
    // const sessionAsync = await AsyncStorage.getItem("session");
    // console.log(JSON.stringify(JSON.parse(userDataAsync), undefined, 4));
    // console.log(sessionAsync);
    setIsLogin(true);
  };

  const fetchProfile = async () => {
    try {
      const profileRes = await axiosJWT.get(`${BASE_URL}/profile`);
      const profileData = profileRes?.data?.content?.body?.content?.profile || null;
      if (userData.role == "STUDENT") {
        profileData["studentCode"] = profileRes?.data?.content?.body?.content?.studentCode;
        // profileData["specialization"] = profileRes?.data?.content?.body?.content?.specialization;
        profileData["department"] = profileRes?.data?.content?.body?.content?.department;
        profileData["major"] = profileRes?.data?.content?.body?.content?.major;
      }
      if (userData.role == "ACADEMIC_COUNSELOR") {
        profileData["status"] = profileRes?.data?.content?.body?.content?.status;
        // profileData["specialization"] = profileRes?.data?.content?.body?.content?.specialization;
        profileData["academicDegree"] = profileRes?.data?.content?.body?.content?.academicDegree;
        profileData["department"] = profileRes?.data?.content?.body?.content?.department;
        profileData["major"] = profileRes?.data?.content?.body?.content?.major;
      }
      if (userData.role == "NON_ACADEMIC_COUNSELOR") {
        profileData["status"] = profileRes?.data?.content?.body?.content?.status;
        profileData["expertise"] = profileRes?.data?.content?.body?.content?.expertise;
        profileData["industryExperience"] = profileRes?.data?.content?.body?.content?.industryExperience;
      }
      setProfile(profileData);
    } catch (err) {
      console.log("Can't fetch profile");
    }
  };

  const logout = () => {
    AsyncStorage.clear();
    setProfile(null);
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
