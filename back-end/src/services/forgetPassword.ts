import type { UserDocument } from "../models/userShema.js";
import User from "../models/userShema.js";
import AppError from "../errors/appError.js";
import { generateRandCode } from "../utils/helpers.js";
import sendEmail from "./sendEmail.js";
import Template from "../utils/emailTemplate.js";

const forgetPassword = async (email: string): Promise<void> => {
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

export default forgetPassword;
