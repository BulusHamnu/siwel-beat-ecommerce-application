import type { Response, Request, NextFunction } from "express";
import User, { type UserDocument } from "../../models/userShema.js";
import type { ApiResponse } from "../apiTypes.js";
import AppError from "../../errors/appError.js";
import { generateRandCode } from "../../utils/helpers.js";
import sendEmail from "../../services/sendEmail.js";
import Template from "../../utils/emailTemplate.js";

const resendVeficationEmail = async (
  req: Request<{}, { status: boolean; message: string }, { email: string }, {}>,
  res: Response<{ status: boolean; message: string }>,
  next: NextFunction
): Promise<void> => {
  try {
    const userEmail: string = req.body.email;
    const user: UserDocument | null = await User.findOne({ email: userEmail });
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

    const response: ApiResponse<void> = {
      status: false,
      message: "Verification email sent successfully.",
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export default resendVeficationEmail;
