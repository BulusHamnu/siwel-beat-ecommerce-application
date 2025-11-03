import { Router } from "express";
import {
  postTrackController,
  getTracksController,
  getTrackController,
} from "../controllers/track.controllers.js";
import withAuth from "../middlewares/withAuth.js";
import allowRole from "../middlewares/allowRole.js";
import upload from "../middlewares/upload.js";

const router = Router();

//routes
router.post(
  "/tracks",
  withAuth,
  allowRole("admin"),
  upload,
  postTrackController
);
router.get(
  "/tracks",
  withAuth,
  allowRole("admin", "user"),
  getTracksController
);
router.get(
  "/tracks/:id",
  withAuth,
  allowRole("admin", "user"),
  getTrackController
);

export default router;
