import type { Response, Request, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import env from "../configs/env.js";
import AppError from "../errors/appError.js";
import type { Payload } from "../types/express.js";
import User from "../models/user.schema.js";

export interface userPayload extends JwtPayload, Payload {}

const withAuth = async (
  req: Request<{}, {}, {}, {}>,
  res: Response<{}>,
  next: NextFunction
): Promise<any> => {
  try {
    const accessToken = req.headers["authorization"]?.split(" ")[1];
    if (!accessToken)
      throw new AppError("Missing authorization token", 401, true);

    const payload = jwt.verify(accessToken, env.TOKEN_SECRET) as userPayload;
    if (payload.type !== "accessToken")
      throw new AppError("Invalid token, Unauthorized.", 401, true);

    const user = await User.findOne({ _id: payload.id });
    if (!user) throw new AppError("User not found", 404, true);

    // Re-assign isActive and inVerified because they can change at any time.
    req.user = {
      ...payload,
      isVerified: user.isVerified,
      isActive: user.isActive,
    };

    next();
  } catch (error) {
    // check if error is from json-web-token
    if (error instanceof Error && error.name.includes("TokenExpiredError")) {
      return res
        .status(401)
        .json({ status: false, message: "Expired token, Unauthorized." });
    }
    //
    if (error instanceof Error && error.name.includes("JsonWebTokenError")) {
      return res
        .status(401)
        .json({ status: false, message: "Invalid token, Unauthorized." });
    }

    next(error);
  }
};

export default withAuth;
