import { Router } from "express";
import requiredAuth from "../../middlewares/requiredAuth.js";
import allowRole from "../../middlewares/allowRole.js";
import * as commentController from "../../controllers/tracks/trackComments.controller.js";
import requiredVerifiedEmail from "../../middlewares/requiredVerifiedEmail.js";
import {
  generalApiLimiter,
  creationApiLimiter,
} from "../../middlewares/rateLimiter.js";

const router = Router();

// Track comments routes
router.get(
  "/:id/comments/:commentId",
  generalApiLimiter(),
  commentController.getComment,
);

router.get(
  "/:id/comments",
  generalApiLimiter(),
  commentController.getAllComment,
);

router.get(
  "/:id/comments/:commentId/likes",
  generalApiLimiter(),
  commentController.getCommentLikes,
);

/* Only autheticated users can post, update and delete comment */
router.use(requiredAuth);
router.use(requiredVerifiedEmail);
router.use(allowRole("user", "admin"));

router.post(
  "/:id/comments",
  generalApiLimiter(),
  commentController.postComment,
);
router.patch(
  "/:id/comments/:commentId",
  creationApiLimiter(),
  commentController.updateComment,
);
router.delete(
  "/:id/comments/:commentId",
  creationApiLimiter(),
  commentController.deleteComment,
);

/* Comment likes */
router.post(
  "/:id/comments/:commentId/likes",
  creationApiLimiter(),
  commentController.likeComment,
);

router.delete(
  "/:id/comments/:commentId/likes",
  generalApiLimiter(),
  commentController.deleteLike,
);

export default router;
