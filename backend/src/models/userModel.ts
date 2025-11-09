import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { UserTypes } from "../types/user";

export interface userDocument extends Omit<UserTypes, "_id">, Document {
  _id: Types.ObjectId;
}

const userSchema: Schema<userDocument> = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    required: true,
  },
});

const userModel: Model<userDocument> = mongoose.model<userDocument>(
  "user",
  userSchema
);

export default userModel;
