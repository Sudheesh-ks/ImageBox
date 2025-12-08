import { userApi } from "../axios/axiosInstance";
import { AUTH_API } from "../constants/apiConstants";
import { showErrorToast } from "../utils/errorHandler";

interface RegisterData {
  email: string;
  password: string;
  phone: string;
}

// Register new user
export const registerAPI = async (data: RegisterData) => {
  try {
    const res = await userApi.post(AUTH_API.REGISTER, data);
    return res.data;
  } catch (error) {
    showErrorToast(error);
  }
};

// Verify OTP
export const verifyOtpAPI = async (
  email: string,
  otp: string,
  purpose: string
) => {
  try {
    const res = await userApi.post(AUTH_API.VERIFY_OTP, {
      email,
      otp,
      purpose,
    });
    return res.data;
  } catch (error) {
    showErrorToast(error);
  }
};

// Resend OTP
export const resendOtpAPI = async (email: string) => {
  try {
    const res = await userApi.post(AUTH_API.RESEND_OTP, { email });
    return res.data;
  } catch (error) {
    showErrorToast(error);
  }
};

// Login
export const loginAPI = async (email: string, password: string) => {
  try {
    const res = await userApi.post(AUTH_API.LOGIN, { email, password });
    return res.data;
  } catch (error) {
    showErrorToast(error);
  }
};

// Forgot Password
export const forgotPasswordAPI = async (email: string) => {
  try {
    const res = await userApi.post(AUTH_API.FORGOT_PASSWORD, { email });
    return res.data;
  } catch (error) {
    showErrorToast(error);
  }
};

// Reset Password
export const resetPasswordAPI = async (email: string, newPassword: string) => {
  try {
    const res = await userApi.post(AUTH_API.RESET_PASSWORD, {
      email,
      newPassword,
    });
    return res.data;
  } catch (error) {
    showErrorToast(error);
  }
};

// Refresh token
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
  try {
    const res = await userApi.post(AUTH_API.LOGOUT);
    return res.data;
  } catch (error) {
    showErrorToast(error);
  }
};
