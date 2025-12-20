import express, { Router } from "express";
import withAuth from "../middlewares/withAuth.js";
import authControllers from "../controllers/auths/auth.controllers.js";
import googleAuthControllers from "../controllers/auths/google-auth.controller.js";

const router = Router();

router.post("/auth/register", authControllers.signUpController);
router.post("/auth/login", authControllers.logInController);
router.post("/auth/verify-email", authControllers.verifyEmailController);
router.post(
  "/auth/resend-verification-email",
  withAuth,
  authControllers.resendVeficationEmailController
);
router.post("/auth/forget-password", authControllers.forgetPasswordController);
router.post(
  "/auth/verify-reset-code",
  authControllers.verifyResetCodeController
);
router.post("/auth/reset-password", authControllers.resetpasswordController);
router.post("/auth/log-out", withAuth, authControllers.logoutController);

/* Google 0auth2 endpoints */
router.get(
  "/auth/google/register",
  googleAuthControllers.getGoogleOauthUrlController
);
router.get(
  "/auth/google/register-fallback",
  googleAuthControllers.googleSignupFallback
);
router.get(
  "/auth/google/login",
  googleAuthControllers.getGoogleOauthUrlController
);
router.get(
  "/auth/google/login-fallback",
  googleAuthControllers.googleLoginFallback
);

export default router;
