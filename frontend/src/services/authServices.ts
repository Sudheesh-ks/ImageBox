import { userApi } from "../axios/axiosInstance";
import { AUTH_API } from "../constants/apiConstants";

interface RegisterData {
  email: string;
  password: string;
  phone: string;
}

// Register new user
export const registerAPI = async (data: RegisterData) => {
  const res = await userApi.post(AUTH_API.REGISTER, data);
  return res.data;
};

// Verify OTP
export const verifyOtpAPI = async (
  email: string,
  otp: string,
  purpose: string
) => {
  const res = await userApi.post(AUTH_API.VERIFY_OTP, {
    email,
    otp,
    purpose,
  });
  return res.data;
};

// Resend OTP
export const resendOtpAPI = async (email: string) => {
  const res = await userApi.post(AUTH_API.RESEND_OTP, { email });
  return res.data;
};

// Login
export const loginAPI = async (email: string, password: string) => {
  const res = await userApi.post(AUTH_API.LOGIN, { email, password });
  return res.data;
};

// Forgot Password
export const forgotPasswordAPI = async (email: string) => {
  const res = await userApi.post(AUTH_API.FORGOT_PASSWORD, { email });
  return res.data;
};

// Reset Password
export const resetPasswordAPI = async (email: string, newPassword: string) => {
  const res = await userApi.post(AUTH_API.RESET_PASSWORD, {
    email,
    newPassword,
  });
  return res.data;
};

// Refresh token - Keep try-catch as it has specific internal recovery logic
export const refreshTokenAPI = async (): Promise<string | null> => {
  try {
    const res = await userApi.get(AUTH_API.REFRESH_TOKEN, {
      withCredentials: true,
    });
    const accessToken = res.data.accessToken;
    localStorage.setItem("accessToken", accessToken);
    return accessToken;
  } catch (error) {
    console.error("Refresh token failed:", error);
    localStorage.removeItem("accessToken");
    return null;
  }
};

// Logout
export const logoutAPI = async () => {
  const res = await userApi.post(AUTH_API.LOGOUT);
  return res.data;
};
