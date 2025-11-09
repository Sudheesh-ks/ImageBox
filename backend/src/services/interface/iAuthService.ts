import { UserDTO } from "../../dtos/user.dto";

export interface IAuthService {
  register(email: string, password: string, phone: string): Promise<void>;
  verifyOtp(
    email: string,
    otp: string,
    purpose: "register" | "reset-password"
  ): Promise<{
    purpose: string;
    user?: UserDTO;
    refreshToken?: string;
  }>;
  finalizeRegister(userData: {
    email: string;
    password: string;
    phone: string;
  }): Promise<UserDTO>;
  resendOtp(email: string): Promise<void>;
  checkEmailExists(email: string): Promise<boolean>;
  forgotPasswordRequest(email: string): Promise<void>;
  resetPassword(email: string, newPassword: string): Promise<void>;
  login(
    email: string,
    password: string
  ): Promise<{ user: UserDTO; token: string; refreshToken: string }>;
  refreshToken(
    refreshToken?: string
  ): Promise<{ token: string; refreshToken: string }>;
}
