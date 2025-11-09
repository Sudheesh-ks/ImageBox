import { OtpTypes } from "../../types/otp";

export interface IOtpRepository {
  storeOtp(email: string, data: Partial<OtpTypes>): Promise<void>;
  getOtp(
    email: string,
    otp?: string,
    purpose?: string
  ): Promise<OtpTypes | null>;
  deleteOtp(email: string): Promise<void>;
}
