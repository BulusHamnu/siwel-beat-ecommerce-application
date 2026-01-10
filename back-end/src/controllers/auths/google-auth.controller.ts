import type { Request, Response, NextFunction } from "express";
import env from "../../configs/env.js";
import { type ApiResponse } from "../responseInterface.js";
import logger from "../../utils/logger.js";
import retriveGoogleUserPayload, {
  type userGooglePayload,
} from "../../services/retriveGoogleIdToken.js";
import User, { type UserInterface } from "../../models/user.schema.js";
import { createNewUser } from "../../services/auth.service.js";
import jwt from "jsonwebtoken";
import AppError from "../../errors/appError.js";

/* Get gogle Oauth2 url controller */
export const setGoogleRedirect = (route: string = "register"): string => {
  const loginRedirectUri = `${env.BACKEND_URL}/api/auth/google/login-fallback`;
  const registerRedirectUri = `${env.BACKEND_URL}/api/auth/google/register-fallback`;

  const r = route === "register" ? registerRedirectUri : loginRedirectUri;
  return r;
};

export const getGoogleOauthUrl = async (
  req: Request<
    {},
    {
      status: boolean;
      message: string;
      data?: { url: string };
    },
    {},
    {}
  >,
  res: Response<{
    status: boolean;
    message: string;
    data?: { url: string };
  }>,
  next: NextFunction
): Promise<void> => {
  try {
    const path = req.path;

    const redirectUri = setGoogleRedirect(path.split("/")[3]);
    const authparams = new URLSearchParams({
      client_id: env.CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid profile email",
      prompt: "consent",
    });

    const url = `${env.GOOGLEOAUTH2URL}?${authparams.toString()}`;
    logger.info(`Google Oauth prompt url requested for: ${path.split("/")[3]}`);

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
async function createUserAndSignToken(userDetail: userGooglePayload) {
  const newUser = await createNewUser(userDetail);
  logger.info("User created successully.", { userId: newUser._id });

  const token: string = jwt.sign(
    {
      id: newUser._id,
      email: newUser.email,
      isVerified: newUser.isVerified,
      role: newUser.role,
    },
    env.SECRET_KEY,
    { expiresIn: "7d" }
  );

  return { token };
}

export const googleSignupFallback = async (
  req: Request<{}, {}, {}, { code: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const code = req.query.code;
    if (!code) throw new AppError("Consent cancelled.", 400, true);

    const verifiedUserPayload: userGooglePayload =
      await retriveGoogleUserPayload(code, "register");
    const { token } = await createUserAndSignToken(verifiedUserPayload);

    res.cookie("token", token, env.LOGIN_COOKIE_OPTS);
    res.status(301).redirect(`${env.FRONTEND_URL}`);
  } catch (error: any) {
    logger.error(
      "An error occur while user is signing up using google oauth2.",
      error
    );

    if (error.message.includes("User already exist.")) {
      return res
        .status(301)
        .redirect(`${env.FRONTEND_LOGIN_URL}?error=USER_EXIST`);
    } else if (error.message.includes("Consent cancelled.")) {
      return res
        .status(301)
        .redirect(`${env.FRONTEND_SIGNUP_URL}?error=CONSENT_CANCELLED`);
    } else {
      res
        .status(301)
        .redirect(`${env.FRONTEND_SIGNUP_URL}?error=UNEXPECTED_ERROR`);
    }
  }
};

/* Google Oauth2 log in controller */
export const googleLoginFallback = async (
  req: Request<{}, {}, {}, { code: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const code = req.query.code;
    if (!code) throw new AppError("Consent cancelled.", 400, true);

    const verifiedUserPayload: userGooglePayload =
      await retriveGoogleUserPayload(code, "login");

    const user: UserInterface | null = await User.findOne({
      email: verifiedUserPayload.email,
    });
    if (!user) throw new AppError("User not found.", 404, true);

    if (user && user.provider !== "google")
      throw new AppError("Account not linked.", 400, true);

    const token: string = jwt.sign(
      {
        id: user._id,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role,
      },
      env.SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, env.LOGIN_COOKIE_OPTS);
    res.status(301).redirect(`${env.FRONTEND_URL}`);
  } catch (error: any) {
    logger.error(
      "An error occur while user is signing in using google oauth2.",
      error
    );

    if (error.message.includes("Consent cancelled.")) {
      return res
        .status(301)
        .redirect(`${env.FRONTEND_LOGIN_URL}?error=CONSENT_CANCELLED`);
    } else if (error.message.includes("User not found.")) {
      return res
        .status(301)
        .redirect(`${env.FRONTEND_LOGIN_URL}?error=NOT_FOUND`);
    } else if (error.message.includes("Account not linked.")) {
      return res
        .status(301)
        .redirect(`${env.FRONTEND_SIGNUP_URL}?error=NOT_LINKED`);
    } else {
      res
        .status(301)
        .redirect(`${env.FRONTEND_LOGIN_URL}?error=UNEXPECTED_ERROR`);
    }
  }
};
