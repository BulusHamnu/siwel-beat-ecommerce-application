import { Router } from "express";
import { getDashboard } from "../controllers/admin.controller.js";
import withAuth from "../middlewares/withAuth.js";
import allowRole from "../middlewares/allowRole.js";
import * as ordersController from "../controllers/shared/orders.shared.controller.js";
import * as notificationController from "../controllers/shared/notification.controller.js";
import * as profileController from "../controllers/profile.controller.js";
import { uploadPicture } from "../middlewares/upload.js";
import {
  generalApiLimiter,
  uploadAvatarLimiter,
  creationApiLimiter,
} from "../middlewares/rateLimiter.js";

const router = Router();

router.use(withAuth);
router.use(allowRole("admin"));

/* Admin profile */
router.get("/me", generalApiLimiter, profileController.getProfile);
router.patch("/me", creationApiLimiter, profileController.updateProfile);
router.patch(
  "/me/picture",
  uploadAvatarLimiter,
  uploadPicture,
  profileController.updateUserAvatar
);

/* Dashboard routes */
router.get("/dashboard", generalApiLimiter, getDashboard);

/* Notifications routes */
router.get(
  "/notifications",
  generalApiLimiter,
  notificationController.getAllNotifications
);
router.get(
  "/notifications/:id",
  generalApiLimiter,
  notificationController.getNotification
);

router.patch(
  "/notifications/:id/read",
  generalApiLimiter,
  notificationController.markNoticationAsRead
);
router.patch(
  "/notifications/:id/unread",
  generalApiLimiter,
  notificationController.markNoticationAsRead
);

router.delete(
  "/notifications/:id",
  generalApiLimiter,
  notificationController.deleteNotification
);

/* Orders routes */
router.get("/orders", generalApiLimiter, ordersController.getAllOrders); // Issue here
router.get("/orders/:id", generalApiLimiter, ordersController.getOrder);

export default router;
