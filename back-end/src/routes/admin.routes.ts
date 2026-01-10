import { Router } from "express";
import { getDashboard } from "../controllers/admin.controller.js";
import withAuth from "../middlewares/withAuth.js";
import allowRole from "../middlewares/allowRole.js";
import * as ordersController from "../controllers/shared/orders.shared.controller.js";
import * as notificationController from "../controllers/shared/notification.controller.js";
import * as profileController from "../controllers/profile.controller.js";
import { uploadPicture } from "../middlewares/upload.js";

const router = Router();

/* Admin profile */
router.get(
  "/admins/me",
  withAuth,
  allowRole("admin"),
  profileController.getProfile
);
router.patch(
  "/admins/me",
  withAuth,
  allowRole("admin"),
  profileController.updateProfile
);
router.patch(
  "/admins/me/picture",
  uploadPicture,
  withAuth,
  allowRole("admin"),
  profileController.updateProfilePicture
);

/* Orders routes */
router.get(
  "/admins/orders",
  withAuth,
  allowRole("admin"),
  ordersController.getAllOrders
);
router.get(
  "/admins/orders/:id",
  withAuth,
  allowRole("admin"),
  ordersController.getOrder
);

/* Dashboard routes */
router.get("/admins/dashboard", withAuth, allowRole("admin"), getDashboard);

/* Notifications routes */
router.get(
  "/admins/notifications",
  withAuth,
  allowRole("admin"),
  notificationController.getAllNotifications
);

router.get(
  "/admins/notifications/:id",
  withAuth,
  allowRole("admin"),
  notificationController.getNotification
);

router.patch(
  "/admins/notifications/:id/read",
  withAuth,
  allowRole("admin"),
  notificationController.markNoticationAsRead
);

router.patch(
  "/admins/notifications/:id/unread",
  withAuth,
  allowRole("admin"),
  notificationController.markNoticationAsRead
);

router.delete(
  "/admins/notifications/:id",
  withAuth,
  allowRole("admin"),
  notificationController.deleteNotification
);

export default router;
