import axios from "axios";

import { BACK_END_URL } from "@/constants";

const axiosInstance = axios.create({
  baseURL: BACK_END_URL,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("jwt");

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
