import { Request, Response } from "express";
import { HttpResponse } from "../../constants/responseMessage.constants";
import { HttpStatus } from "../../constants/status.constants";
import { IImageController } from "../interface/iImageInterface";
import { IImageService } from "../../services/interface/iImageServices";

export class ImageController implements IImageController {
  constructor(private readonly _imageService: IImageService) {}

  async uploadImage(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const files = req.files as Express.Multer.File[];
      let titles = req.body.titles;

      if (!Array.isArray(titles)) titles = [titles];

      if (!files?.length) {
        res
          .status(400)
          .json({ success: false, message: HttpResponse.NO_FILE_PROVIDED });
        return;
      }

      const uploadedImages = await this._imageService.uploadImages(
        files,
        titles,
        userId!.toString()
      );
      res.status(201).json({
        success: true,
        data: uploadedImages,
        message: HttpResponse.IMAGE_UPLOADED,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message || HttpResponse.IMAGE_UPLOAD_FAILED,
      });
    }
  }

  async getImages(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { page = 1, limit = 9 } = req.query;

      const result = await this._imageService.getImages(userId!.toString());

      res.status(HttpStatus.OK).json({
        success: true,
        data: {
          images: result.images,
          total: result.total,
          totalPages: Math.ceil(result.total / parseInt(limit as string)),
          currentPage: parseInt(page as string),
        },
        message: HttpResponse.IMAGES_FETCHED,
      });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message || HttpResponse.IMAGE_FETCH_FAILED,
      });
    }
  }

  async updateImage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { title } = req.body;

      const updated = await this._imageService.updateImage(id, title, req.file);

      res.status(HttpStatus.OK).json({
        success: true,
        data: updated,
        message: HttpResponse.IMAGE_UPDATED,
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: (error as Error).message || HttpResponse.IMAGE_UPDATE_FAILED,
      });
    }
  }

  async deleteImage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { public_id } = req.body;

      await this._imageService.deleteImage(id, public_id);

      res.status(HttpStatus.OK).json({
        success: true,
        message: HttpResponse.IMAGE_DELETED,
      });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message || HttpResponse.IMAGE_DELETE_FAILED,
      });
    }
  }

  async updateImageOrder(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { orderedIds } = req.body;

      if (!Array.isArray(orderedIds)) {
        res
          .status(400)
          .json({ success: false, message: "Invalid data format" });
        return;
      }

      await this._imageService.updateImageOrder(userId, orderedIds);
      res.status(200).json({ success: true, message: "Image order updated" });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message || "Failed to update image order",
      });
    }
  }
}
