import { Router } from "express";
import requiredAuth from "../middlewares/requiredAuth.js";
import * as authController from "../controllers/auths/auth.controller.js";
import * as googleAuthController from "../controllers/auths/google-auth.controller.js";
import rateLimiter from "../middlewares/rateLimiter.js";

const router = Router();

router.post(
  "/refresh-token",
  rateLimiter(30, 10 * 60 * 1000),
  authController.refreshToken,
);

router.post("/log-out", authController.logout);

/* Google oauth callback */
router.get("/oauth/google/callback", googleAuthController.googleCallback);

router.post(
  "/register",
  rateLimiter(10, 15 * 60 * 1000),
  authController.signUp,
);

router.post("/login", rateLimiter(10, 15 * 60 * 1000), authController.logIn);

router.post(
  "/verify-email",
  rateLimiter(5, 15 * 60 * 1000),
  authController.verifyEmail,
);

router.post(
  "/resend-verification-email",
  rateLimiter(5, 15 * 60 * 1000),
  requiredAuth,
  authController.resendVeficationEmail,
);

router.post(
  "/forget-password",
  rateLimiter(10, 15 * 60 * 1000),
  authController.forgetPassword,
);

router.post(
  "/verify-password-otp-code",
  rateLimiter(10, 15 * 60 * 1000),
  authController.verifyResetPasswordOtp,
);

router.post(
  "/reset-password",
  rateLimiter(10, 15 * 60 * 1000),
  authController.resetpassword,
);

/* Google 0auth2 endpoints */
router.get("/oauth/google", googleAuthController.getGoogleOauthUrl);

export default router;
