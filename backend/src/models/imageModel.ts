import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { ImageTypes } from "../types/images";

export interface ImageDocument extends Omit<ImageTypes, "_id">, Document {
  _id: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const imageSchema: Schema<ImageDocument> = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    public_id: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    position: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const imageModel: Model<ImageDocument> = mongoose.model<ImageDocument>(
  "image",
  imageSchema
);

export default imageModel;
