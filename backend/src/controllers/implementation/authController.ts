import { Request, Response } from "express";
import { HttpResponse } from "../../constants/responseMessage.constants";
import { HttpStatus } from "../../constants/status.constants";
import { IAuthService } from "../../services/interface/iAuthService";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.util";
import { IAuthController } from "../interface/iAuthInterface";
import { AuthPurpose } from "../../constants/authPurpose.constants";

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
        purpose as AuthPurpose
      );

      if (purpose === AuthPurpose.REGISTER && result.user) {
        const accessToken = generateAccessToken(
          result.user._id!,
          result.user.email
        );
        const refreshToken = generateRefreshToken(
          result.user._id!,
          result.user.email
        );

        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(HttpStatus.CREATED).json({
          success: true,
          accessToken,
          message: HttpResponse.REGISTER_SUCCESS,
        });
        return;
      }

      if (purpose === AuthPurpose.RESET_PASSWORD) {
        res.status(HttpStatus.OK).json({
          success: true,
          purpose: AuthPurpose.RESET_PASSWORD,
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

      const accessToken = generateAccessToken(user._id!, user.email);
      const refreshToken = generateRefreshToken(user._id!, user.email);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(HttpStatus.OK).json({
        success: true,
        accessToken,
        message: HttpResponse.LOGIN_SUCCESS,
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie("refreshToken");
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Logged out successfully",
    });
  }


  async refreshToken(req: Request, res: Response): Promise<void> {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
       res.status(401).json({ success: false, message: "No refresh token" });
       return
    }

    const decoded = verifyRefreshToken(token);

    const user = await this._userService.getUserById(decoded.id);

    const newAccessToken = generateAccessToken(decoded.id, user!.email);

     res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
    return

  } catch (error) {
     res.status(401).json({
      success: false,
      message: "Invalid refresh token",
    });
    return
  }
}

}
