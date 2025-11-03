import { Router } from "express";
import {
  postTrackController,
  getTracksController,
  getTrackController,
  deactivateTrack,
  activateTrack,
  updateTrackController,
} from "../controllers/track.controllers.js";
import withAuth from "../middlewares/withAuth.js";
import allowRole from "../middlewares/allowRole.js";
import upload from "../middlewares/upload.js";

const router = Router();

//routes
router.post(
  "/tracks",
  // withAuth,
  // allowRole("admin"),
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
router.patch(
  "/tracks/:id",
  /* withAuth,
  allowRole("admin"), */
  upload,
  updateTrackController
);

// Track activate and deactivate
router.post(
  "/tracks/:id/activate",
  withAuth,
  allowRole("admin"),
  activateTrack
);
router.post(
  "/tracks/:id/deactivate",
  withAuth,
  allowRole("admin"),
  deactivateTrack
);

export default router;
