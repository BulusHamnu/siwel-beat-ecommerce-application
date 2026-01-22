import { Router } from "express";
import withAuth from "../middlewares/withAuth.js";
import * as authController from "../controllers/auths/auth.controller.js";
import * as googleAuthController from "../controllers/auths/google-auth.controller.js";
import {
  authSecurityLimiter,
  refTokenLimiter,
} from "../middlewares/rateLimiter.js";

const router = Router();

router.post("/register", authSecurityLimiter, authController.signUp);
router.post("/login", authSecurityLimiter, authController.logIn);
router.post("/verify-email", authSecurityLimiter, authController.verifyEmail);
router.post(
  "/resend-verification-email",
  withAuth,
  authSecurityLimiter,
  authController.resendVeficationEmail
);
router.post(
  "/forget-password",
  authSecurityLimiter,
  authController.forgetPassword
);
router.post(
  "/verify-reset-code",
  authSecurityLimiter,
  authController.verifyResetCode
);
router.post(
  "/reset-password",
  authSecurityLimiter,
  authController.resetpassword
);
router.post("/refresh-token", refTokenLimiter, authController.refreshToken);
router.post("/log-out", authController.logout);

/* Google 0auth2 endpoints */
router.get(
  "/oauth/google",
  authSecurityLimiter,
  googleAuthController.getGoogleOauthUrl
);
router.get("/oauth/google/callback", googleAuthController.googleCallback);

export default router;
