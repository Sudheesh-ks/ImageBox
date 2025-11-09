import { refreshTokenAPI } from "../services/authServices";

export const tryAutoLogin = async () => {
  try {
    const data = await refreshTokenAPI();
    if (data?.token) {
      localStorage.setItem("accessToken", data.token);
      return true;
    }
  } catch {
    localStorage.removeItem("accessToken");
  }
  return false;
};
