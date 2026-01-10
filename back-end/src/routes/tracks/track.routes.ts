import { Router } from "express";
import * as trackController from "../../controllers/tracks/track.controller.js";
import withAuth from "../../middlewares/withAuth.js";
import allowRole from "../../middlewares/allowRole.js";
import upload from "../../middlewares/upload.js";
import commentRoutes from "./trackComments.routes.js";

const router = Router();

/* Track routes */
router.post(
  "/tracks",
  withAuth,
  allowRole("admin"),
  upload,
  trackController.postTrack
);
router.get("/tracks", trackController.getTracks);
router.get("/tracks/:id", trackController.getTrack);
router.patch(
  "/tracks/:id",
  withAuth,
  allowRole("admin"),
  upload,
  trackController.updateTrack
);

router.post(
  "/tracks/:id/activate",
  withAuth,
  allowRole("admin"),
  trackController.activateTrack
);
router.post(
  "/tracks/:id/deactivate",
  withAuth,
  allowRole("admin"),
  trackController.deactivateTrack
);

/* Comment routes */
router.use("/tracks/", commentRoutes);

/* Download routes*/
router.get(
  "/tracks/:id/download-file",
  withAuth,
  allowRole("user", "admin"),
  trackController.downloadTrackFile
);

/* Play track */
router.get("/tracks/:id/play", trackController.playTrack);

export default router;
