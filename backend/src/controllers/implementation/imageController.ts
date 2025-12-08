import { Request, Response } from "express";
import { HttpResponse } from "../../constants/responseMessage.constants";
import { HttpStatus } from "../../constants/status.constants";
import { IImageController } from "../interface/iImageInterface";
import { IImageService } from "../../services/interface/iImageServices";
import { sendResponse } from "../../utils/apiResponse";

export class ImageController implements IImageController {
  constructor(private readonly _imageService: IImageService) {}

  async uploadImage(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const files = req.files as Express.Multer.File[];
      let titles = req.body.titles;

      if (!Array.isArray(titles)) titles = [titles];

      if (!files?.length) {
        sendResponse(res, 400, false, HttpResponse.NO_FILE_PROVIDED);
        return;
      }

      const uploadedImages = await this._imageService.uploadImages(
        files,
        titles,
        userId!.toString()
      );
      sendResponse(res, 201, true, HttpResponse.IMAGE_UPLOADED, uploadedImages);
    } catch (error) {
      sendResponse(
        res,
        500,
        false,
        (error as Error).message || HttpResponse.IMAGE_UPLOAD_FAILED,
        null,
        error
      );
    }
  }

  async getImages(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { page = 1, limit = 9 } = req.query;

      const result = await this._imageService.getImages(userId!.toString());

      sendResponse(res, HttpStatus.OK, true, HttpResponse.IMAGES_FETCHED, {
        images: result.images,
        total: result.total,
        totalPages: Math.ceil(result.total / parseInt(limit as string)),
        currentPage: parseInt(page as string),
      });
    } catch (error) {
      sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        false,
        (error as Error).message || HttpResponse.IMAGE_FETCH_FAILED,
        null,
        error
      );
    }
  }

  async updateImage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { title } = req.body;

      const updated = await this._imageService.updateImage(id, title, req.file);

      sendResponse(
        res,
        HttpStatus.OK,
        true,
        HttpResponse.IMAGE_UPDATED,
        updated
      );
    } catch (error) {
      sendResponse(
        res,
        HttpStatus.BAD_REQUEST,
        false,
        (error as Error).message || HttpResponse.IMAGE_UPDATE_FAILED,
        null,
        error
      );
    }
  }

  async deleteImage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { public_id } = req.body;

      await this._imageService.deleteImage(id, public_id);

      sendResponse(res, HttpStatus.OK, true, HttpResponse.IMAGE_DELETED);
    } catch (error) {
      sendResponse(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        false,
        (error as Error).message || HttpResponse.IMAGE_DELETE_FAILED,
        null,
        error
      );
    }
  }

  async updateImageOrder(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const { orderedIds } = req.body;

      if (!Array.isArray(orderedIds)) {
        sendResponse(res, 400, false, "Invalid data format");
        return;
      }

      await this._imageService.updateImageOrder(userId, orderedIds);
      sendResponse(res, 200, true, "Image order updated");
    } catch (error) {
      sendResponse(
        res,
        500,
        false,
        (error as Error).message || "Failed to update image order",
        null,
        error
      );
    }
  }
}
