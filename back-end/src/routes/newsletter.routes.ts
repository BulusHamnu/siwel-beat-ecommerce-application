import express, { Router } from "express";
import * as newsLetterController from "../controllers/newsletter.controller.js";

const router = Router();

// routes
router.post(
  "/news-letter/subscribe",
  newsLetterController.subscribeToNewletter
);
router.get(
  "/news-letter/unsubscribe",
  newsLetterController.unsubscribeToNewletter
);

export default router;
