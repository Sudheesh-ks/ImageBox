import { Request, Response } from "express";
import { HttpResponse } from "../../constants/responseMessage.constants";
import { HttpStatus } from "../../constants/status.constants";
import { IAuthService } from "../../services/interface/iAuthService";
import { generateAccessToken } from "../../utils/jwt.util";
import { IAuthController } from "../interface/iAuthInterface";

export class AuthController implements IAuthController {
  constructor(private readonly _userService: IAuthService) {}

  async registerUser(req: Request, res: Response): Promise<void> {
    const { email, password, phone } = req.body;

    try {
      await this._userService.register(email, password, phone);
      res
        .status(HttpStatus.OK)
        .json({ success: true, message: HttpResponse.OTP_SENT });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: (error as Error).message || HttpResponse.SERVER_ERROR,
      });
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp, purpose } = req.body;
      const result = await this._userService.verifyOtp(
        email,
        otp,
        purpose as "register" | "reset-password"
      );

      if (purpose === "register" && result.user) {
        const token = generateAccessToken(result.user._id!, result.user.email);
        res
          .status(HttpStatus.CREATED)
          .json({
            success: true,
            token,
            message: HttpResponse.REGISTER_SUCCESS,
          });
        return;
      }

      if (purpose === "reset-password") {
        res
          .status(HttpStatus.OK)
          .json({
            success: true,
            purpose: "reset-password",
            message: HttpResponse.OTP_VERIFIED,
          });
        return;
      }

      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: HttpResponse.BAD_REQUEST });
    } catch (error) {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ success: false, message: (error as Error).message });
    }
  }

  async resendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      await this._userService.resendOtp(email);
      res.status(HttpStatus.OK).json({
        success: true,
        message: HttpResponse.OTP_RESENT,
      });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message || HttpResponse.OTP_SEND_FAILED,
      });
    }
  }

  async forgotPasswordRequest(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      await this._userService.forgotPasswordRequest(email);
      res.status(HttpStatus.OK).json({
        success: true,
        message: HttpResponse.OTP_SENT,
      });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: (error as Error).message || HttpResponse.OTP_SEND_FAILED,
      });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, newPassword } = req.body;

      await this._userService.resetPassword(email, newPassword);
      res.status(HttpStatus.OK).json({
        success: true,
        message: HttpResponse.PASSWORD_UPDATED,
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message:
          (error as Error).message || HttpResponse.OTP_EXPIRED_OR_INVALID,
      });
    }
  }

  async loginUser(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const { user } = await this._userService.login(email, password);
      const token = generateAccessToken(user._id!, user.email);
      res
        .status(HttpStatus.OK)
        .json({ success: true, token, message: HttpResponse.LOGIN_SUCCESS });
    } catch (error) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: (error as Error).message });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    res
      .status(HttpStatus.OK)
      .json({ success: true, message: "Logged out successfully" });
  }
}
