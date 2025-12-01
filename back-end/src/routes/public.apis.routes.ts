import express, { Router } from "express";
import { contactmeController } from "../controllers/public.apis.controller.js";

const router = Router();

// routes
router.post("/contact-me", contactmeController);

export default router;
