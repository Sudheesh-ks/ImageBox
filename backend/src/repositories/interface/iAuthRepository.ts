import { userDocument } from "../../models/userModel";

export interface IAuthRepository {
  createUser(user: Partial<userDocument>): Promise<userDocument>;
  findUserById(id: string): Promise<userDocument | null>;
  findUserByEmail(email: string): Promise<userDocument | null>;
  updatePasswordByEmail(
    email: string,
    newHashedPassword: string
  ): Promise<boolean>;
}
