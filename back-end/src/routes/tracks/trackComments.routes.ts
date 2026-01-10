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
  commentController.postComment
);
router.get(
  "/:id/comments/:commentId",
  withAuth,
  allowRole("user", "admin"),
  commentController.getComment
);
router.get(
  "/:id/comments",
  withAuth,
  allowRole("user", "admin"),
  commentController.getAllComment
);
router.patch(
  "/:id/comments/:commentId",
  withAuth,
  allowRole("user", "admin"),
  commentController.updateComment
);
router.delete(
  "/:id/comments/:commentId",
  withAuth,
  allowRole("user", "admin"),
  commentController.deleteComment
);

export default router;
