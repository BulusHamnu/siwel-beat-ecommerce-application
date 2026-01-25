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

const rateLimiter = (limit: number, window: number) => {
  return limiter({
    windowMs: window,
    limit,
    standardHeaders: false,
    handler: (req: Request, res: Response, next: NextFunction) => {
      logger.warn("Too many requests", { identity: req.user?.id || req.ip });
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
  });
};

export default rateLimiter;
// Auth routes rate limiter
export const authSecurityLimiter = rateLimiter(5, 15 * 60 * 1000);
// Refresh token rate limiter
export const refTokenLimiter = rateLimiter(30, 10 * 60 * 1000);
// Contact me form rate limiter
export const contactMeLimiter = rateLimiter(5, 15 * 60 * 1000);
// Newsletter rate limiter
export const newsLetterLimiter = rateLimiter(5, 15 * 60 * 1000);
// Checkout route rate limiter
export const checkoutLimiter = rateLimiter(20, 15 * 60 * 1000);
// General GET and GET all route rate limiter
export const generalApiLimiter = rateLimiter(100, 10 * 60 * 1000);
// PATCH AND POST route rate limiter
export const creationApiLimiter = rateLimiter(30, 10 * 60 * 1000);
// Upload user avatar rate limiter
export const uploadAvatarLimiter = rateLimiter(30, 10 * 60 * 1000);
// Download track file limiter
export const downloadTrackFileLimiter = rateLimiter(30, 10 * 60 * 1000);
