import type { Response, Request, NextFunction } from "express";
import type { ApiResponse } from "./responseInterface.js";
import * as newsletterService from "../services/newsletter.service.js";
import env from "../configs/env.js";
import logger from "../utils/logger.js";
import validateAndSanitizeBody from "../utils/validators/validateAndSanitize.js";
import AppError, { ErrorCodes } from "../errors/appError.js";
import Joi from "joi";

export function validateNewsletterBody(data: { email: string }) {
  const newsLetterReqBody = Joi.object({
    email: Joi.string().email().required().lowercase(),
  });

  return validateAndSanitizeBody(data, newsLetterReqBody);
}

/* Subscribe to newsletter controller */
export const subscribeToNewletter = async (
  req: Request<{}, ApiResponse<void>, { email: string }, {}>,
  res: Response<ApiResponse<void>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email } = validateNewsletterBody(req.body);

    await newsletterService.subscribeToNewsletter(email);
    logger.info(`${email} just subscribed to the newsletter.`);

    const response: ApiResponse<void> = {
      status: true,
      message: "You've successfully subscribed to the newsletter.",
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Unsubscribe to newsletter controller */
export interface NewsletterQuery {
  email: string;
  token: string;
}

export const unsubscribeToNewletter = async (
  req: Request<{}, ApiResponse<void>, {}, any>,
  res: Response<ApiResponse<void>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, token }: NewsletterQuery = req.query;
    if (!email || !token)
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        "Please provide an email and token.",
        400,
        true,
        null,
      );

    await newsletterService.unsubscribeFromNewsletter(email, token);

    let redirect: string =
      env.FRONTEND_URL + "/news-letter/unsubscribe?result=success";

    res.status(302).redirect(redirect);
  } catch (error: any) {
    logger.error(
      `An error occur while trying to remove user from news-letter.`,
      error,
    );

    const code = error.code;
    switch (code) {
      case ErrorCodes.VALIDATION_ERROR: {
        return res
          .status(302)
          .redirect(
            `${env.FRONTEND_URL}/news-letter/unsubscribe?result=missing_parameters`,
          );
      }

      case ErrorCodes.NEWSLETTER_SUBSCRIPTION_NOT_FOUND: {
        return res
          .status(302)
          .redirect(
            `${env.FRONTEND_URL}/news-letter/unsubscribe?result=not_found`,
          );
      }

      case ErrorCodes.TOKEN_INVALID: {
        return res
          .status(302)
          .redirect(
            `${env.FRONTEND_URL}/news-letter/unsubscribe?result=token_invalid`,
          );
      }

      default: {
        return res
          .status(302)
          .redirect(
            `${env.FRONTEND_URL}/news-letter/unsubscribe?result=unexpected_error`,
          );
      }
    }
  }
};
