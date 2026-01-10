import { Router } from "express";
import withAuth from "../../middlewares/withAuth.js";
import allowRole from "../../middlewares/allowRole.js";
import * as notificationController from "../../controllers/shared/notification.controller.js";

const router = Router();

/* Notifications routes */
router.get(
  "/notifications",
  withAuth,
  allowRole("user"),
  notificationController.getAllNotifications
);

router.get(
  "/notifications/:id",
  withAuth,
  allowRole("user"),
  notificationController.getNotification
);

router.patch(
  "/notifications/:id/read",
  withAuth,
  allowRole("user"),
  notificationController.markNoticationAsRead
);

router.patch(
  "/notifications/:id/unread",
  withAuth,
  allowRole("user"),
  notificationController.markNoticationAsUnread
);

router.delete(
  "/notifications/:id",
  withAuth,
  allowRole("user"),
  notificationController.deleteNotification
);

export default router;
