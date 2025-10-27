import type { Response, Request, NextFunction } from "express";
import env from "../../configs/env.js";
import retriveGoogleUserPayload, {
  type userPayloadInterface,
} from "../../services/retriveGoogleIdToken.js";
import type { UserDocument } from "../../models/userShema.js";
import User from "../../models/userShema.js";
import jwt from "jsonwebtoken";

const googleLoginFallback = async (
  req: Request<{}, {}, {}, { code: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const code = req.query.code;
    if (!code)
      return res
        .status(301)
        .redirect(`${env.FRONTEND_SIGNUP_URL}?error=cancelled`);

    const payload: userPayloadInterface = await retriveGoogleUserPayload(code);

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

    res.cookie("token", token, {
      secure: env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
      httpOnly: true,
    });

    res.status(301).redirect(`${env.FRONTEND_URL}`);
  } catch (error) {
    next(error);
  }
};

export default googleLoginFallback;
