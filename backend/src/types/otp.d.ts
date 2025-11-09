export interface OtpTypes {
  _id: Types.ObjectId;
  email: string;
  otp: string;
  purpose: "register" | "reset-password";
  userData?: {
    email?: string;
    password?: string;
    phone?: string;
  };
  createdAt: Date;
}
