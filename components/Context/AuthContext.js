// import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Tạo context
export const AuthContext = createContext();

// Tạo provider
export const AuthProvider = ({ children }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [session, setSession] = useState(null);

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

  //   const login = async (userInfo, sessionInfo) => {
  //     setUserData(userInfo);
  //     setSession(sessionInfo)
  //     console.log(JSON.stringify(userInfo, undefined, 4))
  //     console.log(JSON.stringify(sessionInfo, undefined, 4))
  //     await AsyncStorage.setItem('userData', JSON.stringify(userInfo));
  //     await AsyncStorage.setItem('session', JSON.stringify(sessionInfo));
  //     const userDataAsync = await AsyncStorage.getItem('userData');
  //     const sessionAsync = await AsyncStorage.getItem('session');
  //     console.log(JSON.stringify(JSON.parse(userDataAsync), undefined, 4))
  //     console.log(JSON.stringify(JSON.parse(sessionAsync), undefined, 4))
  //     setIsLogin(true);
  //   };

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
        setSession,
        session,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};