import { ImageDocument } from "../../models/imageModel";

export interface IImageRepository {
  createImage(data: Partial<ImageDocument>): Promise<ImageDocument>;
  getImagesPaginated(
    userId: string
  ): Promise<{ images: ImageDocument[]; total: number }>;
  updateImageById(
    id: string,
    updates: Partial<ImageDocument>
  ): Promise<ImageDocument | null>;
  deleteImageById(id: string): Promise<boolean>;
  updateImageOrder(userId: string, orderedIds: string[]): Promise<void>;
}
