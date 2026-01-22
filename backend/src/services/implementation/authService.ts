import { HttpResponse } from "../../constants/responseMessage.constants";
import { UserDTO } from "../../dtos/user.dto";
import { toUserDTO } from "../../mappers/user.mapper";
import { userDocument } from "../../models/userModel";
import { IOtpRepository } from "../../repositories/interface/iOtpRepository";
import { IAuthRepository } from "../../repositories/interface/iAuthRepository";
import { sendOTP } from "../../utils/mail.util";
import { generateOTP } from "../../utils/otp.util";
import {
  isValidEmail,
  isValidPassword,
  isValidPhone,
} from "../../utils/validator.util";
import { IAuthService } from "../interface/iAuthService";
import bcrypt from "bcrypt";
import { AuthPurpose } from "../../constants/authPurpose.constants";

export class AuthService implements IAuthService {
  constructor(
    private readonly _userRepository: IAuthRepository,
    private readonly _otpRepository: IOtpRepository
  ) { }

  async register(
    email: string,
    password: string,
    phone: string
  ): Promise<void> {
    if (!email || !password || !phone)
      throw new Error(HttpResponse.FIELDS_REQUIRED);
    if (!isValidEmail(email)) throw new Error(HttpResponse.INVALID_EMAIL);
    if (!isValidPassword(password))
      throw new Error(HttpResponse.INVALID_PASSWORD);
    if (!isValidPhone(phone)) throw new Error(HttpResponse.INVALID_PHONE);

    const existing = await this._userRepository.findUserByEmail(email);
    if (existing) throw new Error(HttpResponse.EMAIL_ALREADY_EXISTS);

    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    console.log("Generated OTP:", otp);
    await this._otpRepository.storeOtp(email, {
      otp,
      purpose: AuthPurpose.REGISTER,
      userData: { email, password: hashed, phone },
    });
    sendOTP(email, otp).catch((err) => console.error("OTP send failed:", err));
  }

  async verifyOtp(
    email: string,
    otp: string,
    purpose: AuthPurpose
  ): Promise<{ purpose: string; user?: UserDTO }> {
    const record = await this._otpRepository.getOtp(email, otp, purpose);
    if (!record) throw new Error(HttpResponse.OTP_INVALID);

    if (
      purpose === AuthPurpose.REGISTER &&
      record.userData &&
      record.userData.email &&
      record.userData.password &&
      record.userData.phone
    ) {
      const newUser = await this.finalizeRegister({
        email: record.userData.email,
        password: record.userData.password,
        phone: record.userData.phone,
      });
      await this._otpRepository.deleteOtp(email);
      return { purpose, user: newUser };
    }

    if (purpose === AuthPurpose.RESET_PASSWORD) {
      await this._otpRepository.storeOtp(email, { otp: "VERIFIED", purpose });
      return { purpose };
    }

    throw new Error(HttpResponse.BAD_REQUEST);
  }

  async finalizeRegister(userData: {
    email: string;
    password: string;
    phone: string;
  }): Promise<UserDTO> {
    const newUser = (await this._userRepository.createUser(
      userData
    )) as userDocument;
    return toUserDTO(newUser);
  }

  async login(email: string, password: string): Promise<{ user: UserDTO }> {
    const user = await this._userRepository.findUserByEmail(email);
    if (!user) throw new Error(HttpResponse.INVALID_CREDENTIALS);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error(HttpResponse.INCORRECT_PASSWORD);
    return { user: toUserDTO(user) };
  }

  async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  async resendOtp(email: string): Promise<void> {
    const oldRecord = await this._otpRepository.getOtp(email);

    if (!oldRecord) {
      throw new Error(HttpResponse.OTP_NOT_FOUND);
    }

    const newOtp = generateOTP();
    console.log("Generated new OTP:", newOtp);

    // Extract necessary data from oldRecord to avoid spread issues with Mongoose documents
    const updatedRecord = {
      otp: newOtp,
      purpose: oldRecord.purpose,
      userData: oldRecord.userData,
    };

    await this._otpRepository.storeOtp(email, updatedRecord);
    sendOTP(email, newOtp).catch((err) =>
      console.error("OTP resend failed:", err)
    );
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const user = await this._userRepository.findUserByEmail(email);
    return !!user;
  }

  async getUserById(id: string): Promise<UserDTO | null> {
    const user = await this._userRepository.findUserById(id);
    if (!user) return null;
    return toUserDTO(user);
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
      purpose: AuthPurpose.RESET_PASSWORD,
    });

    sendOTP(email, otp).catch((err) => console.error("OTP send failed:", err));
  }

  async resetPassword(email: string, newPassword: string): Promise<void> {
    if (!isValidPassword(newPassword)) {
      throw new Error(HttpResponse.INVALID_PASSWORD);
    }

    const record = await this._otpRepository.getOtp(email);

    if (
      !record ||
      record.purpose !== AuthPurpose.RESET_PASSWORD ||
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
}
