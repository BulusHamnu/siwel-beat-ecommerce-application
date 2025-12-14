import express, { Router } from "express";
import {
  getAdminProfileController,
  getDashboardController,
  updateAdminProfileController,
} from "../controllers/admin.controllers.js";
import withAuth from "../middlewares/withAuth.js";
import allowRole from "../middlewares/allowRole.js";
import {
  getOrderController,
  getAllOrdersController,
} from "../controllers/shared/orders.shared.controllers.js";
import {
  deleteNotificationController,
  getAllNotificationsController,
  getNotificationController,
  updateNoticationAsReadController,
} from "../controllers/shared/notification.controllers.js";

const router = Router();

// routes
router.get(
  "/admins/me",
  withAuth,
  allowRole("admin"),
  getAdminProfileController
);
router.patch(
  "/admins/me",
  withAuth,
  allowRole("admin"),
  updateAdminProfileController
);

/* Orders routes */
router.get(
  "/admins/orders",
  withAuth,
  allowRole("admin"),
  getAllOrdersController
);
router.get(
  "/admins/orders/:id",
  withAuth,
  allowRole("admin"),
  getOrderController
);

/* Dashboard routes */
router.get(
  "/admins/dashboard",
  withAuth,
  allowRole("admin"),
  getDashboardController
);

/* Notifications routes */
router.get(
  "/admins/notifications",
  withAuth,
  allowRole("admin"),
  getAllNotificationsController
);

router.get(
  "/admins/notifications/:id",
  withAuth,
  allowRole("admin"),
  getNotificationController
);

router.patch(
  "/admins/notifications/:id",
  withAuth,
  allowRole("admin"),
  updateNoticationAsReadController
);

router.delete(
  "/admins/notifications/:id",
  withAuth,
  allowRole("admin"),
  deleteNotificationController
);

export default router;
