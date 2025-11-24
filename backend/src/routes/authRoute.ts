import express from "express";
import { authController } from "../dependencyHandlers.ts/user.dependencies";

const authRouter = express.Router();

authRouter.post("/register", authController.registerUser.bind(authController));
authRouter.post("/login", authController.loginUser.bind(authController));
authRouter.post("/otp/resend", authController.resendOtp.bind(authController));
authRouter.post("/otp/verify", authController.verifyOtp.bind(authController));
authRouter.post(
  "/password/forgot",
  authController.forgotPasswordRequest.bind(authController)
);
authRouter.post(
  "/password/reset",
  authController.resetPassword.bind(authController)
);
authRouter.post("/logout", authController.logout.bind(authController));
authRouter.get(
  "/refresh-token",
  authController.refreshToken.bind(authController)
);

export default authRouter;
