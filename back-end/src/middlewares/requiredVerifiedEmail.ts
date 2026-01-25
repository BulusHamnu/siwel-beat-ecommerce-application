import type { Request, Response, NextFunction } from "express";
import AppError, { ErrorCodes } from "../errors/appError.js";

const requiredVerifiedEmail = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = req.user;
  if (!user) {
    return next(
      new AppError(
        ErrorCodes.UNAUTHENTICATED,
        "Not authenticated",
        401,
        true,
        null,
      ),
    );
  }
  if (!user.isVerified)
    return next(
      new AppError(
        ErrorCodes.EMAIL_NOT_VERIFIED,
        "Email not verified",
        403,
        true,
        null,
      ),
    );

  next();
};

export default requiredVerifiedEmail;
