import express, { Router } from "express";
import {
  getAdminProfileController,
  updateAdminProfileController,
} from "../controllers/admin.controllers.js";
import withAuth from "../middlewares/withAuth.js";
import allowRole from "../middlewares/allowRole.js";

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

export default router;
