import type { UserDocument } from "../models/userShema.js";
import AppError from "../errors/appError.js";
import { generateRandCode } from "../utils/helpers.js";
import User from "../models/userShema.js";
import sendEmail from "./sendEmail.js";
import Template from "../utils/emailTemplate.js";

const resendVerificationEmail = async (email: string): Promise<boolean> => {
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

export default resendVerificationEmail;
