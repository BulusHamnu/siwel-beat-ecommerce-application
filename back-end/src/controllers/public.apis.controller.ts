import type { Response, Request, NextFunction } from "express";
import type { ApiResponse } from "./responseInterface.js";
import AppError from "../errors/appError.js";
import logger from "../utils/logger.js";
import { sendMessage } from "../services/public.apis.service.js";

/* Contact me controller */
export const contactme = async (
  req: Request<
    {},
    ApiResponse<void>,
    { name: string; email: string; request: string; message: string },
    {}
  >,
  res: Response<ApiResponse<void>>,
  next: NextFunction
): Promise<any> => {
  try {
    const data = req.body;
    if (!data.name || !data.email || !data.message)
      throw new AppError(
        "Please provide name, email and user's message.",
        400,
        true
      );

    await sendMessage(data);

    logger.info(`New message from contact form.`);
    const response: ApiResponse<void> = {
      status: true,
      message: "Message was sent successfully.",
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
