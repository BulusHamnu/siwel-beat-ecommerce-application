import { Router } from "express";
import { getDashboard } from "../controllers/admin.controller.js";
import withAuth from "../middlewares/withAuth.js";
import allowRole from "../middlewares/allowRole.js";
import * as ordersController from "../controllers/shared/orders.shared.controller.js";
import * as notificationController from "../controllers/shared/notification.controller.js";
import * as profileController from "../controllers/profile.controller.js";
import { uploadPicture } from "../middlewares/upload.js";

const router = Router();

router.use(withAuth);
router.use(allowRole("admin"));

/* Admin profile */
router.get("/me", profileController.getProfile);
router.patch("/me", profileController.updateProfile);
router.patch("/me/picture", uploadPicture, profileController.updateUserAvatar);

/* Dashboard routes */
router.get("/dashboard", getDashboard);

/* Notifications routes */
router.get("/notifications", notificationController.getAllNotifications);
router.get("/notifications/:id", notificationController.getNotification);

router.patch(
  "/notifications/:id/read",
  notificationController.markNoticationAsRead
);
router.patch(
  "/notifications/:id/unread",
  notificationController.markNoticationAsRead
);

router.delete("/notifications/:id", notificationController.deleteNotification);

/* Orders routes */
router.get("/orders", ordersController.getAllOrders);
router.get("/orders/:id", ordersController.getOrder);

export default router;
