import express, { Router } from "express";
import withAuth from "../middlewares/withAuth.js";
import * as authController from "../controllers/auths/auth.controller.js";
import * as googleAuthController from "../controllers/auths/google-auth.controller.js";

const router = Router();

router.post("/auth/register", authController.signUpController);
router.post("/auth/login", authController.logInController);
router.post("/auth/verify-email", authController.verifyEmailController);
router.post(
  "/auth/resend-verification-email",
  withAuth,
  authController.resendVeficationEmailController
);
router.post("/auth/forget-password", authController.forgetPasswordController);
router.post(
  "/auth/verify-reset-code",
  authController.verifyResetCodeController
);
router.post("/auth/reset-password", authController.resetpasswordController);
router.post("/auth/log-out", withAuth, authController.logoutController);

/* Google 0auth2 endpoints */
router.get(
  "/auth/google/register",
  googleAuthController.getGoogleOauthUrlController
);
router.get(
  "/auth/google/register-fallback",
  googleAuthController.googleSignupFallback
);
router.get(
  "/auth/google/login",
  googleAuthController.getGoogleOauthUrlController
);
router.get(
  "/auth/google/login-fallback",
  googleAuthController.googleLoginFallback
);

export default router;
