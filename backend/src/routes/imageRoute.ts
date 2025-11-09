import express from "express";
import { imageController } from "../dependencyHandlers.ts/image.dependencies";
import upload from "../middlewares/upload";
import authMiddleware from "../middlewares/authMiddleware";

const imageRouter = express.Router();

imageRouter.post(
  "/upload",
  authMiddleware(),
  upload.array("image"),
  imageController.uploadImage.bind(imageController)
);

imageRouter.get(
  "/",
  authMiddleware(),
  imageController.getImages.bind(imageController)
);

imageRouter.put(
  "/reorder",
  authMiddleware(),
  imageController.updateImageOrder.bind(imageController)
);

imageRouter.put(
  "/:id",
  authMiddleware(),
  upload.single("image"),
  imageController.updateImage.bind(imageController)
);

imageRouter.delete(
  "/:id",
  authMiddleware(),
  imageController.deleteImage.bind(imageController)
);

export default imageRouter;
