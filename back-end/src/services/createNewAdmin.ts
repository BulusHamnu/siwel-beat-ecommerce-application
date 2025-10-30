import Admin from "../models/adminSchema.js";
import type { AdminDocument } from "../models/adminSchema.js";
import AppError from "../errors/appError.js";
import { createHashpasswordAndEmailVerification } from "../utils/helpers.js";
import type { UserDocument } from "../models/userShema.js";
import User from "../models/userShema.js";

export interface createAdminReqBody {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  provider: string;
  role: string;
  isVerified: boolean;
}

const createNewAdmin = async ({
  firstName,
  lastName,
  username,
  email,
  password,
  isVerified,
}: createAdminReqBody): Promise<AdminDocument> => {
  // check if admin already exist
  const admin: AdminDocument | null = await Admin.findOne({ email });

  if (admin) {
    throw new AppError("Admin already exist.", 209, true);
  }

  // check if email exist as a user
  const user: UserDocument | null = await User.findOne({ email });
  if (user && user.email === email) {
    throw new AppError("Email is already used by another user.", 209, true);
  }

  // hash user password
  const { hashPassword, emailVerification } =
    await createHashpasswordAndEmailVerification(password, 15);

  const newAdmin: AdminDocument = await Admin.create({
    firstName,
    lastName,
    username,
    email,
    password: hashPassword,
    provider: "local",
    role: "admin",
    isVerified,
    emailVerification,
  });

  return newAdmin;
};

export default createNewAdmin;
