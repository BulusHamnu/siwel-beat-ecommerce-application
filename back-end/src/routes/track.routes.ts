import { Router } from "express";
import {
  postTrackController,
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
router.get("/tracks", withAuth, getTrackController);

export default router;
