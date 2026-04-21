import type { Response, Request, NextFunction } from "express";
import type { ApiResponse } from "./responseInterface.js";
import logger from "../utils/logger.js";
import { sendMessage } from "../services/contactme.service.js";
import Joi from "joi";
import validateAndSanitizeBody from "../utils/validators/validateAndSanitize.js";

/* Contact me controller */
export interface ContactMeReqBody {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function validateContactmeBody(data: ContactMeReqBody) {
  const contactmeBody = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required().lowercase(),
    subject: Joi.string().required(),
    message: Joi.string().required(),
  });

  return validateAndSanitizeBody(data, contactmeBody);
}

export const contactme = async (
  req: Request<{}, ApiResponse<void>, ContactMeReqBody, {}>,
  res: Response<ApiResponse<void>>,
  next: NextFunction,
): Promise<any> => {
  try {
    const data: ContactMeReqBody = validateContactmeBody(req.body);

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
