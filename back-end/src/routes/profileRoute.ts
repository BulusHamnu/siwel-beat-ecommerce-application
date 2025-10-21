import express, { Router } from "express";
import getProfile from "../controllers/profile/getProfileController.js";
import updateProfile from "../controllers/profile/updateProfileController.js";

const router = Router();

// routes
router.get("/users/me", getProfile);
router.patch("/users/me", updateProfile);

export default router;
