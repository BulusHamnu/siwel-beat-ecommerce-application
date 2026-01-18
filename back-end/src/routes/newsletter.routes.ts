import express, { Router } from "express";
import * as newsLetterController from "../controllers/newsletter.controller.js";

const router = Router();

// routes
router.post("/subscribe", newsLetterController.subscribeToNewletter);
router.get("/unsubscribe", newsLetterController.unsubscribeToNewletter);

export default router;
