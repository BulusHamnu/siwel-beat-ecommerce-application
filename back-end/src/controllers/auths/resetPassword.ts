import type { Request, Response, NextFunction } from "express";
import type { ApiResponse } from "../apiTypes.js";
import resetPassword from "../../services/resetPassword.js";
import logger from "../../utils/logger.js";

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
    await resetPassword(email, password);
    logger.info(`User with email ${email} reset their password.`);

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
