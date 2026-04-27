import User from "../models/user.schema.js";
import type { UserInterface } from "../models/user.schema.js";
import Session, { type SessionInterface } from "../models/session.schema.js";
import AppError, { ErrorCodes } from "../errors/appError.js";
import {
  createEmailVerificationCode,
  hashPassword,
} from "./shared/authShared.service.js";
import Profile from "../models/profile.schema.js";
import { generateHashValue, generateRandCode } from "../utils/helpers.js";
import crypto from "crypto";
import mongoose from "mongoose";
import mainQueue from "../queues/main.queue.js";

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  gender?: string;
  provider: string;
  role: string;
  isVerified: boolean;
  googleId: string;
  accessToken: string;
  avatar: string;
}

/* Create new user */
export const createNewUser = async ({
  username,
  firstName,
  lastName,
  email,
  password,
  gender,
  provider = "local",
  avatar = "",
  accessToken,
  googleId,
}: CreateUserInput): Promise<UserInterface> => {
  const hashedPassword = await hashPassword(password);
  const { hashedCode, code, expiresAt } = await createEmailVerificationCode(15);

  const role = "user";
  const isVerified = provider === "google" ? true : false;
  const emailVerification =
    isVerified == true ? {} : { code: hashedCode, expiresAt };

  const session = await mongoose.startSession();
  let newUser: UserInterface | undefined = undefined;

  try {
    await session.withTransaction(async () => {
      newUser = new User({
        username,
        avatar,
        email,
        provider,
        role,
        isVerified,
        password: hashedPassword,
        google: {
          googleId,
          accessToken,
        },
        emailVerification,
      });

      await newUser.save({ session });

      const newProfile = new Profile({
        userId: newUser._id,
        firstName,
        lastName,
        gender,
      });

      await newProfile.save({ session });
    });
  } catch (error: any) {
    if (error.code === 11000) {
      throw new AppError(
        ErrorCodes.USER_ALREADY_EXISTS,
        "User already exist.",
        409,
        true,
        { email },
      );
    }
    throw error;
  } finally {
    session.endSession();
  }

  if (!isVerified) {
    await mainQueue.add(
      "send-verification-email",
      {
        to: newUser!.email,
        username: newUser!.username,
        message: "Please verify your email.",
        code,
      },
      {
        jobId: `email:newuser-email-verification:${newUser!.email}`,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
        removeOnComplete: 1000,
        removeOnFail: 5000,
      },
    );
  }

  return newUser!;
};

/* Login user */
async function getUserAndValidatePassword(
  email: string,
  password: string,
): Promise<UserInterface> {
  const user = await User.findOne({ email });
  if (!user)
    throw new AppError(
      ErrorCodes.USER_NOT_FOUND,
      "User not found.",
      404,
      true,
      { email },
    );

  const passwordCorrect: boolean = await user.comparePassword(password);
  if (!passwordCorrect && user.provider !== "local")
    throw new AppError(
      ErrorCodes.PASSWORD_INCORRECT,
      "Incorrect Password, reset your password or sign in with google.",
      401,
      true,
      null,
    );

  if (!passwordCorrect)
    throw new AppError(
      ErrorCodes.PASSWORD_INCORRECT,
      "Incorrect Password.",
      401,
      true,
      null,
    );

  return user;
}

export interface UserLoginSnaphot {
  id: string;
  email: string;
  isVerified: boolean;
  role: string;
  isActive: boolean;
}

export const validatePasswordAndSignTokens = async (
  password: string,
  email: string,
  deviceInfo: string,
): Promise<{
  accessToken: string;
  refreshToken: string;
  user: UserLoginSnaphot;
}> => {
  const user = await getUserAndValidatePassword(email, password);
  const accessToken = user.signToken("accessToken", "24h");
  const refreshToken = user.signToken("refreshToken", "7d");

  await Session.create({
    userId: user._id as string,
    refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    lastUsed: new Date(),
    deviceInfo,
  });

  return {
    user: {
      id: user._id as string,
      email: user.email,
      isVerified: user.isVerified,
      role: user.role,
      isActive: user.isActive,
    },
    accessToken,
    refreshToken,
  };
};

