import type { UserDocument } from "../models/userShema.js";
import User from "../models/userShema.js";
import AppError from "../errors/appError.js";

const verifyEmail = async (email: string, code: string): Promise<boolean> => {
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

export default verifyEmail;
