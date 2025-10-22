import type { Response, Request, NextFunction } from "express";
import type { ApiResponse } from "../apiTypes.js";
import resendVerificationEmail from "../../services/resendVerificationEmail.js";
import logger from "../../utils/logger.js";

const resendVeficationEmailController = async (
  req: Request<{}, { status: boolean; message: string }, {}, {}>,
  res: Response<{ status: boolean; message: string }>,
  next: NextFunction
): Promise<void> => {
  try {
    const email: string | undefined = req.user?.email;

    await resendVerificationEmail(email || "");
    logger.info("Email verification code sent to: ", { email: email || "" });

    const response: ApiResponse<void> = {
      status: true,
      message: "Verification email sent successfully.",
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export default resendVeficationEmailController;
