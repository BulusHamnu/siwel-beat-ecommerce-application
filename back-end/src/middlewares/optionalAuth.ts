import { verifyAuthAndAttachUser } from "./requiredAuth.js";
import type { Response, Request, NextFunction } from "express";
import AppError, { ErrorCodes } from "../errors/appError.js";

/* Optional auth middleware */
async function optionalAuth(
  req: Request<{}, {}, {}, {}>,
  res: Response<{}>,
  next: NextFunction,
) {
  try {
    const accessToken = req.headers["authorization"]?.split(" ")[1];
    if (!accessToken) return next();

    const user = await verifyAuthAndAttachUser(accessToken);
    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
}

export default optionalAuth;
