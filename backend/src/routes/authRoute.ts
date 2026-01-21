import express from "express";
import { authController } from "../dependencyHandlers.ts/user.dependencies";
import { validate } from "../middlewares/validate.middleware";
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../schemas/auth.schema";

const authRouter = express.Router();

authRouter.post(
  "/register",
  validate(registerSchema),
  authController.registerUser.bind(authController)
);
authRouter.post(
  "/login",
  validate(loginSchema),
  authController.loginUser.bind(authController)
);
authRouter.post(
  "/otp/resend",
  validate(resendOtpSchema),
  authController.resendOtp.bind(authController)
);
authRouter.post(
  "/otp/verify",
  validate(verifyOtpSchema),
  authController.verifyOtp.bind(authController)
);
authRouter.post(
  "/password/forgot",
  validate(forgotPasswordSchema),
  authController.forgotPasswordRequest.bind(authController)
);
authRouter.post(
  "/password/reset",
  validate(resetPasswordSchema),
  authController.resetPassword.bind(authController)
);
authRouter.post("/logout", authController.logout.bind(authController));
authRouter.get(
  "/refresh-token",
  authController.refreshToken.bind(authController)
);

export default authRouter;
