import express, { Router } from "express";
import withAuth from "../middlewares/withAuth.js";
import * as authController from "../controllers/auths/auth.controller.js";
import * as googleAuthController from "../controllers/auths/google-auth.controller.js";

const router = Router();

router.post("/auth/register", authController.signUp);
router.post("/auth/login", authController.logIn);
router.post("/auth/refresh-token", authController.refreshToken);
router.post("/auth/verify-email", authController.verifyEmail);
router.post(
  "/auth/resend-verification-email",
  withAuth,
  authController.resendVeficationEmail
);
router.post("/auth/forget-password", authController.forgetPassword);
router.post("/auth/verify-reset-code", authController.verifyResetCode);
router.post("/auth/reset-password", authController.resetpassword);
router.post("/auth/log-out", authController.logout);

/* Google 0auth2 endpoints */
router.get("/oauth/google/callback", googleAuthController.googleCallback);
router.get("/oauth/google", googleAuthController.getGoogleOauthUrl);

export default router;
