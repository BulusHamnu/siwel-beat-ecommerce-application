import express, { Router } from "express";
import signUpController from "../../controllers/auths/signupController.js";
import logInController from "../../controllers/auths/loginController.js";
import verifyEmailController from "../../controllers/auths/verifyEmailController.js";
import resendVeficationEmail from "../../controllers/auths/resendVerification.js";

const router = Router();

router.post("/auth/register", signUpController);
router.post("/auth/login", logInController);
router.post("/auth/verify-email", verifyEmailController);
router.post("/auth/resend-verification-email", resendVeficationEmail);

export default router;
