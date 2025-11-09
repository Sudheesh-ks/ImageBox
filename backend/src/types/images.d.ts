import { Types } from "mongoose";

export interface ImageTypes {
  _id?: Types.ObjectId;
  title: string;
  url: string;
  public_id: string;
  userId: Types.ObjectId;
  position: number;
  createdAt?: Date;
  updatedAt?: Date;
}
