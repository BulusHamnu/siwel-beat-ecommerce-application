import express, { Router } from "express";
import {
  getProfileController,
  updateProfileController,
} from "../controllers/profile.controllers.js";
import withAuth from "../middlewares/withAuth.js";
import allowRole from "../middlewares/allowRole.js";

const router = Router();

// routes
router.get("/users/me", withAuth, allowRole("user"), getProfileController);
router.patch("/users/me", withAuth, allowRole("user"), updateProfileController);

export default router;
