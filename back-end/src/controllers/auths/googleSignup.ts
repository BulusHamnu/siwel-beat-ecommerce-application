import type { Request, Response, NextFunction } from "express";
import AppError from "../../errors/appError.js";
import env from "../../configs/env.js";
import retriveGoogleUserPayload, {
  type userPayloadInterface,
} from "../../services/retriveGoogleIdToken.js";
import logger from "../../utils/logger.js";
import User, { type UserDocument } from "../../models/userShema.js";
import createNewUser from "../../services/createNewUser.js";
import jwt from "jsonwebtoken";

// google signup fallback controller
const googleSignupFallback = async (
  req: Request<{}, {}, {}, { code: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const code = req.query.code;
    if (!code)
      return res
        .status(301)
        .redirect(`${env.FRONTEND_URL}/auth/register?error=cancelled`);
    const payload: userPayloadInterface = await retriveGoogleUserPayload(code);

    // check if user already exist else create new user
    const user: UserDocument | null = await User.findOne({
      email: payload.email,
    });
    if (user) {
      return res
        .status(301)
        .redirect(`${env.FRONTEND_URL}/auth/login?error=user_exist`);
    }

    const newUser = await createNewUser(payload);
    logger.info("User created successully.", { userId: newUser._id });

    // sign token
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

    res.cookie("token", token, {
      secure: env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
      httpOnly: true,
    });

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

export default googleSignupFallback;
