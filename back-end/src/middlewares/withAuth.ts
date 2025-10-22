import type { Response, Request, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import env from "../configs/env.js";
import AppError from "../errors/appError.js";
import type { Payload } from "../types/express.js";

export interface userPayload extends JwtPayload, Payload {}

const withAuth = async (
  req: Request<{}, {}, {}, {}>,
  res: Response<{}>,
  next: NextFunction
): Promise<void> => {
  try {
    const token: string = req.cookies.token;

    if (!token) throw new AppError("Missing authorization token", 401, true);
    const user = jwt.verify(token, env.SECRET_KEY) as userPayload;

    if (!user)
      throw new AppError("Invalid or expired token. Unauthorized.", 401, true);

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

export default withAuth;
