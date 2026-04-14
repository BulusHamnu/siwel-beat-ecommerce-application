import type { Response, Request, NextFunction } from "express";
import type { ApiResponse } from "./responseInterface.js";
import logger from "../utils/logger.js";
import { sendMessage } from "../services/public.apis.service.js";
import Joi from "joi";
import validateAndSanitizeBody from "../utils/validators/validateAndSanitize.js";

/* Contact me controller */
export interface ContactMeReqBody {
  name: string;
  email: string;
  request: string;
  message: string;
}
// validator function
export function validateContactmeBody(data: ContactMeReqBody) {
  const contactmeBody = Joi.object({
    email: Joi.string().email().required().lowercase(),
    message: Joi.string().required(),
    name: Joi.string().required(),
    request: Joi.string().required(),
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
