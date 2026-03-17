import cloudinary from "../../config/cloudinary";
import { HttpResponse } from "../../constants/responseMessage.constants";
import { IImageRepository } from "../../repositories/interface/iImageRepository";
import { ImageDocument } from "../../models/imageModel";
import { IImageService } from "../interface/iImageServices";
import mongoose from "mongoose";
import { ImageDTO } from "../../dtos/image.dto";
import { toImageDTO, toImageDTOs } from "../../mappers/image.mapper";
import sharp from "sharp";

export class ImageService implements IImageService {
  constructor(private readonly _imageRepository: IImageRepository) {}

  async uploadImages(
    files: Express.Multer.File[],
    titles: string[],
    userId: string,
  ): Promise<ImageDTO[]> {
    const uploadedImages = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const title = titles[i] || file.originalname;

      const compressedBuffer = await sharp(file.buffer)
        .resize({ width: 1200 })
        .jpeg({ quality: 80 })
        .toBuffer();

      console.log("original:", file.size / 1024);
      console.log("compressed:", compressedBuffer.length / 1024);

      const uploadResult = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "imagebox",
              resource_type: "image",
            },
            (error, result) => {
              if (error) return reject(error);
              else resolve(result);
            },
          )
          .end(compressedBuffer);
      });

      const image = await this._imageRepository.createImage({
        title,
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        userId: new mongoose.Types.ObjectId(userId),
      });

      uploadedImages.push(image);
    }
    return toImageDTOs(uploadedImages);
  }

  async getImages(
    userId: string,
  ): Promise<{ images: ImageDTO[]; total: number }> {
    if (!userId) throw new Error(HttpResponse.UNAUTHORIZED);
    const { images, total } =
      await this._imageRepository.getImagesPaginated(userId);
    return { images: toImageDTOs(images), total };
  }

  async updateImage(
    id: string,
    title: string,
    newFile?: Express.Multer.File,
  ): Promise<ImageDTO | null> {
    if (!id) throw new Error(HttpResponse.FIELDS_REQUIRED);

    let updates: Partial<ImageDocument> = { title };

    if (newFile) {
      const compressedBuffer = await sharp(newFile.buffer)
        .resize({ width: 1200 })
        .jpeg({ quality: 80 })
        .toBuffer();
      
      const uploadResult = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "imagebox",
            },
            (error, result) => {
              if (error) return reject(error);
              else resolve(result);
            }
          )
          .end(compressedBuffer);
      });
      
      updates = {
        ...updates,
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      };
    }

    const updatedImage = await this._imageRepository.updateImageById(
      id,
      updates,
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
