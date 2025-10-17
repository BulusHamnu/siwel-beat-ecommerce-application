import express, { Router } from "express";
import signUpController from "../../controllers/auths/signupController.js";
import logInController from "../../controllers/auths/loginController.js";

const router = Router();

router.post("/auth/register", signUpController);
router.post("/auth/login", logInController);

export default router;
