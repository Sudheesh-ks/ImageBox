import { ImageDocument } from "../models/imageModel";
import { ImageDTO } from "../dtos/image.dto";

export const toImageDTO = (image: ImageDocument): ImageDTO => {
  return {
    _id: image._id.toString(),
    title: image.title,
    url: image.url,
    public_id: image.public_id,
    userId: image.userId.toString(),
    position: image.position,
    createdAt: image.createdAt,
    updatedAt: image.updatedAt,
  };
};

export const toImageDTOs = (images: ImageDocument[]): ImageDTO[] => {
  return images.map(toImageDTO);
};
