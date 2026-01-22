import { Router } from "express";
import { contactme } from "../controllers/public.apis.controller.js";
import { contactMeLimiter } from "../middlewares/rateLimiter.js";

const router = Router();
// routes
router.post("/", contactMeLimiter, contactme);

export default router;
