import { ImageDocument } from "../../models/imageModel";

export interface IImageService {
  uploadImages(
    files: Express.Multer.File[],
    titles: string[],
    userId: string
  ): Promise<ImageDocument[]>;

  getImages(
    userId: string
  ): Promise<{ images: ImageDocument[]; total: number }>;

  updateImage(
    id: string,
    title: string,
    newFile?: Express.Multer.File
  ): Promise<ImageDocument | null>;

  deleteImage(id: string, public_id: string): Promise<void>;
  updateImageOrder(userId: string, orderedIds: string[]): Promise<void>;
}
