import { HttpResponse } from "../../constants/responseMessage.constants";
import { UserDTO } from "../../dtos/user.dto";
import { toUserDTO } from "../../mappers/user.mapper";
import { userDocument } from "../../models/userModel";
import { IOtpRepository } from "../../repositories/interface/iOtpRepository";
import { IAuthRepository } from "../../repositories/interface/iAuthRepository";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.util";
import { sendOTP } from "../../utils/mail.util";
import { generateOTP } from "../../utils/otp.util";
import { isValidEmail, isValidPassword, isValidPhone } from "../../utils/validator.util";
import { IAuthService } from "../interface/iAuthService";
import bcrypt from "bcrypt";

export class AuthService implements IAuthService {
  constructor(
    private readonly _userRepository: IAuthRepository,
    private readonly _otpRepository: IOtpRepository
  ) {}

  async register(
    email: string,
    password: string,
    phone: string
  ): Promise<void> {
    if (!email || !password || !phone) {
      throw new Error(HttpResponse.FIELDS_REQUIRED);
    }

    if (!isValidEmail(email)) {
      throw new Error(HttpResponse.INVALID_EMAIL);
    }

    if (!isValidPassword(password)) {
      throw new Error(HttpResponse.INVALID_PASSWORD);
    }

    if(!isValidPhone(phone)){
      throw new Error(HttpResponse.INVALID_PHONE);
    }

    const existing = await this._userRepository.findUserByEmail(email);
    if (existing) {
      throw new Error(HttpResponse.EMAIL_ALREADY_EXISTS);
    }

    const hashed = await this.hashPassword(password);
    const otp = generateOTP();
    console.log("Generated OTP:", otp);

    await this._otpRepository.storeOtp(email, {
      otp,
      purpose: "register",
      userData: { email, password: hashed, phone },
    });

    try {
      await sendOTP(email, otp);
    } catch (error) {
      console.error("Email send failed:", error);
      throw new Error(HttpResponse.OTP_SEND_FAILED);
    }
  }
  async verifyOtp(
    email: string,
    otp: string,
    purpose: "register" | "reset-password"
  ): Promise<{
    purpose: string;
    user?: UserDTO;
    refreshToken?: string;
  }> {
    const record = await this._otpRepository.getOtp(email, otp, purpose);

    if (!record) {
      throw new Error(HttpResponse.OTP_INVALID);
    }

    if (purpose === "register") {
      if (
        !record.userData ||
        !record.userData.email ||
        !record.userData.password ||
        !record.userData.phone
      ) {
        throw new Error("User data missing for registration");
      }

      const newUser = await this.finalizeRegister({
        email: record.userData.email,
        password: record.userData.password,
        phone: record.userData.phone,
      });

      await this._otpRepository.deleteOtp(email);

      const refreshToken = generateRefreshToken(newUser._id!);
      return { purpose, user: newUser, refreshToken };
    }

    if (purpose === "reset-password") {
      await this._otpRepository.storeOtp(email, { otp: "VERIFIED", purpose });
      return { purpose };
    }

    throw new Error(HttpResponse.BAD_REQUEST);
  }

  async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }
  async finalizeRegister(userData: {
    email: string;
    password: string;
    phone: string;
  }): Promise<UserDTO> {
    const existing = await this._userRepository.findUserByEmail(userData.email);
    if (existing) throw new Error("User already exists");

    const newUser = (await this._userRepository.createUser({
      email: userData.email,
      password: userData.password,
      phone: userData.phone,
    })) as userDocument;

    return toUserDTO(newUser);
  }

  async resendOtp(email: string): Promise<void> {
    const oldRecord = await this._otpRepository.getOtp(email);

    if (!oldRecord) {
      throw new Error("No pending OTP found. Please register again.");
    }

    const newOtp = generateOTP();
    console.log("Generated new OTP:", newOtp);

    const updatedRecord = { ...oldRecord, otp: newOtp };

    await this._otpRepository.storeOtp(email, updatedRecord);
    await sendOTP(email, newOtp);
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const user = await this._userRepository.findUserByEmail(email);
    return !!user;
  }

  async forgotPasswordRequest(email: string): Promise<void> {
    const userExists = await this.checkEmailExists(email);
    if (!userExists) {
      throw new Error(HttpResponse.USER_NOT_FOUND);
    }

    const otp = generateOTP();
    console.log("Generated OTP:", otp);

    await this._otpRepository.storeOtp(email, {
      otp,
      purpose: "reset-password",
    });

    await sendOTP(email, otp);
  }

  async resetPassword(email: string, newPassword: string): Promise<void> {
    if (!isValidPassword(newPassword)) {
      throw new Error(HttpResponse.INVALID_PASSWORD);
    }

    const record = await this._otpRepository.getOtp(email);

    if (
      !record ||
      record.purpose !== "reset-password" ||
      record.otp !== "VERIFIED"
    ) {
      throw new Error(HttpResponse.OTP_EXPIRED_OR_INVALID);
    }

    const hashed = await this.hashPassword(newPassword);
    const updated = await this._userRepository.updatePasswordByEmail(
      email,
      hashed
    );

    if (!updated) {
      throw new Error(HttpResponse.USER_NOT_FOUND);
    }

    this._otpRepository.deleteOtp(email);
  }

  async login(
    email: string,
    password: string
  ): Promise<{ user: UserDTO; token: string; refreshToken: string }> {
    if (!email || !password) {
      throw new Error(HttpResponse.FIELDS_REQUIRED);
    }

    if (!isValidEmail(email)) {
      throw new Error(HttpResponse.INVALID_EMAIL);
    }

    if (!isValidPassword(password)) {
      throw new Error(HttpResponse.INVALID_PASSWORD);
    }

    const user = await this._userRepository.findUserByEmail(email);
    if (!user) {
      throw new Error(HttpResponse.INVALID_CREDENTIALS);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error(HttpResponse.INCORRECT_PASSWORD);
    }

    const token = generateAccessToken(user._id.toString(), user.email);
    const refreshToken = generateRefreshToken(user._id.toString());

    return {
      user: toUserDTO(user),
      token,
      refreshToken,
    };
  }

  async refreshToken(
    refreshToken?: string
  ): Promise<{ token: string; refreshToken: string }> {
    if (!refreshToken) {
      throw new Error(HttpResponse.REFRESH_TOKEN_MISSING);
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
      throw new Error(HttpResponse.REFRESH_TOKEN_INVALID);
    }

    const user = await this._userRepository.findUserById(decoded.id);
    if (!user) {
      throw new Error("User not found");
    }

    const newAccessToken = generateAccessToken(user._id.toString(), user.email);
    const newRefreshToken = generateRefreshToken(user._id.toString());

    return { token: newAccessToken, refreshToken: newRefreshToken };
  }
}
