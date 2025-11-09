import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { OtpTypes } from "../types/otp";

export interface OtpDocument extends Omit<OtpTypes, "_id">, Document {
  _id: Types.ObjectId;
}

const otpSchema: Schema<OtpDocument> = new Schema<OtpDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    otp: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ["register", "reset-password"],
      required: true,
    },
    userData: {
      email: { type: String },
      password: { type: String },
      phone: { type: String },
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300, // 5 minutes
    },
  },
  {
    timestamps: false,
  }
);

const otpModel: Model<OtpDocument> = mongoose.model<OtpDocument>(
  "otp",
  otpSchema
);

export default otpModel;
