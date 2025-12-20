import type { Response, Request, NextFunction } from "express";
import type { ApiResponse } from "./responseInterface.js";
import AppError from "../errors/appError.js";
import * as newsletterService from "../services/newsletter.service.js";
import env from "../configs/env.js";
import logger from "../utils/logger.js";

/* Subscribe to newsletter controller */
export const subscribeToNewletterController = async (
  req: Request<{}, ApiResponse<void>, { email: string }, {}>,
  res: Response<ApiResponse<void>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) throw new AppError("Please provide an email.", 400, true);

    await newsletterService.subscribeToNewsletter(email);

    logger.info(`${email} just subcribed to the newletter.`);
    const response: ApiResponse<void> = {
      status: true,
      message: "You have successfully subscribed to the news-letter.",
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Unsubscribe to newsletter controller */
export const unsubscribeToNewletterController = async (
  req: Request<{}, ApiResponse<void>, {}, { email: string; token: string }>,
  res: Response<ApiResponse<void>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, token } = req.query;
    if (!email || !token)
      throw new AppError("Please provide an email and token.", 400, true);

    await newsletterService.unsubscribeFromNewsletter(email, token);

    let redirect: string =
      env.FRONTEND_URL + "/news-letter/unsubscibe?result=SUCCESS";
    res.status(302).redirect(redirect);
  } catch (error) {
    logger.error(
      `An error occur while trying to remove user from news-letter.`
    );
    res
      .status(302)
      .redirect(`${env.FRONTEND_URL}/news-letter/unsubscibe?result=ERROR`);
  }
};
