import { AuthController } from "../controllers/implementation/authController";
import { AuthRepository } from "../repositories/implementation/authRepository";
import { OtpRepository } from "../repositories/implementation/otpRepository";
import { AuthService } from "../services/implementation/authService";

const authRepository = new AuthRepository();
const otpRepository = new OtpRepository();

const authService = new AuthService(authRepository, otpRepository);

export const authController = new AuthController(authService);
