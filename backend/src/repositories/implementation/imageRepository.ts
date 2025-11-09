import imageModel, { ImageDocument } from "../../models/imageModel";
import { BaseRepository } from "../baseRepository";
import { IImageRepository } from "../interface/iImageRepository";

export class ImageRepository
  extends BaseRepository<ImageDocument>
  implements IImageRepository
{
  constructor() {
    super(imageModel);
  }

  async createImage(data: Partial<ImageDocument>): Promise<ImageDocument> {
    const image = await this.create(data);
    return image as ImageDocument;
  }

  async getImagesPaginated(
    userId: string
  ): Promise<{ images: ImageDocument[]; total: number }> {
    const images = await imageModel.find({ userId }).sort({ position: 1 });
    const total = await imageModel.countDocuments({ userId });
    return { images, total };
  }

  async updateImageById(
    id: string,
    updates: Partial<ImageDocument>
  ): Promise<ImageDocument | null> {
    const updatedImage = await imageModel.findByIdAndUpdate(id, updates, {
      new: true,
    });
    return updatedImage;
  }

  async deleteImageById(id: string): Promise<boolean> {
    const deleted = await imageModel.findByIdAndDelete(id);
    return !!deleted;
  }

  async updateImageOrder(userId: string, orderedIds: string[]): Promise<void> {
    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, userId },
        update: { position: index },
      },
    }));

    await imageModel.bulkWrite(bulkOps);
  }
}
