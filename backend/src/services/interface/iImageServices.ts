import { ImageDTO } from "../../dtos/image.dto";

export interface IImageService {
  uploadImages(
    files: Express.Multer.File[],
    titles: string[],
    userId: string
  ): Promise<ImageDTO[]>;

  getImages(
    userId: string
  ): Promise<{ images: ImageDTO[]; total: number }>;

  updateImage(
    id: string,
    title: string,
    newFile?: Express.Multer.File
  ): Promise<ImageDTO | null>;

  deleteImage(id: string, public_id: string): Promise<void>;
  updateImageOrder(userId: string, orderedIds: string[]): Promise<void>;
}
