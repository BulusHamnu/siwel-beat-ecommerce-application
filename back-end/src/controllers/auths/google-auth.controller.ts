import type { Request, Response, NextFunction } from "express";
import env from "../../configs/env.js";
import { type ApiResponse } from "../responseInterface.js";
import logger from "../../utils/logger.js";
import retriveGoogleUserPayload, {
  type userGooglePayload,
} from "../../services/retriveGoogleUserPayload.js";
import User, { type UserInterface } from "../../models/user.schema.js";
import { createNewUser } from "../../services/auth.service.js";
import AppError, { ErrorCodes } from "../../errors/appError.js";
import Joi from "joi";
import validateAndSanitizeBody from "../../utils/validators/validateAndSanitize.js";
import Session from "../../models/session.schema.js";

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
  next: NextFunction,
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
    logger.info(`Google Oauth url requested for: ${state}`);

    const response: ApiResponse<{ url: string }> = {
      status: true,
      message: "Google oauth2 url retrieved successfully.",
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
function validateCodeAndState(
  code: string,
  state: string,
  error: string | null = null,
) {
  if ((error && error?.includes("access_denied")) || !code) {
    throw new AppError(
      ErrorCodes.GOOGLE_CONSENT_CANCELLED,
      "Google oauth consent screen cancelled.",
      400,
      true,
      null,
    );
  }

  if (!state)
    throw new AppError(
      ErrorCodes.OAUTH_STATE_REQUIRED,
      "Oauth state is required.",
      400,
      true,
      null,
    );

  if (state !== "login" && state !== "signup")
    throw new AppError(
      ErrorCodes.OAUTH_STATE_INVALID,
      "Invalid oauth state.",
      400,
      true,
      { state },
    );

  return;
}

export const googleCallback = async (
  req: Request<{}, {}, {}, { code: string; state: string; error: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  let authFlow = "";
  try {
    const { code, state, error } = req.query;
    validateCodeAndState(code, state, error);
    authFlow = state;

    const verifiedUserPayload: userGooglePayload =
      await retriveGoogleUserPayload(code);

    let user: UserInterface | null = null;
    if (state === "signup") {
      user = await createNewUser(verifiedUserPayload);

      logger.info("User created successully.", { userId: user._id });
      //
    } else if (state === "login") {
      user = await User.findOne({
        email: verifiedUserPayload.email,
      });

      if (!user)
        throw new AppError(
          ErrorCodes.USER_NOT_FOUND,
          "User not found.",
          404,
          true,
          null,
        );

      if (user && user.provider !== "google")
        throw new AppError(
          ErrorCodes.GOOGLE_NOT_LINKED,
          "Google not linked.",
          400,
          true,
          null,
        );
      //
    } else {
      throw new AppError(
        ErrorCodes.OAUTH_STATE_INVALID,
        "Oauth state is invalid.",
        400,
        true,
        null,
      );
    }

    const accessToken = user.signToken("accessToken", "24h");
    const refreshToken = user.signToken("refreshToken", "7d");

    const deviceInfo = req.headers["user-agent"] || "Unidentified";
    await Session.create({
      userId: user._id as string,
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      lastUsed: new Date(),
      deviceInfo,
    });

    res.cookie("refreshToken", refreshToken, env.LOGIN_COOKIE_OPTS);
    res
      .status(302)
      .redirect(
        `${env.FRONTEND_URL}/oauth/callback?state=${state}&access_token=${accessToken}`,
      );
  } catch (error: any) {
    logger.error("An error occured in google oauth2 callback.", error);

    const errCode = error.code || "UNEXPECTED_ERROR";
    return res
      .status(302)
      .redirect(
        `${env.FRONTEND_URL}/oauth/callback?state=${authFlow}&error=${errCode.toLowerCase()}`,
      );
  }
};
