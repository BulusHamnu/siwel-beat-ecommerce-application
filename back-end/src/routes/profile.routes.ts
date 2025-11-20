import express, { Router } from "express";
import {
  getProfileController,
  updateProfileController,
  updateProfilePictureController,
} from "../controllers/profile.controllers.js";
import withAuth from "../middlewares/withAuth.js";
import allowRole from "../middlewares/allowRole.js";
import { uploadPicture } from "../middlewares/upload.js";

const router = Router();

// routes
router.get("/users/me", withAuth, allowRole("user"), getProfileController);
router.patch("/users/me", withAuth, allowRole("user"), updateProfileController);
router.patch(
  "/users/me/picture",
  uploadPicture,
  withAuth,
  allowRole("user"),
  updateProfilePictureController
);

export default router;
