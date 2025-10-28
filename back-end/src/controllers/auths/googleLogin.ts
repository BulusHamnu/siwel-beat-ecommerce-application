import type { Response, Request, NextFunction } from "express";
import env from "../../configs/env.js";
import retriveGoogleUserPayload, {
  type userPayloadInterface,
} from "../../services/retriveGoogleIdToken.js";
import type { UserDocument } from "../../models/userShema.js";
import User from "../../models/userShema.js";
import jwt from "jsonwebtoken";
import logger from "../../utils/logger.js";
import AppError from "../../errors/appError.js";

const googleLoginFallback = async (
  req: Request<{}, {}, {}, { code: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const code = req.query.code;
    if (!code) {
      logger.info("Google oauth consent is cancelled, code does not exist.");
      return res
        .status(301)
        .redirect(`${env.FRONTEND_SIGNUP_URL}?error=cancelled`);
    }

    const payload: userPayloadInterface = await retriveGoogleUserPayload(
      code,
      "login"
    );

    // check if user exist
    const user: UserDocument | null = await User.findOne({
      email: payload.email,
    });
    if (!user) {
      return res
        .status(301)
        .redirect(`${env.FRONTEND_SIGNUP_URL}?error=not_found`);
    }
    if (user && user.provider !== "google") {
      return res
        .status(301)
        .redirect(`${env.FRONTEND_SIGNUP_URL}?error=not_linked`);
    }

    // sign token
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
  } catch (error) {
    if (error instanceof AppError) return next(error);
    logger.error(
      "An error occur while user is signing in using google oauth2.",
      error
    );
    res
      .status(301)
      .redirect(`${env.FRONTEND_LOGIN_URL}?error=unexpected_error`);
  }
};

export default googleLoginFallback;
