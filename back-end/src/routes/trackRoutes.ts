import { Router } from "express";
import postTrackController from "../controllers/track/postTrackController.js";
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

export default router;
