import type { Response, Request, NextFunction } from "express";
import type { ApiResponse } from "./responseInterface.js";
import sendEmail from "../services/sendEmail.js";
import env from "../configs/env.js";
import Template from "../utils/emailTemplate.js";
import AppError from "../errors/appError.js";

export const contactmeController = async (
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

    // send email
    await sendEmail(
      env.ADMIN_EMAIL,
      "New Message From Siwel Beatz App",
      Template.contactMeTemplate(data)
    );

    const response: ApiResponse<void> = {
      status: true,
      message: "Message was sent successfully.",
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
