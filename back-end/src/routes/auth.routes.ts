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

router.use(rateLimiter(10, 15 * 60 * 1000)); // Protect all risky auth routes
router.post("/register", authController.signUp);
router.post("/login", authController.logIn);
router.post("/verify-email", authController.verifyEmail);
router.post(
  "/resend-verification-email",
  requiredAuth,
  authController.resendVeficationEmail,
);
router.post("/forget-password", authController.forgetPassword);
router.post("/verify-password-otp-code", authController.verifyResetPasswordOtp);
router.post("/reset-password", authController.resetpassword);

/* Google 0auth2 endpoints */
router.get("/oauth/google", googleAuthController.getGoogleOauthUrl);

export default router;
