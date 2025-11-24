import axios from "axios";
import { refreshTokenAPI } from "../services/authServices";

export const userApi = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

userApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

userApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newAccess = await refreshTokenAPI();
      if (newAccess) {
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return userApi(originalRequest);
      } else {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);
