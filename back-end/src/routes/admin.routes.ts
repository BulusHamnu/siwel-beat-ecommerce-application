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

export default router;
