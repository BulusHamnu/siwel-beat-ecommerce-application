import User from "../models/user.schema.js";
import type { CreateUserBody } from "../controllers/userTypes.js";
import type { Session, UserInterface } from "../models/user.schema.js";
import AppError from "../errors/appError.js";
import { createHashpasswordAndEmailVerification } from "./shared/authShared.service.js";
import Profile from "../models/profile.schema.js";
import { generateRandCode } from "../utils/helpers.js";
import sendEmail from "./sendEmail.js";
import Template from "../utils/emailTemplate.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

/* Create new user */
export const createNewUser = async ({
  username,
  firstName,
  lastName,
  email,
  password,
  gender,
  provider = "local",
  picture = "",
  accessToken,
  idToken,
  googleId,
}: CreateUserBody): Promise<UserInterface> => {
  const emailExist = await User.findOne({ email: email });
  if (emailExist) {
    throw new AppError("User already exist.", 409, true);
  }

  const { hashPassword, emailVerification } =
    await createHashpasswordAndEmailVerification(password, 15);

  const isVerified = provider === "google" ? true : false;
  const role = "user";
  const user = await User.create({
    emailVerification: isVerified == true ? {} : emailVerification,
    username,
    email,
    provider,
    role,
    isVerified,
    gender,
    password: hashPassword,
    google: {
      googleId,
      idToken,
      accessToken,
    },
  });

  await Profile.create({
    userId: user._id,
    firstName,
    lastName,
    profilePic: picture,
  });

  if (!isVerified)
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

export interface UserLoginSnaphot {
  id: string;
  email: string;
  isVerified: boolean;
  role: string;
  isActive: boolean;
}

export const loginUser = async (
  password: string,
  email: string,
  deviceInfo: string
): Promise<{
  accessToken: string;
  refreshToken: string;
  user: UserLoginSnaphot;
}> => {
  const user = await getUserAndValidatePassword(email, password);
  const accessToken = user.signToken("accessToken", "24h");
  const refreshToken = user.signToken("refreshToken", "7d");

  const session: Session = {
    refreshToken,
    expiredAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    lastUsed: new Date(),
    deviceInfo,
  };

  user.sessions.push(session);
  await user.save();

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

/* Forget password */
export const forgetPassword = async (email: string): Promise<void> => {
  const user: UserInterface | null = await User.findOne({ email });
  if (!user) throw new AppError("User not found.", 404, true);

  const otpCode = generateRandCode(6);
  user.resetPasswordVerification.otpCode = otpCode;
  user.resetPasswordVerification.otpExpiredAt = new Date(
    Date.now() + 15 * 60 * 1000
  );
  await user.save();

  // user get reset code
  await sendEmail(
    user.email,
    "Reset Password Code",
    Template.resetPasswordTemplate(user.username, otpCode)
  );
};

/* Reset Password */
export const resetPassword = async (
  email: string,
  password: string,
  resetToken: string
): Promise<void> => {
  const user: UserInterface | null = await User.findOne({
    email,
    "resetPasswordVerification.resetToken": resetToken,
    "resetPasswordVerification.resetTokenExpiredAt": { $gt: new Date() },
  });

  if (!user) throw new AppError("Reset token has expired.", 400, true);

  const hashPassword: string = await bcrypt.hash(password, 10);
  user.password = hashPassword;
  user.resetPasswordVerification.resetToken = null;
  user.resetPasswordVerification.resetTokenExpiredAt = null;
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

  await sendEmail(
    user.email,
    "Email Verification Code",
    Template.emailVerificationTemplate(user.username, verificationCode)
  );
};

/* Verify email */
export const verifyEmail = async (
  email: string,
  code: string
): Promise<boolean> => {
  const user: UserInterface | null = await User.findOne({ email: email });

  if (!user) throw new AppError("User not found.", 404, true);
  // can't verify already verified users
  if (user.isVerified)
    throw new AppError("User is already verified.", 400, true);

  if (!user.emailVerification?.expiredAt) {
    throw new AppError("Verification code has expired.", 400, true);
  }

  const storedCode = user.emailVerification.code;
  const expiredAt = new Date(user.emailVerification.expiredAt).getTime();
  const currentTimeStamp = Date.now();

  if (expiredAt < currentTimeStamp) {
    throw new AppError("Verification code has expired.", 400, true);
  }
  if (storedCode !== code) {
    throw new AppError("Verification code is invalid.", 400, true);
  }

  user.isVerified = true;
  user.emailVerification.code = null;
  user.emailVerification.expiredAt = null;
  await user.save();

  return true;
};

/* Verify reset password code */
function generateResetToken(): string {
  return crypto.randomBytes(16).toString("hex");
}
export const verifyResetCode = async (
  email: string,
  code: string
): Promise<{ resetToken: string }> => {
  const user: UserInterface | null = await User.findOne({
    email,
    "resetPasswordVerification.otpCode": code,
    "resetPasswordVerification.otpExpiredAt": { $gt: new Date() },
  });

  if (!user)
    throw new AppError("Code is invalid or Code has expired.", 400, true);

  const resetToken = generateResetToken();
  user.resetPasswordVerification.otpCode = null;
  user.resetPasswordVerification.otpExpiredAt = null;
  user.resetPasswordVerification.resetToken = resetToken;
  user.resetPasswordVerification.resetTokenExpiredAt = new Date(
    Date.now() + 15 * 60 * 1000
  );
  await user.save();

  return { resetToken };
};

/* Refresh token */
export const refreshToken = async (refreshToken: string) => {
  const user: UserInterface | null = await User.findOne({
    "sessions.refreshToken": refreshToken,
  });
  if (!user) throw new AppError("Unauthorized.", 401, true);

  const session = user.sessions.find(
    (session) => session.refreshToken === refreshToken
  );
  if (!session) throw new AppError("Unauthorized.", 401, true);

  const currentTime = Date.now();
  const expiredAt = new Date(session.expiredAt).getTime();

  if (expiredAt < currentTime)
    throw new AppError("Expired refresh token, Unauthorized.", 401, true);

  const accessToken = user.signToken("accessToken", "24h");
  session.lastUsed = new Date();
  await user.save();

  return accessToken;
};
