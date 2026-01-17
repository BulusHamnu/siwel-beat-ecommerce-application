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
    const accessToken: string | undefined =
      req.headers["authorization"]?.split(" ")[1];
    if (!accessToken)
      throw new AppError("Missing authorization token", 401, true);

    const payload = jwt.verify(accessToken, env.TOKEN_SECRET) as userPayload;
    if (payload.type !== "accessToken")
      throw new AppError("Invalid token, Unauthorized.", 401, true);

    req.user = payload;
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
