import { Router } from "express";
import { contactme } from "../controllers/public.apis.controller.js";

const router = Router();

// routes
router.post("/contact-me", contactme);

export default router;
