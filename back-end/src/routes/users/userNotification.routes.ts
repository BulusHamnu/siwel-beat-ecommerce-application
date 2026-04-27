import { Router } from "express";
import * as notificationController from "../../controllers/shared/notification.controller.js";
import { generalApiLimiter } from "../../middlewares/rateLimiter.js";

const router = Router();

/* Notifications routes */
router.get(
  "/notifications",
  generalApiLimiter(),
  notificationController.getAllNotifications,
);

router.get(
  "/notifications/:id",
  generalApiLimiter(),
  notificationController.getNotification,
);

router.patch(
  "/notifications/read-all",
  generalApiLimiter(),
  notificationController.readAllNotifications,
);

// router.patch(
//   "/notifications/:id/",
//   generalApiLimiter(),
//   notificationController.updateNotificationStatus,
// );

router.patch(
  "/notifications/:id/",
  generalApiLimiter(),
  notificationController.updateNotificationStatus,
);

router.delete(
  "/notifications/:id",
  generalApiLimiter(),
  notificationController.deleteNotification,
);

export default router;
