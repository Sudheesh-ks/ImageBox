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
import { sendResponse } from "../../utils/apiResponse";

export class AuthController implements IAuthController {
  constructor(private readonly _userService: IAuthService) { }

  async registerUser(req: Request, res: Response): Promise<void> {
    const { email, password, phone } = req.body;

    try {
      await this._userService.register(email, password, phone);
      sendResponse(res, HttpStatus.OK, true, HttpResponse.OTP_SENT);

    } catch (error) {
      sendResponse(
        res,
        HttpStatus.BAD_REQUEST,
        false,
        (error as Error).message || HttpResponse.SERVER_ERROR,
        null,
        error
      );
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
          secure: false,
          sameSite: "lax",
          domain: process.env.COOKIE_DOMAIN,
          path: '/',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        sendResponse(res, HttpStatus.CREATED, true, HttpResponse.REGISTER_SUCCESS, {
          accessToken,
        });
        return;
      }

      if (purpose === AuthPurpose.RESET_PASSWORD) {
        sendResponse(res, HttpStatus.OK, true, HttpResponse.OTP_VERIFIED, {
          purpose: AuthPurpose.RESET_PASSWORD,
        });
        return;
      }

      sendResponse(res, HttpStatus.BAD_REQUEST, false, HttpResponse.BAD_REQUEST);
    } catch (error) {
      sendResponse(res, HttpStatus.BAD_REQUEST, false, (error as Error).message);
    }
  }

  async resendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      await this._userService.resendOtp(email);
      sendResponse(res, HttpStatus.OK, true, HttpResponse.OTP_RESENT);
    } catch (error) {
      sendResponse(
        res,
        HttpStatus.BAD_REQUEST,
        false,
        (error as Error).message || HttpResponse.OTP_SEND_FAILED,
        null,
        error
      );
    }
  }

  async forgotPasswordRequest(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      await this._userService.forgotPasswordRequest(email);
      sendResponse(res, HttpStatus.OK, true, HttpResponse.OTP_SENT);
    } catch (error) {
      sendResponse(
        res,
        HttpStatus.BAD_REQUEST,
        false,
        (error as Error).message || HttpResponse.OTP_SEND_FAILED,
        null,
        error
      );
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, newPassword } = req.body;

      await this._userService.resetPassword(email, newPassword);
      sendResponse(res, HttpStatus.OK, true, HttpResponse.PASSWORD_UPDATED);
    } catch (error) {
      sendResponse(
        res,
        HttpStatus.BAD_REQUEST,
        false,
        (error as Error).message || HttpResponse.OTP_EXPIRED_OR_INVALID,
        null,
        error
      );
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
        secure: false,
        sameSite: "lax",
        domain: process.env.COOKIE_DOMAIN,
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      sendResponse(res, HttpStatus.OK, true, HttpResponse.LOGIN_SUCCESS, {
        accessToken,
      });
    } catch (error) {
      sendResponse(res, HttpStatus.BAD_REQUEST, false, (error as Error).message, null, error);
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      domain: process.env.COOKIE_DOMAIN,
      path: "/",
    });
    sendResponse(res, HttpStatus.OK, true, "Logged out successfully");
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
