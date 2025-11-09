import { ImageController } from "../controllers/implementation/imageController";
import { ImageRepository } from "../repositories/implementation/imageRepository";
import { ImageService } from "../services/implementation/imageServices";

const imageRepository = new ImageRepository();

const imageService = new ImageService(imageRepository);

export const imageController = new ImageController(imageService);
