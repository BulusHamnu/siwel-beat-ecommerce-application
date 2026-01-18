import express, { Router } from "express";
import withAuth from "../middlewares/withAuth.js";
import allowRole from "../middlewares/allowRole.js";
import { checkOut } from "../controllers/checkout.controller.js";
import requiredVerifiedEmail from "../middlewares/requiredVerifiedEmail.js";

const router = Router();

router.use(withAuth);
router.use(allowRole("user"));
router.use(requiredVerifiedEmail);

router.post("/summary", checkOut);

export default router;
