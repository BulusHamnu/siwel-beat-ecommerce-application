import express, { Router } from "express";
import getProfile from "../controllers/profile/getProfileController.js";
import updateProfile from "../controllers/profile/updateProfileController.js";
import withAuth from "../middlewares/withAuth.js";
import allowRole from "../middlewares/allowRole.js";

const router = Router();

// routes
router.get("/users/me", withAuth, allowRole("user"), getProfile);
router.patch("/users/me", withAuth, allowRole("user"), updateProfile);

export default router;
