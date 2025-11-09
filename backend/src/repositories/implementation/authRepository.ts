import userModel, { userDocument } from "../../models/userModel";
import { BaseRepository } from "../baseRepository";
import { IAuthRepository } from "../interface/iAuthRepository";

export class AuthRepository
  extends BaseRepository<userDocument>
  implements IAuthRepository
{
  constructor() {
    super(userModel);
  }

  async createUser(user: Partial<userDocument>): Promise<userDocument> {
    const createdUser = await this.create(user);
    return createdUser as userDocument;
  }

  async findUserById(id: string): Promise<userDocument | null> {
    const user = await this.findById(id);
    return user ? (user as userDocument) : null;
  }

  async findUserByEmail(email: string): Promise<userDocument | null> {
    return this.findOne({ email });
  }

  async updatePasswordByEmail(
    email: string,
    newHashedPassword: string
  ): Promise<boolean> {
    const updatedUser = await userModel.findOneAndUpdate(
      { email },
      { $set: { password: newHashedPassword } }
    );
    return !!updatedUser;
  }
}
