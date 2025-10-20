import type { Response, Request, NextFunction } from "express";
import type { ApiResponse } from "../apiTypes.js";
import verifyResetCode from "../../services/verifyResetCode.js";

const verifyResetCodeController = async (
  req: Request<{}, { status: boolean; message: string }, { code: string }, {}>,
  res: Response<{ status: boolean; message: string }>,
  next: NextFunction
): Promise<void> => {
  try {
    const code: string = req.body.code;
    await verifyResetCode(code);

    const response: ApiResponse<void> = {
      status: true,
      message: "Code is valid.",
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export default verifyResetCodeController;
