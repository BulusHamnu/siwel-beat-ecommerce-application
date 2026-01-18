import { Router } from "express";
import * as trackController from "../../controllers/tracks/track.controller.js";
import withAuth from "../../middlewares/withAuth.js";
import allowRole from "../../middlewares/allowRole.js";
import upload from "../../middlewares/upload.js";
import commentRoutes from "./trackComments.routes.js";
import requiredVerifiedEmail from "../../middlewares/requiredVerifiedEmail.js";

const router = Router();

router.get("/", trackController.getTracks);
router.get("/:id", trackController.getTrack);
/* Play track */
router.get("/:id/play", trackController.playTrack);

/* Comment routes  */
router.use("/", commentRoutes);

// middlewares
router.use(withAuth);
router.use(requiredVerifiedEmail);
router.use(allowRole("user", "admin"));

/* Download track  */
router.get("/:id/download-file", trackController.downloadTrackFile);

/* Only admin should be able to post and modify track */
router.use(allowRole("admin"));
router.post("/", upload, trackController.postTrack);
router.patch("/:id", upload, trackController.updateTrack);

router.post("/:id/activate", trackController.activateTrack);
router.post("/:id/deactivate", trackController.deactivateTrack);

export default router;
