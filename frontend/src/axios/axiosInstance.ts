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
    const isRefreshRequest = originalRequest.url?.includes("/refresh-token");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshRequest &&
      !originalRequest.url?.includes("/logout")
    ) {
      originalRequest._retry = true;
      try {
        const newAccess = await refreshTokenAPI();
        if (newAccess) {
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return userApi(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
      }

      localStorage.removeItem("accessToken");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);
