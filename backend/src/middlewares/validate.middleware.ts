import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { sendResponse } from "../utils/apiResponse";
import { HttpStatus } from "../constants/status.constants";

export const validate =
    (schema: ZodSchema) =>
        async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
                await schema.parseAsync(req.body);
                next();
            } catch (error) {
                if (error instanceof ZodError) {
                    const errorMessages = error.errors.map((issue: any) => ({
                        path: issue.path.join("."),
                        message: issue.message,
                    }));

                    // Return the first error message for simplicity as current frontend expects a single message
                    const message = errorMessages[0]?.message || "Validation failed";

                    sendResponse(res, HttpStatus.BAD_REQUEST, false, message, {
                        errors: errorMessages,
                    });
                    return;
                }
                sendResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, false, "Internal server error during validation");
            }
        };
