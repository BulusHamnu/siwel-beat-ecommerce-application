import type { Request, Response, NextFunction } from "express";
import AppError from "../../errors/appError.js";
import { URLSearchParams } from "url";
import env from "../../configs/env.js";
import type { ApiResponse } from "../apiTypes.js";
import retriveGoogleUserPayload, {
  type userPayloadInterface,
} from "../../services/retriveGoogleIdToken.js";
import logger from "../../utils/logger.js";
import User, { type UserDocument } from "../../models/userShema.js";
import createNewUser from "../../services/createNewUser.js";

// google signup controller: request auth link
const googleSignupController = async (
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
    const googleOauthUrl = "https://accounts.google.com/o/oauth2/v2/auth?";

    const params = new URLSearchParams({
      client_id: env.CLIENT_ID,
      redirect_uri: `${env.BACKEND_URL}/api/auth/google/register-fallback`,
      response_type: "code",
      scope: "openid profile email",
      prompt: "consent",
    });

    const url = googleOauthUrl + params;
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

// google signup fallback controller
const googleSignupFallback = async (
  req: Request<{}, {}, {}, { code: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const code = req.query.code;
    if (!code)
      return res.status(301).redirect(`${env.FRONTEND_URL}?error=cancelled`);
    const payload: userPayloadInterface = await retriveGoogleUserPayload(code);

    // check if user already exist else create new user
    const user: UserDocument | null = await User.findOne({
      email: payload.email,
    });
    if (user) {
      return res
        .status(301)
        .redirect(`${env.FRONTEND_URL}/login?error=user_exist`);
    }

    const newUser = await createNewUser(payload);
    logger.info("User created successully.", { userId: newUser._id });

    res.status(301).redirect(`${env.FRONTEND_URL}`);
  } catch (error) {
    if (error instanceof AppError) return next(error);
    logger.error(
      "An error occur while user is signing up using google oauth2.",
      error
    );
    res
      .status(301)
      .redirect(`${env.FRONTEND_URL}/auth/login?error=unexpected_error`);
  }
};

export { googleSignupController, googleSignupFallback };
