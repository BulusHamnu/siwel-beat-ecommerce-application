import express, { Router } from "express";
import getProfile from "../controllers/profile/getProfileController.js";
import updateProfile from "../controllers/profile/updateProfileController.js";
import withAuth from "../middlewares/withAuth.js";

const router = Router();

// routes
router.get("/users/me", withAuth, getProfile);
router.patch("/users/me", withAuth, updateProfile);

export default router;
