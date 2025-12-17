import { Router } from "express";
import {
  postTrackController,
  getTracksController,
  getTrackController,
  deactivateTrack,
  activateTrack,
  updateTrackController,
  postCommentController,
  getCommentController,
  getAllCommentController,
  updateCommentController,
  deleteCommentController,
  downloadTrackFileController,
  playTrackController,
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

  getTracksController
);
router.get("/tracks/:id", getTrackController);
router.patch(
  "/tracks/:id",
  withAuth,
  allowRole("admin"),
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

// Track comments routes
router.post(
  "/tracks/:id/comments",
  withAuth,
  allowRole("user", "admin"),
  postCommentController
);
router.get(
  "/tracks/:id/comments/:commentId",
  withAuth,
  allowRole("user", "admin"),
  getCommentController
);
router.get(
  "/tracks/:id/comments",
  withAuth,
  allowRole("user", "admin"),
  getAllCommentController
);
router.patch(
  "/tracks/:id/comments/:commentId",
  withAuth,
  allowRole("user", "admin"),
  updateCommentController
);
router.delete(
  "/tracks/:id/comments/:commentId",
  withAuth,
  allowRole("user", "admin"),
  deleteCommentController
);

// download routes: download track audio or license document
router.get(
  "/tracks/:id/download-file",
  withAuth,
  allowRole("user", "admin"),
  downloadTrackFileController
);

// play track route
router.get("/tracks/:id/play", playTrackController);

export default router;
