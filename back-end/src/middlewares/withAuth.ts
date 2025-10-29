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
): Promise<any> => {
  try {
    const token: string = req.cookies.token;

    if (!token) throw new AppError("Missing authorization token", 401, true);
    const user = jwt.verify(token, env.SECRET_KEY) as userPayload;

    req.user = user;

    next();
  } catch (error) {
    // check if error is from json-web-token
    if (error instanceof Error && error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ status: false, message: "Invalid token, Unauthorized." });
    }
    if (error instanceof Error && error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ status: false, message: "Expired token, Unauthorized." });
    }

    next(error);
  }
};

export default withAuth;
