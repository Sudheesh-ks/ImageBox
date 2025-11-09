import otpModel, { OtpDocument } from "../../models/otpModel";
import { OtpTypes } from "../../types/otp";
import { BaseRepository } from "../baseRepository";
import { IOtpRepository } from "../interface/iOtpRepository";

export class OtpRepository
  extends BaseRepository<OtpDocument>
  implements IOtpRepository
{
  constructor() {
    super(otpModel);
  }
  async storeOtp(email: string, data: Partial<OtpTypes>): Promise<void> {
    await this.findOneAndUpdate(
      { email },
      { ...data, createdAt: new Date() },
      { upsert: true, new: true }
    );
  }

  async getOtp(
    email: string,
    otp?: string,
    purpose?: string
  ): Promise<OtpTypes | null> {
    const query: any = { email };
    if (otp) query.otp = otp;
    if (purpose) query.purpose = purpose;
    return this.findOne(query);
  }

  async deleteOtp(email: string): Promise<void> {
    await this.deleteOne({ email });
  }
}
