import { Response } from "express";
import { HttpStatus } from "../constants/status.constants";

export interface ApiResponse<ResponseData  = any> {
  success: boolean;
  message: string;
  data?: ResponseData  | null;
  error?: any;
}

export const sendResponse = <ResponseData >(
  res: Response,
  status: number,
  success: boolean,
  message: string,
  data?: ResponseData ,
  error?: any
): Response<ApiResponse<ResponseData >> => {
  return res.status(status).json({
    success,
    message,
    data: data ?? null,
    error: error ?? null,
  });
};