/* Resend verification email */
export const resendVerificationEmail = async (email: string): Promise<void> => {
  const user: UserInterface | null = await User.findOne({ email });
  if (!user)
    throw new AppError(
      ErrorCodes.USER_NOT_FOUND,
      "User not found.",
      404,
      true,
      { email },
    );

  if (user.isVerified)
    throw new AppError(
      ErrorCodes.EMAIL_ALREADY_VERIFIED,
      "User is already verified.",
      400,
      true,
      { email },
    );

  const { code, hashedCode, expiresAt } = await createEmailVerificationCode(15);

  user.emailVerification.code = hashedCode;
  user.emailVerification.expiresAt = expiresAt;
  await user.save();

  await mainQueue.add(
    "send-verification-email",
    {
      to: user.email,
      username: user.username,
      message: "Email Verification Code.",
      code,
    },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
      removeOnComplete: 1000,
      removeOnFail: 5000,
    },
  );
};

/* Verify email */
function verifyCodeAndExpiresAt({
  code,
  storedHashedCode,
  expiresAt,
  invalidError,
  expiresAtError,
}: {
  code: string | number;
  storedHashedCode: string;
  expiresAt: Date;
  invalidError: Error;
  expiresAtError: Error;
}) {
  if (!storedHashedCode) throw invalidError;

  const expirationTime = new Date(expiresAt).getTime();
  const currentTimeStamp = Date.now();

  const hashedCode = generateHashValue(code);
  if (storedHashedCode !== hashedCode) throw invalidError;

  if (expirationTime < currentTimeStamp) throw expiresAtError;
}

export const verifyEmail = async (
  email: string,
  code: string,
): Promise<boolean> => {
  const user: UserInterface | null = await User.findOne({ email: email });
  if (!user)
    throw new AppError(
      ErrorCodes.USER_NOT_FOUND,
      "User not found.",
      404,
      true,
      { email },
    );

  // can't verify already verified users
  if (user.isVerified)
    throw new AppError(
      ErrorCodes.EMAIL_ALREADY_VERIFIED,
      "User is already verified.",
      400,
      true,
      { email },
    );

  const storedHashedCode = user.emailVerification.code as string;
  const expiresAt = user.emailVerification.expiresAt as Date;

  verifyCodeAndExpiresAt({
    code,
    storedHashedCode,
    expiresAt,
    expiresAtError: new AppError(
      ErrorCodes.VERIFICATION_CODE_EXPIRED,
      "Verification code has expired.",
      400,
      true,
      null,
    ),
    invalidError: new AppError(
      ErrorCodes.VERIFICATION_CODE_INVALID,
      "Verification code is invalid.",
      400,
      true,
      null,
    ),
  });

  user.isVerified = true;
  user.emailVerification.code = null;
  user.emailVerification.expiresAt = null;
  await user.save();

  return true;
};

/* Forget password */
export const forgetPassword = async (email: string): Promise<void> => {
  const user: UserInterface | null = await User.findOne({ email });
  if (!user)
    throw new AppError(
      ErrorCodes.USER_NOT_FOUND,
      "User not found.",
      404,
      true,
      { email },
    );

  const otpCode = generateRandCode(6);
  const codeHashedValue = generateHashValue(otpCode);
  user.resetPasswordVerification.otpCode = codeHashedValue;
  user.resetPasswordVerification.otpExpiresAt = new Date(
    Date.now() + 15 * 60 * 1000,
  );
  await user.save();

  await mainQueue.add(
    "send-reset-password-email",
    {
      to: user.email,
      username: user.username,
      message: "Reset Password Code.",
      code: otpCode,
    },
    {
      attempts: 3,
      backoff: {
        type: "fixed",
        delay: 2000,
      },
      removeOnComplete: 1000,
      removeOnFail: 5000,
    },
  );
};

