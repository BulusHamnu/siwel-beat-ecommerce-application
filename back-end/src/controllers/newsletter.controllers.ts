import type { Response, Request, NextFunction } from "express";
import type { ApiResponse } from "./responseInterface.js";
import AppError from "../errors/appError.js";
import {
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
} from "../services/newsletter.services.js";
import env from "../configs/env.js";
import logger from "../utils/logger.js";

// SUBSCRIBE TO NEWSLETTER CONTROLLER
export const subscribeToNewletterController = async (
  req: Request<{}, ApiResponse<void>, { email: string }, {}>,
  res: Response<ApiResponse<void>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) throw new AppError("Please provide an email.", 400, true);

    await subscribeToNewsletter(email);

    logger.info(`${email} just subcribed to the newletter.`);
    const response: ApiResponse<void> = {
      status: true,
      message: "You have successfully subcribed to the news-letter.",
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// UNSUBSCRIBE FROM NEWSLETTER CONTROLLER
export const unsubscribeToNewletterController = async (
  req: Request<{}, ApiResponse<void>, {}, { email: string; token: string }>,
  res: Response<ApiResponse<void>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, token } = req.query;
    if (!email || !token)
      throw new AppError("Please provide an email and token.", 400, true);

    await unsubscribeFromNewsletter(email, token);

    let redirect: string =
      env.FRONTEND_URL + "/news-letter/unsubscibe?result=SUCCESS";
    res.status(302).redirect(redirect);
  } catch (error) {
    logger.error(
      `An error occur while trying to unsubscribe user from news-letter.`
    );
    res
      .status(302)
      .redirect(`${env.FRONTEND_URL}/news-letter/unsubscibe?result=ERROR`);
  }
};
