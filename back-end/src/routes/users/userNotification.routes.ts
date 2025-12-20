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
  notificationController.getAllNotificationsController
);

router.get(
  "/notifications/:id",
  withAuth,
  allowRole("user"),
  notificationController.getNotificationController
);

router.patch(
  "/notifications/:id",
  withAuth,
  allowRole("user"),
  notificationController.updateNoticationAsReadController
);

router.delete(
  "/notifications/:id",
  withAuth,
  allowRole("user"),
  notificationController.deleteNotificationController
);

export default router;
