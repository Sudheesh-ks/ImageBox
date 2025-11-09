import axios from "axios";
import { showErrorToast } from "../utils/errorHandler";

export const userApi = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

userApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const refreshTokenAPI = async () => {
  try {
    const res = await userApi.post(
      "/refresh-token",
      {},
      { withCredentials: true }
    );
    return res.data;
  } catch (error) {
    showErrorToast(error);
    throw error;
  }
};

userApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const data = await refreshTokenAPI();
        if (data?.token) {
          localStorage.setItem("accessToken", data.token);
          originalRequest.headers["Authorization"] = `Bearer ${data.token}`;
          return userApi.request(originalRequest);
        }
      } catch (error) {
        console.log(error);
        localStorage.removeItem("accessToken");
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);
