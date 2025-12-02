import express, { Router } from "express";
import {
  getProfileController,
  updateProfileController,
  updateProfilePictureController,
  getUsersFavourites,
  addUsersFavourites,
  removeFromUsersFavourites,
} from "../controllers/users.controllers.js";
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
router.post(
  "/users/me/favourites",
  withAuth,
  allowRole("user"),
  addUsersFavourites
);
router.get(
  "/users/me/favourites",
  withAuth,
  allowRole("user"),
  getUsersFavourites
);
router.delete(
  "/users/me/favourites",
  withAuth,
  allowRole("user"),
  removeFromUsersFavourites
);

export default router;
