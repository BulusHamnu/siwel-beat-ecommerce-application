import User from "../models/userShema.js";
import type { createUserBody } from "../controllers/auths/userTypes.js";
import type { UserDocument } from "../models/userShema.js";
import bcrypt from "bcrypt";
import AppError from "../errors/appError.js";
import { generateRandCode } from "../utils/helpers.js";
import Profile, { type ProfileDocument } from "../models/profileSchema.js";

const createNewUser = async ({
  username,
  firstName,
  lastName,
  email,
  password,
  provider,
  isVerified,
  role,
}: createUserBody): Promise<UserDocument> => {
  // check if user already exist
  const emailExist = await User.findOne({ email: email });
  if (emailExist) {
    throw new AppError("User already exist!", 409, true);
  }
  // hash user password
  const hashPassword: string = await bcrypt.hash(password, 10);
  const verificationCode: number | string = generateRandCode(6);

  const emailVerification = {
    code: verificationCode,
    expiredAt: new Date(Date.now() + 15 * 60 * 1000),
  };

  const user = await User.create({
    emailVerification,
    username,
    email,
    provider,
    role,
    isVerified,
    password: hashPassword,
  });

  // create user profile
  const profile = await Profile.create({
    userId: user._id,
    firstName,
    lastName,
  });

  return user;
};

export default createNewUser;
