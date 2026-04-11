import type { Response, Request, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import env from "../configs/env.js";
import AppError, { ErrorCodes } from "../errors/appError.js";
import type { Payload } from "../types/express.js";
import User from "../models/user.schema.js";

export interface userPayload extends JwtPayload, Payload {}

export async function verifyAuthAndAttachUser(
  accessToken: string,
): Promise<userPayload> {
  try {
    const payload = jwt.verify(accessToken, env.TOKEN_SECRET) as userPayload;

    if (payload.type !== "accessToken")
      throw new AppError(
        ErrorCodes.AUTH_TOKEN_INVALID,
        "Invalid token, Unauthorized.",
        401,
        true,
        null,
      );

    const user = await User.findOne({ _id: payload.id });
    if (!user)
      throw new AppError(
        ErrorCodes.USER_NOT_FOUND,
        "User not found",
        404,
        true,
        null,
      );

    // Re-assign isActive and inVerified because they can change at any time.
    return {
      ...payload,
      isVerified: user.isVerified,
      isActive: user.isActive,
    };
  } catch (error) {
    //
    if (error instanceof Error && error.name.includes("TokenExpiredError")) {
      throw new AppError(
        ErrorCodes.UNAUTHORIZED,
        "Expired token, Unauthorized.",
        401,
        true,
        {
          code: ErrorCodes.UNAUTHORIZED,
          details: null,
        },
      );
    }
    //
    if (error instanceof Error && error.name.includes("JsonWebTokenError")) {
      throw new AppError(
        ErrorCodes.UNAUTHORIZED,
        "Invalid token, Unauthorized.",
        401,
        true,
        {
          code: ErrorCodes.UNAUTHORIZED,
          details: null,
        },
      );
    }

    throw error;
  }
}

const requiredAuth = async (
  req: Request<{}, {}, {}, {}>,
  res: Response<{}>,
  next: NextFunction,
): Promise<any> => {
  try {
    const accessToken = req.headers["authorization"]?.split(" ")[1];
    if (!accessToken)
      throw new AppError(
        ErrorCodes.AUTH_TOKEN_REQUIRED,
        "Missing authorization token",
        401,
        true,
        null,
      );

    const user = await verifyAuthAndAttachUser(accessToken);
    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

export default requiredAuth;
