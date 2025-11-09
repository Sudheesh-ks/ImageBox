import { Types } from "mongoose";

declare global {
  namespace Express {
    interface UserPayload {
      id: string | Types.ObjectId;
      email?: string;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}
