import { Router } from "express";
import * as newsLetterController from "../controllers/newsletter.controller.js";
import rateLimiter from "../middlewares/rateLimiter.js";

const router = Router();
router.use(rateLimiter(6, 15 * 60 * 1000));

// routes
router.post("/subscribe", newsLetterController.subscribeToNewletter);
router.get("/unsubscribe", newsLetterController.unsubscribeToNewletter);

export default router;
