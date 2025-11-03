import express, { Router } from "express";
import {
  signUpController,
  logInController,
  verifyEmailController,
  resendVeficationEmailController,
  forgetPasswordController,
  resetpasswordController,
  logoutController,
  googleSignupFallback,
  getGoogleOauthUrlController,
  googleLoginFallback,
  verifyResetCodeController,
} from "../controllers/auth.controllers.js";
import withAuth from "../middlewares/withAuth.js";

const router = Router();

router.post("/auth/register", signUpController);
router.post("/auth/login", logInController);
router.post("/auth/verify-email", verifyEmailController);
router.post(
  "/auth/resend-verification-email",
  withAuth,
  resendVeficationEmailController
);
router.post("/auth/forget-password", forgetPasswordController);
router.post("/auth/verify-reset-code", verifyResetCodeController);
router.post("/auth/reset-password", resetpasswordController);
router.post("/auth/log-out", withAuth, logoutController);

// google auth endpoint
router.get("/auth/google/register", getGoogleOauthUrlController);
router.get("/auth/google/register-fallback", googleSignupFallback);
router.get("/auth/google/login", getGoogleOauthUrlController);
router.get("/auth/google/login-fallback", googleLoginFallback);

export default router;
