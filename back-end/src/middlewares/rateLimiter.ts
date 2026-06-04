import limiter, { ipKeyGenerator } from "express-rate-limit";
import type { Request, Response, NextFunction } from "express";
import AppError, { ErrorCodes } from "../errors/appError.js";
import logger from "../utils/logger.js";

function getIdentifer(req: Request) {
  if (req.user) return req.user.id;
  // Read X-Forwarded-For to get correct client ip because server can be behind proxy/load-banlancer
  // const trueIp =
  const forwardedIp = req.headers["x-forwarded-for"];
  if (forwardedIp) {
    logger.info(`X-Forwarded-For: ${forwardedIp}`);
    return typeof forwardedIp === "string"
      ? forwardedIp.split(",")[0]!.trim()
      : forwardedIp[0]!.split(",")[0]!.trim();
  } else {
    return ipKeyGenerator(req.ip as string);
  }
}

const limitOpts = {
  standardHeaders: false,
  handler: (req: Request, res: Response, next: NextFunction) => {
    logger.debug("Too many requests", { identity: req.user?.id || req.ip });

    next(
      new AppError(
        ErrorCodes.RATE_LIMIT_EXCEEDED,
        "Too many requests, please try again later.",
        429,
        true,
        null,
      ),
    );
  },
  keyGenerator: (req: Request, res: Response) => {
    return getIdentifer(req);
  },
};

const rateLimiter = (limit: number, window: number) => {
  return limiter({ ...limitOpts, windowMs: window, limit });
};

export default rateLimiter;

// General GET and GET all endpoint rate limiter
export const generalApiLimiter = () => {
  return limiter({ ...limitOpts, limit: 200, windowMs: 10 * 60 * 1000 });
};

// PATCH AND POST endpoint rate limiter
export const creationApiLimiter = () => {
  return limiter({ ...limitOpts, limit: 30, windowMs: 10 * 60 * 1000 });
};
