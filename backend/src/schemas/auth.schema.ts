import { z } from "zod";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const emailValidation = z.string().regex(emailRegex, "Invalid email format");

const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[@$!%*#?&^_-]/, "Password must contain at least one special character");

export const registerSchema = z.object({
    email: emailValidation,
    password: passwordSchema,
    phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
});

export const loginSchema = z.object({
    email: emailValidation,
    password: z.string().min(1, "Password is required"),
});

export const verifyOtpSchema = z.object({
    email: emailValidation,
    otp: z.string().length(6, "OTP must be exactly 6 digits"),
    purpose: z.enum(["register", "reset-password", "login"]),
});

export const resendOtpSchema = z.object({
    email: emailValidation,
});

export const forgotPasswordSchema = z.object({
    email: emailValidation,
});

export const resetPasswordSchema = z.object({
    email: emailValidation,
    newPassword: passwordSchema,
});
