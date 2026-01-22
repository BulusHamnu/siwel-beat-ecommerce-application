import { Router } from "express";
import * as newsLetterController from "../controllers/newsletter.controller.js";
import { newsLetterLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

// routes
router.post(
  "/subscribe",
  newsLetterLimiter,
  newsLetterController.subscribeToNewletter
);
router.get(
  "/unsubscribe",
  newsLetterLimiter,
  newsLetterController.unsubscribeToNewletter
);

export default router;
