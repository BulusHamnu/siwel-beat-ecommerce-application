import type { Response, Request, NextFunction } from "express";
import User, { type UserDocument } from "../../models/userShema.js";
import Profile from "../../models/profileSchema.js";
import AppError from "../../errors/appError.js";
import type { ApiResponse } from "../apiTypes.js";

// reqbody
interface emailVerificationBody {
  email: string;
  code: string;
}

const verifyEmailController = async (
  req: Request<
    {},
    { status: boolean; message: string },
    { email: string; code: string },
    { status: boolean; message: string }
  >,
  res: Response<{}>,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, code }: emailVerificationBody = req.body;

    const user: UserDocument | null = await User.findOne({ email: email });
    if (!user) throw new AppError("User does not exist.", 404, true);
    // check if user is already verified
    if (user.isVerified)
      res
        .status(200)
        .json({ status: false, message: "User is already verified" });

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

    const response: ApiResponse<void> = {
      status: true,
      message: "Email verified successfully.",
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    next(error);
  }
};

export default verifyEmailController;
