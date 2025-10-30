import express, { Router } from "express";
import registerController from "../controllers/admin/registerController.js";

const router = Router();

// routes
router.post("/auth/admin/register", registerController);

export default router;