/* Verify reset password code */
function generateResetToken(): string {
  return crypto.randomBytes(16).toString("hex");
}

export const verifyResetPasswordOtp = async (
  email: string,
  code: string,
): Promise<{ resetToken: string }> => {
  const user: UserInterface | null = await User.findOne({ email });
  if (!user)
    throw new AppError(
      ErrorCodes.USER_NOT_FOUND,
      "User not found.",
      404,
      true,
      { email },
    );

  const storedHashedCode = user.resetPasswordVerification.otpCode as string;
  const expiresAt = user.resetPasswordVerification.otpExpiresAt as Date;

  verifyCodeAndExpiresAt({
    code,
    storedHashedCode,
    expiresAt,
    expiresAtError: new AppError(
      ErrorCodes.RESET_OTP_EXPIRED,
      "Otp code has expired.",
      400,
      true,
      null,
    ),
    invalidError: new AppError(
      ErrorCodes.RESET_OTP_INVALID,
      "Otp code is invalid.",
      400,
      true,
      null,
    ),
  });

  const resetToken = generateResetToken();
  const hashedValue = generateHashValue(resetToken);

  user.resetPasswordVerification.otpCode = null;
  user.resetPasswordVerification.otpExpiresAt = null;
  user.resetPasswordVerification.resetToken = hashedValue;
  user.resetPasswordVerification.resetTokenExpiresAt = new Date(
    Date.now() + 10 * 60 * 1000,
  );
  await user.save();

  return { resetToken };
};

/* Reset Password */
export const resetPassword = async (
  email: string,
  password: string,
  resetToken: string,
): Promise<void> => {
  const user: UserInterface | null = await User.findOne({ email });
  if (!user)
    throw new AppError(
      ErrorCodes.USER_NOT_FOUND,
      "User not found.",
      404,
      true,
      { email },
    );

  const storedHashedToken = user.resetPasswordVerification.resetToken as string;
  const expiresAt = user.resetPasswordVerification.resetTokenExpiresAt as Date;

  verifyCodeAndExpiresAt({
    code: resetToken,
    storedHashedCode: storedHashedToken,
    expiresAt,
    expiresAtError: new AppError(
      ErrorCodes.RESET_TOKEN_EXPIRED,
      "Reset token has expired.",
      400,
      true,
      null,
    ),
    invalidError: new AppError(
      ErrorCodes.RESET_TOKEN_INVALID,
      "Reset token is invalid.",
      400,
      true,
      null,
    ),
  });

  const hashedPassword = await hashPassword(password);
  user.password = hashedPassword;
  user.resetPasswordVerification.resetToken = null;
  user.resetPasswordVerification.resetTokenExpiresAt = null;
  await user.save();

  await mainQueue.add(
    "password-reset-confirmation",
    {
      to: user.email,
      username: user.username,
      message: "Password Reset Successfully.",
    },
    {
      attempts: 2,
      backoff: {
        type: "exponential",
        delay: 3000,
      },
      removeOnComplete: 1000,
      removeOnFail: 5000,
    },
  );
};

/* Refresh token */
export const refreshToken = async (refreshToken: string) => {
  const session: SessionInterface | null = await Session.findOne({
    refreshToken,
  });

  if (!session)
    throw new AppError(
      ErrorCodes.SESSION_NOT_FOUND,
      "Session not found.",
      404,
      true,
      null,
    );

  const currentTime = Date.now();
  const expiredAt = new Date(session.expiresAt).getTime();

  if (expiredAt < currentTime)
    throw new AppError(
      ErrorCodes.SESSION_EXPIRED,
      "Session has expired, Unauthorized.",
      401,
      false,
      null,
    );

  const user: UserInterface | null = await User.findOne({
    _id: session.userId,
  });
  if (!user)
    throw new AppError(
      ErrorCodes.USER_NOT_FOUND,
      "User not found.",
      404,
      true,
      null,
    );

  const accessToken = user.signToken("accessToken", "24h");
  session.lastUsed = new Date();
  await session.save();

  return accessToken;
};
