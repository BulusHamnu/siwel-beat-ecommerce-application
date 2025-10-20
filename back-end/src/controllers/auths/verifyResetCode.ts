import type { Response, Request, NextFunction } from "express";
import User from "../../models/userShema.js";
import type { UserDocument } from "../../models/userShema.js";
import AppError from "../../errors/appError.js";
import type { ApiResponse } from "../apiTypes.js";

const verifyResetCode = async (
  req: Request<{}, { status: boolean; message: string }, { code: string }, {}>,
  res: Response<{ status: boolean; message: string }>,
  next: NextFunction
): Promise<void> => {
  try {
    const code: string = req.body.code;

    const codeIsValid: UserDocument | null = await User.findOne({
      "resetPasswordVerification.code": code,
      "resetPasswordVerification.expiredAt": { $gt: new Date() },
    });

    if (!codeIsValid)
      throw new AppError("Code is invalid or Code have expired.", 400, true);

    const response: ApiResponse<void> = {
      status: true,
      message: "Code is valid.",
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export default verifyResetCode;
