import express, { Router } from "express";
import {
  getAdminProfileController,
  getDashboardController,
  updateAdminProfileController,
} from "../controllers/admin.controller.js";
import withAuth from "../middlewares/withAuth.js";
import allowRole from "../middlewares/allowRole.js";
import * as ordersController from "../controllers/shared/orders.shared.controller.js";
import * as notificationController from "../controllers/shared/notification.controller.js";

const router = Router();

/* Admin profile */
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
  ordersController.getAllOrdersController
);
router.get(
  "/admins/orders/:id",
  withAuth,
  allowRole("admin"),
  ordersController.getOrderController
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
  notificationController.getAllNotificationsController
);

router.get(
  "/admins/notifications/:id",
  withAuth,
  allowRole("admin"),
  notificationController.getNotificationController
);

router.patch(
  "/admins/notifications/:id/read",
  withAuth,
  allowRole("admin"),
  notificationController.markNoticationAsReadController
);

router.patch(
  "/admins/notifications/:id/unread",
  withAuth,
  allowRole("admin"),
  notificationController.markNoticationAsReadController
);

router.delete(
  "/admins/notifications/:id",
  withAuth,
  allowRole("admin"),
  notificationController.deleteNotificationController
);

export default router;
