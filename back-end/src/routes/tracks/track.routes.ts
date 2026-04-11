import { Router } from "express";
import * as trackController from "../../controllers/tracks/track.controller.js";
import requiredAuth from "../../middlewares/requiredAuth.js";
import allowRole from "../../middlewares/allowRole.js";
import upload from "../../middlewares/upload.js";
import commentRoutes from "./trackComments.routes.js";
import requiredVerifiedEmail from "../../middlewares/requiredVerifiedEmail.js";
import rateLimiter, {
  generalApiLimiter,
  creationApiLimiter,
} from "../../middlewares/rateLimiter.js";
import optionalAuth from "../../middlewares/optionalAuth.js";

const router = Router();

router.get("/", generalApiLimiter(), optionalAuth, trackController.getTracks);
router.get("/:id", generalApiLimiter(), optionalAuth, trackController.getTrack);
/* Play track */
router.get("/:id/stream", trackController.streamTrackAudio);

/* Comment routes  */
router.use("/", commentRoutes);

// middlewares
router.use(requiredAuth);
router.use(requiredVerifiedEmail);
router.use(allowRole("user", "admin"));

/* Download track  */
router.get(
  "/:id/download-file",
  rateLimiter(30, 10 * 60 * 1000),
  trackController.downloadTrackFile,
);

/* Only admin should be able to post and modify track */
router.use(allowRole("admin"));
router.post("/", creationApiLimiter(), upload, trackController.postTrack);
router.patch("/:id", creationApiLimiter(), upload, trackController.updateTrack);

router.post("/:id/publish", creationApiLimiter(), trackController.publishTrack);
router.post(
  "/:id/unpublish",
  creationApiLimiter(),
  trackController.unpublishTrack,
);

router.get("/:id/media", trackController.retrieveTrackMedia);
router.delete("/:id", trackController.deleteTrack);

export default router;
