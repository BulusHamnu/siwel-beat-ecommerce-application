import User from "../models/user.schema.js";
import type { createUserBody } from "../controllers/userTypes.js";
import type { UserDocument } from "../models/user.schema.js";
import AppError from "../errors/appError.js";
import { createHashpasswordAndEmailVerification } from "../utils/helpers.js";
import Profile, { type ProfileDocument } from "../models/profile.schema.js";
import { generateRandCode } from "../utils/helpers.js";
import sendEmail from "./sendEmail.js";
import Template from "../utils/emailTemplate.js";
import jwt from "jsonwebtoken";
import env from "../configs/env.js";
import type mongoose from "mongoose";
import bcrypt from "bcrypt";

// CREATE NEW USER SERVICE
export const createNewUser = async ({
  username,
  firstName,
  lastName,
  email,
  password,
  provider = "local",
  isVerified,
  role = "user",
  picture,
  accessToken,
  idToken,
  googleId,
}: createUserBody): Promise<UserDocument> => {
  // check if user already exist
  const emailExist = await User.findOne({ email: email });
  if (emailExist) {
    throw new AppError("User already exist!", 209, true);
  }

  // hash user password
  const { hashPassword, emailVerification } =
    await createHashpasswordAndEmailVerification(password, 15);

  const user = await User.create({
    emailVerification: isVerified == true ? {} : emailVerification,
    username,
    email,
    provider,
    role,
    isVerified,
    password: hashPassword,
    google: {
      googleId,
      idToken,
      accessToken,
    },
  });

  // create user profile if role is user not admin
  let profile: ProfileDocument | null = null;
  if (user.role === "user") {
    profile = await Profile.create({
      userId: user._id,
      firstName,
      lastName,
      profilePic: picture,
    });
  }

  return user;
};

// LOGIN SERVICE
export interface LoginReturnType {
  token: string;
  user: {
    id: string | mongoose.ObjectId;
    email: string;
    isVerified: boolean;
    role: string;
  };
}

export const loginUser = async (
  password: string,
  email: string
): Promise<LoginReturnType> => {
  const user = await User.findOne({ email: email });
  if (!user) throw new AppError("User does not exist.", 404, true);

  // compare password
  const passwordCorrect: boolean = await user.comparePassword(password);

  if (!passwordCorrect && user.provider !== "local")
    throw new AppError(
      "Incorrect Password, reset your password or sign in with google.",
      400,
      true
    );
  if (!passwordCorrect) throw new AppError("Incorrect Password!", 400, true);

  // sign token
  const token: string = jwt.sign(
    {
      id: user._id,
      email: user.email,
      isVerified: user.isVerified,
      role: user.role,
    },
    env.SECRET_KEY,
    { expiresIn: "7d" }
  );

  // return result
  return {
    user: {
      id: user._id as mongoose.ObjectId,
      email: user.email,
      isVerified: user.isVerified,
      role: user.role,
    },
    token,
  };
};

// FORGET PASSWORD SERVICE
export const forgetPassword = async (email: string): Promise<void> => {
  const user: UserDocument | null = await User.findOne({ email });
  if (!user) throw new AppError("User does not exist.", 404, true);

  // create password reset code
  const resetCode: string | number | null = generateRandCode(6);

  user.resetPasswordVerification.code = resetCode;
  user.resetPasswordVerification.expiredAt = new Date(
    Date.now() + 15 * 60 * 1000
  );

  await user.save();

  // send email
  await sendEmail(
    user.email,
    "Reset Password Code",
    Template.resetPasswordTemplate(user.username, resetCode)
  );
};

// RESET PASSWORD SERVICE
export const resetPassword = async (
  email: string,
  password: string
): Promise<boolean> => {
  // hash user password
  const hashPassword: string = await bcrypt.hash(password, 10);
  const user: UserDocument | null = await User.findOne({ email: email });
  if (!user?.resetPasswordVerification.code)
    throw new AppError(
      "Unable to reset user password, code not found.",
      404,
      true
    );

  // reset code to null
  user.password = hashPassword;
  user.resetPasswordVerification.code = null;
  user.resetPasswordVerification.expiredAt = null;
  await user.save();

  // send email
  await sendEmail(
    user.email,
    "Password Reset Successfully.",
    Template.resetSuccessfulTemplate(user.username)
  );

  return true;
};

// RESEND VERFICATION SERVICE
export const resendVerificationEmail = async (
  email: string
): Promise<boolean> => {
  const user: UserDocument | null = await User.findOne({ email });
  if (!user) throw new AppError("User does not exist.", 404, true);
  if (user.isVerified)
    throw new AppError("User is already verified.", 400, true);

  // create verification code
  const verificationCode: string | number | null = generateRandCode(6);

  user.emailVerification.code = verificationCode;
  user.emailVerification.expiredAt = new Date(Date.now() + 15 * 60 * 1000);

  await user.save();

  // send email
  await sendEmail(
    user.email,
    "Email Verification Code",
    Template.emailVerificationTemplate(user.username, verificationCode)
  );
  return true;
};

// VERIFY EMAIL SERVICE
export const verifyEmail = async (
  email: string,
  code: string
): Promise<boolean> => {
  const user: UserDocument | null = await User.findOne({ email: email });
  if (!user) throw new AppError("User does not exist.", 404, true);
  // check if user is already verified
  if (user.isVerified)
    throw new AppError("User is already verified.", 400, true);

  const codeIsValid: UserDocument | null = await User.findOne({
    "emailVerification.code": code,
    "emailVerification.expiredAt": { $gt: new Date() },
  });

  if (!codeIsValid)
    throw new AppError("Code is invalid or Code have expired.", 400, true);

  // verified code
  codeIsValid.isVerified = true;
  codeIsValid.emailVerification.code = null;
  codeIsValid.emailVerification.expiredAt = null;
  await codeIsValid.save();

  return true;
};

// VERIFY PASSWORD RESET CODE
const verifyResetCode = async (code: string): Promise<boolean> => {
  return true;
};
