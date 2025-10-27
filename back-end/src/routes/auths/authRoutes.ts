import express, { Router } from "express";
import signUpController from "../../controllers/auths/signupController.js";
import logInController from "../../controllers/auths/loginController.js";
import verifyEmailController from "../../controllers/auths/verifyEmailController.js";
import resendVeficationEmail from "../../controllers/auths/resendVerification.js";
import forgetPassword from "../../controllers/auths/forgetPasswordController.js";
import verifyResetCode from "../../controllers/auths/verifyResetCode.js";
import resetpasswordController from "../../controllers/auths/resetPassword.js";
import logoutController from "../../controllers/auths/logoutController.js";
import withAuth from "../../middlewares/withAuth.js";
import googleSignupFallback from "../../controllers/auths/googleSignup.js";
import getGoogleOauthUrlController from "../../controllers/auths/getGoogleOauthUrl.js";
import googleLoginFallback from "../../controllers/auths/googleLogin.js";

const router = Router();

router.post("/auth/register", signUpController);
router.post("/auth/login", logInController);
router.post("/auth/verify-email", verifyEmailController);
router.post("/auth/resend-verification-email", withAuth, resendVeficationEmail);
router.post("/auth/forget-password", forgetPassword);
router.post("/auth/verify-reset-code", verifyResetCode);
router.post("/auth/reset-password", resetpasswordController);
router.post("/auth/log-out", withAuth, logoutController);

// google auth endpoint
router.get("/auth/google/register", getGoogleOauthUrlController);
router.get("/auth/google/register-fallback", googleSignupFallback);
router.get("/auth/google/login", getGoogleOauthUrlController);
router.get("/auth/google/login-fallback", googleLoginFallback);

export default router;
