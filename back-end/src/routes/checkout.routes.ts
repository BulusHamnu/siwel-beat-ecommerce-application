import express, { Router } from "express";
import withAuth from "../middlewares/withAuth.js";
import allowRole from "../middlewares/allowRole.js";
import { checkOut } from "../controllers/checkout.controller.js";

const router = Router();

router.post("/checkout/summary", withAuth, allowRole("user"), checkOut);

export default router;
