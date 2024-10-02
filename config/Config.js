// Replace localhost with 192.168.x.x on local device
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
export const BASE_URL = "http://192.168.1.3:8080/api"
const axiosJWT = axios.create({
  baseURL: BASE_URL,
});

// Add a request interceptor
axiosJWT.interceptors.request.use(
  async (request) => {
    if (!request.headers['Authorization']) {
      // Await the access token retrieval
      const storedAccessToken = await AsyncStorage.getItem("session") || "";
      request.headers['Authorization'] = `Bearer ${storedAccessToken}`;
    }
    return request;
  },
  (error) => Promise.reject(error)
);

export default axiosJWT
