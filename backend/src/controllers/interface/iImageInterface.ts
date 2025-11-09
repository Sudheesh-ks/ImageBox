import { Request, Response } from "express";

export interface IImageController {
  uploadImage(req: Request, res: Response): Promise<void>;
  getImages(req: Request, res: Response): Promise<void>;
  updateImage(req: Request, res: Response): Promise<void>;
  deleteImage(req: Request, res: Response): Promise<void>;
  updateImageOrder(req: Request, res: Response): Promise<void>;
}
