// Replace localhost with 192.168.x.x on local device
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { REACT_APP_BASE_URL } from '@env';
console.log(REACT_APP_BASE_URL);
export const BASE_URL = `${REACT_APP_BASE_URL}:8080/api`; 
export const SOCKET_URL = `${REACT_APP_BASE_URL}:9092`;
const axiosJWT = axios.create({
  baseURL: BASE_URL,
});

// Add a request interceptor
axiosJWT.interceptors.request.use(
  async (request) => {
    if (!request.headers["Authorization"]) {
      const storedAccessToken = (await AsyncStorage.getItem("session")) || "";
      request.headers["Authorization"] = `Bearer ${storedAccessToken}`;
    }
    return request;
  },
  (error) => Promise.reject(error)
);

// axiosJWT.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
//     const url = `${BASE_URL}/refresh-token`;
//     // If the error status is 401 and there is no originalRequest._retry flag,
//     // it means the token has expired and we need to refresh it
//     if (
//       error.response.status >= 400 &&
//       error.response.status <= 404 &&
//       !originalRequest._retry
//     ) {
//       originalRequest._retry = true;
//       try {
//         const currRefreshToken = await AsyncStorage.getItem("refreshToken");
//         const response = await axios.get(url, {
//           params: {
//             refreshToken: currRefreshToken,
//           },
//         });
//         const { accessToken, refreshToken } = response.data.content;

//         await AsyncStorage.setItem("session", accessToken);
//         await AsyncStorage.setItem("refreshToken", refreshToken);

//         // Retry the original request with the new token
//         originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
//         return axios(originalRequest);
//       } catch (error) {}
//     }

//     return Promise.reject(error);
//   }
// );

export default axiosJWT;
