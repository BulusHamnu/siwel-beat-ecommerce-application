import { Router } from "express";
import withAuth from "../../middlewares/withAuth.js";
import allowRole from "../../middlewares/allowRole.js";
import * as commentController from "../../controllers/tracks/trackComments.controller.js";

const router = Router();

// Track comments routes
router.post(
  "/:id/comments",
  withAuth,
  allowRole("user", "admin"),
  commentController.postCommentController
);
router.get(
  "/:id/comments/:commentId",
  withAuth,
  allowRole("user", "admin"),
  commentController.getCommentController
);
router.get(
  "/:id/comments",
  withAuth,
  allowRole("user", "admin"),
  commentController.getAllCommentController
);
router.patch(
  "/:id/comments/:commentId",
  withAuth,
  allowRole("user", "admin"),
  commentController.updateCommentController
);
router.delete(
  "/:id/comments/:commentId",
  withAuth,
  allowRole("user", "admin"),
  commentController.deleteCommentController
);

export default router;
