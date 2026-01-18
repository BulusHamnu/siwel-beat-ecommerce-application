import type { Request, Response, NextFunction } from "express";
import AppError from "../errors/appError.js";

const requiredVerifiedEmail = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (!user) {
    return next(new AppError("Not authenticated", 401, true));
  }
  if (!user.isVerified)
    return next(new AppError("Email not verified", 403, true));

  next();
};

export default requiredVerifiedEmail;
