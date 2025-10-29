import axios from "axios";
import * as SecureStore from "expo-secure-store";

import { BACK_END_URL } from "@/constants";

const axiosInstance = axios.create({
  // baseURL: "http://192.168.170.147:8000",
  // baseURL: "http://192.168.0.136:8000",
  baseURL: BACK_END_URL,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("jwt");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
