import type { Response, Request, NextFunction } from "express";
import logger from "../../utils/logger.js";
import type { CreateUserBody } from "../userTypes.js";
import * as authService from "../../services/auth.service.js";
import type { ApiResponse } from "../responseInterface.js";
import env from "../../configs/env.js";
import * as authValidator from "../../utils/validators/auth.validator.js";
import validateAndSanitizeBody from "../../utils/validators/validateAndSanitize.js";
import AppError from "../../errors/appError.js";
import User from "../../models/user.schema.js";

/* Sign up new user */
export const signUp = async (
  req: Request<{}, {}, CreateUserBody, {}>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cleanSignupBody: CreateUserBody = validateAndSanitizeBody(
      req.body,
      authValidator.signupBodySchema
    );

    const newUser = await authService.createNewUser(cleanSignupBody);
    logger.info("User created successully!", { userId: newUser._id });

    const response: ApiResponse<void> = {
      status: true,
      message: "User created successfully, you can now log in.",
    };

    res.status(201).json(response);
  } catch (error: unknown) {
    next(error);
  }
};

/* Login  */
interface loginBody {
  email: string;
  password: string;
}

interface LoginReturnType {
  accessToken: string;
  user: authService.UserLoginSnaphot;
}

export const logIn = async (
  req: Request<{}, ApiResponse<LoginReturnType>, loginBody, {}>,
  res: Response<ApiResponse<LoginReturnType>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password }: loginBody = validateAndSanitizeBody(
      req.body,
      authValidator.loginBodySchema
    );

    const deviceInfo = req.headers["user-agent"] || "Unidentified";
    const { accessToken, user, refreshToken } = await authService.loginUser(
      password.normalize("NFC"),
      email,
      deviceInfo
    );

    res.cookie("refreshToken", refreshToken, env.LOGIN_COOKIE_OPTS);
    const response: ApiResponse<LoginReturnType> = {
      status: true,
      message: "Login successully!",
      data: { user, accessToken },
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Refresh token */
export const refreshToken = async (
  req: Request<{}, ApiResponse<{ accessToken: string }>, {}, {}>,
  res: Response<ApiResponse<{ accessToken: string }>>,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) throw new AppError("Missing refresh token.", 401, true);

    const accessToken = await authService.refreshToken(refreshToken);

    const response: ApiResponse<{ accessToken: string }> = {
      status: true,
      message: "Access token",
      data: { accessToken },
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Verify email  */
interface emailVerificationBody {
  email: string;
  code: string;
}

export const verifyEmail = async (
  req: Request<{}, ApiResponse<void>, { email: string; code: string }, {}>,
  res: Response<ApiResponse<void>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, code }: emailVerificationBody = validateAndSanitizeBody(
      req.body,
      authValidator.emailAndCodeBodySchema
    );

    await authService.verifyEmail(email, code);

    const response: ApiResponse<void> = {
      status: true,
      message: "Email verified successfully.",
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    next(error);
  }
};

/* Resend verification email  */
export const resendVeficationEmail = async (
  req: Request<{}, { status: boolean; message: string }, {}, {}>,
  res: Response<{ status: boolean; message: string }>,
  next: NextFunction
): Promise<void> => {
  try {
    const email: string | undefined = req.user?.email;

    await authService.resendVerificationEmail(email || "");
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

/* Forget password  */
export const forgetPassword = async (
  req: Request<{}, { status: false; message: string }, { email: string }, {}>,
  res: Response<{ status: boolean; message: string }>,
  next: NextFunction
): Promise<void> => {
  try {
    const email = req.body.email;
    const userEmail: string = validateAndSanitizeBody(
      email,
      authValidator.validateEmail
    );

    await authService.forgetPassword(userEmail);
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

/* Verify password reset code  */
export const verifyResetCode = async (
  req: Request<
    {},
    ApiResponse<{ resetToken: string }>,
    { code: string; email: string },
    {}
  >,
  res: Response<ApiResponse<{ resetToken: string }>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, code } = validateAndSanitizeBody(
      req.body,
      authValidator.emailAndCodeBodySchema
    );

    const { resetToken } = await authService.verifyResetCode(email, code);
    const response: ApiResponse<{ resetToken: string }> = {
      status: true,
      message: "Code is valid.",
      data: { resetToken },
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Reset password  */
interface resetPasswordBody {
  email: string;
  password: string;
  resetToken: string;
}

export const resetpassword = async (
  req: Request<{}, ApiResponse<void>, resetPasswordBody, {}>,
  res: Response<ApiResponse<void>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, resetToken }: resetPasswordBody =
      validateAndSanitizeBody(req.body, authValidator.resetPasswordBodySchema);

    await authService.resetPassword(email, password, resetToken);
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

/* Log out controller */
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    await User.updateOne(
      { "sessions.refreshToken": refreshToken },
      { $pull: { sessions: { refreshToken } } }
    );

    res.cookie("refreshToken", "", env.LOGIN_COOKIE_OPTS);
    const response: ApiResponse<void> = {
      status: true,
      message: "Logout successully.",
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
