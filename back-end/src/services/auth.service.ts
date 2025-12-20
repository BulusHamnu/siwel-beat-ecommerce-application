import User from "../models/user.schema.js";
import type { createUserBody } from "../controllers/userTypes.js";
import type { UserInterface } from "../models/user.schema.js";
import AppError from "../errors/appError.js";
import { createHashpasswordAndEmailVerification } from "./shared/authShared.service.js";
import Profile from "../models/profile.schema.js";
import { generateRandCode } from "../utils/helpers.js";
import sendEmail from "./sendEmail.js";
import Template from "../utils/emailTemplate.js";
import jwt from "jsonwebtoken";
import env from "../configs/env.js";
import { type ObjectId } from "mongoose";
import bcrypt from "bcrypt";

/* Create new user */
export const createNewUser = async ({
  username,
  firstName,
  lastName,
  email,
  password,
  provider = "local",
  isVerified,
  role = "user",
  picture = "",
  accessToken,
  idToken,
  googleId,
}: createUserBody): Promise<UserInterface> => {
  const emailExist = await User.findOne({ email: email });
  if (emailExist) {
    throw new AppError("User already exist.", 209, true);
  }

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

  // create user profile if role is not admin
  if (user.role !== "admin") {
    await Profile.create({
      userId: user._id,
      firstName,
      lastName,
      profilePic: picture,
    });
  }

  await sendEmail(
    user.email,
    "Please verify you email.",
    Template.emailVerificationTemplate(
      user.username,
      user.emailVerification.code
    )
  );

  return user;
};

/* Login user */
export interface LoginReturnType {
  token: string;
  user: {
    id: string | ObjectId;
    email: string;
    isVerified: boolean;
    role: string;
  };
}

async function getUserAndValidatePassword(
  email: string,
  password: string
): Promise<UserInterface> {
  const user = await User.findOne({ email: email });
  if (!user) throw new AppError("User not found.", 404, true);

  const passwordCorrect: boolean = await user.comparePassword(password);
  if (!passwordCorrect && user.provider !== "local")
    throw new AppError(
      "Incorrect Password, reset your password or sign in with google.",
      400,
      true
    );
  if (!passwordCorrect) throw new AppError("Incorrect Password.", 400, true);

  return user;
}

export const loginUser = async (
  password: string,
  email: string
): Promise<LoginReturnType> => {
  const user = await getUserAndValidatePassword(email, password);

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

  return {
    user: {
      id: user._id as ObjectId,
      email: user.email,
      isVerified: user.isVerified,
      role: user.role,
    },
    token,
  };
};

/* Forget password */
export const forgetPassword = async (email: string): Promise<void> => {
  const user: UserInterface | null = await User.findOne({ email });
  if (!user) throw new AppError("User not found.", 404, true);

  const resetCode = generateRandCode(6);
  user.resetPasswordVerification.code = resetCode;
  user.resetPasswordVerification.expiredAt = new Date(
    Date.now() + 15 * 60 * 1000
  );
  await user.save();

  // user get reset code
  await sendEmail(
    user.email,
    "Reset Password Code",
    Template.resetPasswordTemplate(user.username, resetCode)
  );
};

/* Reset Password */
export const resetPassword = async (
  email: string,
  password: string
): Promise<void> => {
  const user: UserInterface | null = await User.findOne({ email: email });
  if (!user?.resetPasswordVerification.code)
    throw new AppError(
      "Unable to reset user password, code not found.",
      404,
      true
    );

  const hashPassword: string = await bcrypt.hash(password, 10);
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
};

/* Resend verification email */
function generateEmailVerificationToken(): {
  verificationCode: string | number;
  expiredAt: Date;
} {
  const verificationCode: string | number | null = generateRandCode(6);
  const expiredAt = new Date(Date.now() + 15 * 60 * 1000);
  return { verificationCode, expiredAt };
}

export const resendVerificationEmail = async (email: string): Promise<void> => {
  const user: UserInterface | null = await User.findOne({ email });
  if (!user) throw new AppError("User not found.", 404, true);
  if (user.isVerified)
    throw new AppError("User is already verified.", 400, true);

  const { verificationCode, expiredAt } = generateEmailVerificationToken();

  // save and send code to user through email
  user.emailVerification.code = verificationCode;
  user.emailVerification.expiredAt = expiredAt;
  await user.save();
  console.log(verificationCode);

  await sendEmail(
    user.email,
    "Email Verification Code",
    Template.emailVerificationTemplate(user.username, verificationCode)
  );
};

/* Verify email */
export const verifyEmail = async (email: string, code: string): Promise<boolean> => {
  const user: UserInterface | null = await User.findOne({ email: email });
  if (!user) throw new AppError("User not found.", 404, true);

  // can't verify already verified users
  if (user.isVerified)
    throw new AppError("User is already verified.", 400, true);

  const codeIsValid: UserInterface | null = await User.findOne({
    "emailVerification.code": code,
    "emailVerification.expiredAt": { $gt: new Date() },
  });

  if (!codeIsValid)
    throw new AppError("Code is invalid or Code have expired.", 400, true);

  codeIsValid.isVerified = true;
  codeIsValid.emailVerification.code = null;
  codeIsValid.emailVerification.expiredAt = null;
  await codeIsValid.save();

  return true;
};

/* Verify reset password code */
export const verifyResetCode = async (email: string, code: string): Promise<void> => {
  const codeIsValid: UserInterface | null = await User.findOne({
    email,
    "resetPasswordVerification.code": code,
    "resetPasswordVerification.expiredAt": { $gt: new Date() },
  });

  if (!codeIsValid)
    throw new AppError("Code is invalid or Code have expired.", 400, true);
};

