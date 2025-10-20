import type { UserDocument } from "../models/userShema.js";
import bcrypt from "bcrypt";
import User from "../models/userShema.js";
import sendEmail from "./sendEmail.js";
import AppError from "../errors/appError.js";
import Template from "../utils/emailTemplate.js";

const resetPassword = async (
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

export default resetPassword;
