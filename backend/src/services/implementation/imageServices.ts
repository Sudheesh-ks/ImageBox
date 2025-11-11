import cloudinary from "../../config/cloudinary";
import { HttpResponse } from "../../constants/responseMessage.constants";
import { IImageRepository } from "../../repositories/interface/iImageRepository";
import { ImageDocument } from "../../models/imageModel";
import { IImageService } from "../interface/iImageServices";
import mongoose from "mongoose";
import { ImageDTO } from "../../dtos/image.dto";
import { toImageDTO, toImageDTOs } from "../../mappers/image.mapper";

export class ImageService implements IImageService {
  constructor(private readonly _imageRepository: IImageRepository) {}

  async uploadImages(
    files: Express.Multer.File[],
    titles: string[],
    userId: string
  ): Promise<ImageDTO[]> {
    const uploadedImages = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const title = titles[i] || file.originalname;

      const image = await this._imageRepository.createImage({
        title,
        url: (file as any).path,
        public_id: (file as any).filename,
        userId: new mongoose.Types.ObjectId(userId),
      });

      uploadedImages.push(image);
    }
    return toImageDTOs(uploadedImages);
  }

  async getImages(
    userId: string
  ): Promise<{ images: ImageDTO[]; total: number }> {
    if (!userId) throw new Error(HttpResponse.UNAUTHORIZED);
    const { images, total } = await this._imageRepository.getImagesPaginated(userId);
    return { images: toImageDTOs(images), total };
  }

  async updateImage(
    id: string,
    title: string,
    newFile?: Express.Multer.File
  ): Promise<ImageDTO | null> {
    if (!id) throw new Error(HttpResponse.FIELDS_REQUIRED);

    let updates: Partial<ImageDocument> = { title };

    if (newFile) {
      updates = {
        ...updates,
        url: (newFile as any).path,
        public_id: (newFile as any).filename,
      };
    }

    const updatedImage = await this._imageRepository.updateImageById(
      id,
      updates
    );
    if (!updatedImage) throw new Error(HttpResponse.IMAGE_UPDATE_FAILED);

    return toImageDTO(updatedImage);
  }

  async deleteImage(id: string, public_id: string): Promise<void> {
    if (!id || !public_id) throw new Error(HttpResponse.FIELDS_REQUIRED);

    await cloudinary.uploader.destroy(public_id);
    const deleted = await this._imageRepository.deleteImageById(id);

    if (!deleted) throw new Error(HttpResponse.IMAGE_DELETE_FAILED);
  }

  async updateImageOrder(userId: string, orderedIds: string[]): Promise<void> {
    if (!userId || !orderedIds.length) throw new Error("Missing fields");
    await this._imageRepository.updateImageOrder(userId, orderedIds);
  }
}
