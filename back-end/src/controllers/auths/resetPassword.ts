import type { Request, Response, NextFunction } from "express";
import AppError from "../../errors/appError.js";
import type { ApiResponse } from "../apiTypes.js";
import User, { type UserDocument } from "../../models/userShema.js";
import bcrypt from "bcrypt";
import sendEmail from "../../services/sendEmail.js";
import Template from "../../utils/emailTemplate.js";

const resetpasswordController = async (
  req: Request<
    {},
    { status: boolean; message: string },
    { password: string; email: string },
    {}
  >,
  res: Response<{ status: boolean; message: string }>,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password }: { email: string; password: string } = req.body;

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

    const response: ApiResponse<void> = {
      status: true,
      message: "Password reset successfully!",
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export default resetpasswordController;
