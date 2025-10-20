import type { Response, Request, NextFunction } from "express";
import User, { type UserDocument } from "../../models/userShema.js";
import { generateRandCode } from "../../utils/helpers.js";
import sendEmail from "../../services/sendEmail.js";
import AppError from "../../errors/appError.js";
generateRandCode;
import Template from "../../utils/emailTemplate.js";
import type { ApiResponse } from "../apiTypes.js";

const forgetPassword = async (
  req: Request<{}, { status: false; message: string }, { email: string }, {}>,
  res: Response<{ status: boolean; message: string }>,
  next: NextFunction
): Promise<void> => {
  try {
    const userEmail: string = req.body.email;
    const user: UserDocument | null = await User.findOne({ email: userEmail });
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

    const response: ApiResponse<void> = {
      status: false,
      message: "Reset password code sent successfully.",
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export default forgetPassword;
