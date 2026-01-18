import { Router } from "express";
import * as notificationController from "../../controllers/shared/notification.controller.js";

const router = Router();

/* Notifications routes */
router.get("/notifications", notificationController.getAllNotifications);
router.get("/notifications/:id", notificationController.getNotification);

router.patch(
  "/notifications/:id/read",
  notificationController.markNoticationAsRead
);
router.patch(
  "/notifications/:id/unread",
  notificationController.markNoticationAsUnread
);

router.delete("/notifications/:id", notificationController.deleteNotification);

export default router;
