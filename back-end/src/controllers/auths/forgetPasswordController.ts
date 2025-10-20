import type { Response, Request, NextFunction } from "express";
import { generateRandCode } from "../../utils/helpers.js";
generateRandCode;
import type { ApiResponse } from "../apiTypes.js";
import forgetPassword from "../../services/forgetPassword.js";
import logger from "../../utils/logger.js";

const forgetPasswordController = async (
  req: Request<{}, { status: false; message: string }, { email: string }, {}>,
  res: Response<{ status: boolean; message: string }>,
  next: NextFunction
): Promise<void> => {
  try {
    const userEmail: string = req.body.email;
    await forgetPassword(userEmail);
    logger.info("Password reset code sent to:", { email: userEmail });

    const response: ApiResponse<void> = {
      status: false,
      message: "Reset password code sent successfully.",
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export default forgetPasswordController;
