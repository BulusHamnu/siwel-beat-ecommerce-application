import express, { Router } from "express";
import requiredAuth from "../middlewares/requiredAuth.js";
import allowRole from "../middlewares/allowRole.js";
import { checkOut } from "../controllers/checkout.controller.js";
import requiredVerifiedEmail from "../middlewares/requiredVerifiedEmail.js";
import rateLimiter from "../middlewares/rateLimiter.js";

const router = Router();

router.use(requiredAuth);
router.use(rateLimiter(20, 15 * 60 * 1000));
router.use(allowRole("user"));
router.use(requiredVerifiedEmail);

router.post("/", checkOut);

export default router;
