import type { Request, Response, NextFunction } from "express";
import env from "../../configs/env.js";
import { type ApiResponse } from "../responseInterface.js";
import logger from "../../utils/logger.js";
import retriveGoogleUserPayload, {
  type userGooglePayload,
} from "../../services/retriveGoogleIdToken.js";
import User, { type UserInterface } from "../../models/user.schema.js";
import { createNewUser } from "../../services/auth.service.js";
import AppError from "../../errors/appError.js";
import Joi from "joi";
import validateAndSanitizeBody from "../../utils/validators/validateAndSanitize.js";

/* Get google Oauth url */
function validateQueryBody(data: { state: string }) {
  const stateSchema = Joi.object({
    state: Joi.string().required().valid("signup", "login"),
  });
  return validateAndSanitizeBody(data, stateSchema);
}

export const getGoogleOauthUrl = async (
  req: Request<{}, ApiResponse<{ url: string }>, {}, { state: string }>,
  res: Response<{
    status: boolean;
    message: string;
    data?: { url: string };
  }>,
  next: NextFunction
): Promise<void> => {
  try {
    const { state } = validateQueryBody(req.query);
    const authparams = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: env.GOOGLE_REDIRECT_URL,
      response_type: "code",
      scope: "openid profile email",
      prompt: "consent",
      state,
    });

    const url = `${env.GOOGLE_OAUTH2_URL}?${authparams.toString()}`;
    logger.info(`Google Oauth prompt url requested for: ${state}`);

    const response: ApiResponse<{ url: string }> = {
      status: true,
      message: "Google oauth2 url retrived successfully.",
      data: {
        url,
      },
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Google Oauth2 sign up controller */
function validateCodeAndState(code: string, state: string) {
  if (!code) throw new AppError("CONSENT_CANCELLED", 400, true);
  if (!state) throw new AppError("MISSSING_STATE", 400, true);
  if (state !== "login" && state !== "signup")
    throw new AppError("INVALID_STATE", 400, true);
  return;
}

export const googleCallback = async (
  req: Request<{}, {}, {}, { code: string; state: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let authFlow = "";
  try {
    const { code, state } = req.query;
    validateCodeAndState(code, state);
    authFlow = state;

    const verifiedUserPayload: userGooglePayload =
      await retriveGoogleUserPayload(code);

    let user: UserInterface | null = null;
    if (state === "signup") {
      user = await createNewUser({
        ...verifiedUserPayload,
        provider: "google",
      });
      logger.info("User created successully.", { userId: user._id });
      //
    } else {
      user = await User.findOne({
        email: verifiedUserPayload.email,
      });

      if (!user) throw new AppError("NOT_FOUND", 404, true);
      if (user && user.provider !== "google")
        throw new AppError("NOT_LINKED", 400, true);
    }

    const refreshToken = user.signToken("refreshToken", "7d");
    res.cookie("refreshToken", refreshToken, env.LOGIN_COOKIE_OPTS);

    res
      .status(302)
      .redirect(`${env.FRONTEND_URL}/oauth/callback?state=${state}`);
  } catch (error: any) {
    logger.error("An error occur while in google oauth2 callback.", error);

    if (error.message.includes("User already exist.")) {
      return res
        .status(302)
        .redirect(
          `${env.FRONTEND_URL}/oauth/callback?state=${authFlow}&error=USER_EXIST`
        );
    }

    return res
      .status(302)
      .redirect(
        `${env.FRONTEND_URL}/oauth/callback?state=${authFlow}&error=${
          error.message || "UNEXPECTED_ERROR"
        }`
      );
  }
};
