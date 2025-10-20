import type { Response, Request, NextFunction } from "express";
import type { ApiResponse } from "../apiTypes.js";
import verifyEmail from "../../services/verifyEmail.js";

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
    {}
  >,
  res: Response<{}>,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, code }: emailVerificationBody = req.body;
    await verifyEmail(email, code);

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
