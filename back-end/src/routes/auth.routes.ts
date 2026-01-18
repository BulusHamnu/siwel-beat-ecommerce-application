import express, { Router } from "express";
import withAuth from "../middlewares/withAuth.js";
import * as authController from "../controllers/auths/auth.controller.js";
import * as googleAuthController from "../controllers/auths/google-auth.controller.js";

const router = Router();

router.post("/register", authController.signUp);
router.post("/login", authController.logIn);
router.post("/refresh-token", authController.refreshToken);
router.post("/verify-email", authController.verifyEmail);
router.post(
  "/resend-verification-email",
  withAuth,
  authController.resendVeficationEmail
);
router.post("/forget-password", authController.forgetPassword);
router.post("/verify-reset-code", authController.verifyResetCode);
router.post("/reset-password", authController.resetpassword);
router.post("/log-out", authController.logout);

/* Google 0auth2 endpoints */
router.get("/oauth/google/callback", googleAuthController.googleCallback);
router.get("/oauth/google", googleAuthController.getGoogleOauthUrl);

export default router;
