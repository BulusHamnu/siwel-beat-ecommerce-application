import express, { Router } from "express";
import {
  subscribeToNewletterController,
  unsubscribeToNewletterController,
} from "../controllers/newsletter.controller.js";

const router = Router();

// routes
router.post("/news-letter/subscribe", subscribeToNewletterController);
router.get("/news-letter/unsubscribe", unsubscribeToNewletterController);

export default router;
