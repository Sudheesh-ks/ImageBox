import axios from "axios";

export const userApi = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
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
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);
