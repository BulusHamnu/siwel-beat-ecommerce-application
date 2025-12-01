import type { Response, Request, NextFunction } from "express";
import logger from "../utils/logger.js";
import type { createUserBody } from "./userTypes.js";
import {
  createNewUser,
  resetPassword,
  resendVerificationEmail,
  forgetPassword,
  verifyEmail,
  loginUser,
  type LoginReturnType,
} from "../services/auth.services.js";

import type { ApiResponse } from "./responseInterface.js";
import sendEmail from "../services/sendEmail.js";
import Template from "../utils/emailTemplate.js";
import env from "../configs/env.js";
import { generateRandCode } from "../utils/helpers.js";
generateRandCode;

import { setRedirect } from "../utils/helpers.js";
import AppError from "../errors/appError.js";
import jwt from "jsonwebtoken";
import retriveGoogleUserPayload, {
  type userPayloadInterface,
} from "../services/retriveGoogleIdToken.js";
import User, { type UserDocument } from "../models/user.schema.js";

// SIGN UP NEW USER CONTROLLER
export const signUpController = async (
  req: Request<{}, {}, createUserBody, {}>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userData: createUserBody = req.body;
    const newUser = await createNewUser(userData);
    logger.info("User created successully!", { userId: newUser._id });
    // send verification email
    await sendEmail(
      newUser.email,
      "Please verify you email.",
      Template.emailVerificationTemplate(
        newUser.username,
        newUser.emailVerification.code
      )
    );

    const response: ApiResponse<void> = {
      status: true,
      message: "User created successfully, you can now log in.",
    };

    res.status(201).json(response);
  } catch (error: unknown) {
    next(error);
  }
};

// LOGIN CONTROLLER
interface loginBody {
  email: string;
  password: string;
}
export const logInController = async (
  req: Request<{}, ApiResponse<LoginReturnType>, loginBody, {}>,
  res: Response<ApiResponse<LoginReturnType>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { password, email } = req.body;
    const result = await loginUser(password, email);

    res.cookie("token", result.token, env.LOGIN_COOKIE_OPTS);

    const response: ApiResponse<LoginReturnType> = {
      status: true,
      message: "Login successully!",
      data: result,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// VERIFY EMAIL CONTROLLER
// reqbody
interface emailVerificationBody {
  email: string;
  code: string;
}

export const verifyEmailController = async (
  req: Request<
    {},
    { status: boolean; message: string },
    { email: string; code: string },
    {}
  >,
  res: Response<{}>,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, code }: emailVerificationBody = req.body;
    await verifyEmail(email, code);

    const response: ApiResponse<void> = {
      status: true,
      message: "Email verified successfully.",
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    next(error);
  }
};

// RESEND VERIFICATION EMAIL CONTROLLER
export const resendVeficationEmailController = async (
  req: Request<{}, { status: boolean; message: string }, {}, {}>,
  res: Response<{ status: boolean; message: string }>,
  next: NextFunction
): Promise<void> => {
  try {
    const email: string | undefined = req.user?.email;

    await resendVerificationEmail(email || "");
    logger.info("Email verification code sent to: ", { email: email || "" });

    const response: ApiResponse<void> = {
      status: true,
      message: "Verification email sent successfully.",
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// FORGET PASSWORD CONTROLLER
export const forgetPasswordController = async (
  req: Request<{}, { status: false; message: string }, { email: string }, {}>,
  res: Response<{ status: boolean; message: string }>,
  next: NextFunction
): Promise<void> => {
  try {
    const userEmail: string = req.body.email;
    await forgetPassword(userEmail);
    logger.info("Password reset code sent to:", { email: userEmail });

    const response: ApiResponse<void> = {
      status: true,
      message: "Reset password code sent successfully.",
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// VERIFY RESET CODE
export const verifyResetCodeController = async (
  req: Request<
    {},
    { status: boolean; message: string },
    { code: string; email: string },
    {}
  >,
  res: Response<{ status: boolean; message: string }>,
  next: NextFunction
): Promise<void> => {
  try {
    const { code, email } = req.body;

    const codeIsValid: UserDocument | null = await User.findOne({
      email,
      "resetPasswordVerification.code": code,
      "resetPasswordVerification.expiredAt": { $gt: new Date() },
    });

    if (!codeIsValid)
      throw new AppError("Code is invalid or Code have expired.", 400, true);

    const response: ApiResponse<void> = {
      status: true,
      message: "Code is valid.",
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// RESET PASSWORD CONTROLLER
export const resetpasswordController = async (
  req: Request<
    {},
    { status: boolean; message: string },
    { password: string; email: string },
    {}
  >,
  res: Response<{ status: boolean; message: string }>,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password }: { email: string; password: string } = req.body;
    await resetPassword(email, password);
    logger.info(`User with email ${email} reset their password.`);

    const response: ApiResponse<void> = {
      status: true,
      message: "Password reset successfully!",
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// LOG OUT CONTROLLER
export const logoutController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.cookie("token", "", {
      secure: env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
      httpOnly: true,
    });

    const response: ApiResponse<void> = {
      status: true,
      message: "Logout successully!",
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// GET GOOGLE OAUTH2 URL
export const getGoogleOauthUrlController = async (
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
    const path = req.path;

    const redirectUri = setRedirect(path.split("/")[3]);

    const params = new URLSearchParams({
      client_id: env.CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid profile email",
      prompt: "consent",
    });

    const url = googleOauthUrl + params.toString();
    const response: ApiResponse<{ url: string }> = {
      status: true,
      message: "Google oauth2 url retrived successfully.",
      data: {
        url,
      },
    };
    logger.info(`Google Oauth prompt url requested for: ${path.split("/")[3]}`);

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// GOOGLE OAUTH SIGN UP
export const googleSignupFallback = async (
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
      "register"
    );

    // check if user already exist else create new user
    const user: UserDocument | null = await User.findOne({
      email: payload.email,
    });
    if (user) {
      return res
        .status(301)
        .redirect(`${env.FRONTEND_LOGIN_URL}?error=user_exist`);
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

    res.cookie("token", token, env.LOGIN_COOKIE_OPTS);

    res.status(301).redirect(`${env.FRONTEND_URL}`);
  } catch (error) {
    if (error instanceof AppError) return next(error);
    logger.error(
      "An error occur while user is signing up using google oauth2.",
      error
    );
    res
      .status(301)
      .redirect(`${env.FRONTEND_SIGNUP_URL}?error=unexpected_error`);
  }
};

// GOOGLE OAUTH LOGIN CONTROLLER
export const googleLoginFallback = async (
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
