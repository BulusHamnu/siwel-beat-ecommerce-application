import express, { Router } from "express";
import withAuth from "../middlewares/withAuth.js";
import allowRole from "../middlewares/allowRole.js";
import { checkOutController } from "../controllers/checkout.controller.js";

const router = Router();

router.post(
  "/checkout/summary",
  withAuth,
  allowRole("user"),
  checkOutController
);

export default router;
