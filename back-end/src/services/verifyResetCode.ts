import type { UserDocument } from "../models/userShema.js";
import User from "../models/userShema.js";
import AppError from "../errors/appError.js";

const verifyResetCode = async (code: string): Promise<boolean> => {
  const codeIsValid: UserDocument | null = await User.findOne({
    "resetPasswordVerification.code": code,
    "resetPasswordVerification.expiredAt": { $gt: new Date() },
  });

  if (!codeIsValid)
    throw new AppError("Code is invalid or Code have expired.", 400, true);
  return true;
};

export default verifyResetCode;
