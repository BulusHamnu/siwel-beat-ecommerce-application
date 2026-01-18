import { Router } from "express";
import withAuth from "../../middlewares/withAuth.js";
import allowRole from "../../middlewares/allowRole.js";
import * as commentController from "../../controllers/tracks/trackComments.controller.js";
import requiredVerifiedEmail from "../../middlewares/requiredVerifiedEmail.js";

const router = Router();

// Track comments routes
router.get("/:id/comments/:commentId", commentController.getComment);
router.get("/:id/comments", commentController.getAllComment);

/* Only autheticated users can post, update and delete comment */
router.use(withAuth);
router.use(requiredVerifiedEmail);
router.use(allowRole("user", "admin"));

router.post("/:id/comments", commentController.postComment);
router.patch("/:id/comments/:commentId", commentController.updateComment);
router.delete("/:id/comments/:commentId", commentController.deleteComment);

export default router;
