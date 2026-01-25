import { Router } from "express";
import { contactme } from "../controllers/public.apis.controller.js";
import rateLimiter from "../middlewares/rateLimiter.js";

const router = Router();
// routes
router.post("/", rateLimiter(5, 15 * 60 * 1000), contactme);

export default router;
