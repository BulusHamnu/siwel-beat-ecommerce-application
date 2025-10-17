import express, { Router } from "express";
import type { Express, Request, Response } from "express";
import signUpController from "../../controllers/auths/signupController.js";

const router = Router();

router.get("/auth/register", signUpController);

export default router;
