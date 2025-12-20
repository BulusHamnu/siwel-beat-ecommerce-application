import type { Response, Request, NextFunction } from "express";
import logger from "../../utils/logger.js";
import type { createUserBody } from "../userTypes.js";
import * as authService from "../../services/auth.service.js";
import { type LoginReturnType } from "../../services/auth.service.js";
import type { ApiResponse } from "../responseInterface.js";
import env from "../../configs/env.js";

/* Sign up new user controller */
export const signUpController = async (
  req: Request<{}, {}, createUserBody, {}>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userData: createUserBody = req.body;
    const newUser = await authService.createNewUser(userData);
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

/* Login controller */
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
    const result = await authService.loginUser(password, email);

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

/* Verify email controller */
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

/* Resend verification email controller */
export const resendVeficationEmailController = async (
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

/* Forget password controller */
export const forgetPasswordController = async (
  req: Request<{}, { status: false; message: string }, { email: string }, {}>,
  res: Response<{ status: boolean; message: string }>,
  next: NextFunction
): Promise<void> => {
  try {
    const userEmail: string = req.body.email;
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

/* Verify password reset code controller */
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

    await authService.verifyResetCode(email, code);
    const response: ApiResponse<void> = {
      status: true,
      message: "Code is valid.",
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Reset password controller */
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
    await authService.resetPassword(email, password);
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
