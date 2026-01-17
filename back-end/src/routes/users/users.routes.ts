import express, { Router } from "express";
import withAuth from "../../middlewares/withAuth.js";
import allowRole from "../../middlewares/allowRole.js";
import { uploadPicture } from "../../middlewares/upload.js";
import * as orderController from "../../controllers/shared/orders.shared.controller.js";
import * as profileController from "../../controllers/profile.controller.js";
import * as purchaseController from "../../controllers/users/userPurchases.controller.js";
import favoritesRoutes from "./userFavourites.routes.js";
import cartRoutes from "./userCart.routes.js";
import notificationRoutes from "./userNotification.routes.js";

const router = Router();

/* Profile */
router.get(
  "/users/me",
  withAuth,
  allowRole("user"),
  profileController.getProfile
);
router.patch(
  "/users/me",
  withAuth,
  allowRole("user"),
  profileController.updateProfile
);
router.patch(
  "/users/me/picture",
  uploadPicture,
  withAuth,
  allowRole("user"),
  profileController.updateUserAvatar
);

/* Orders routes */
router.get(
  "/users/me/orders",
  withAuth,
  allowRole("user"),
  orderController.getAllOrders
);
router.get(
  "/users/me/orders/:id",
  withAuth,
  allowRole("user"),
  orderController.getOrder
);

/* Purchases routes */
router.get(
  "/users/me/purchases",
  withAuth,
  allowRole("user"),
  purchaseController.getAllPurchase
);
router.get(
  "/users/me/purchases/:id",
  withAuth,
  allowRole("user"),
  purchaseController.getPurchase
);

router.use("/users/me", favoritesRoutes);
router.use("/users/me", cartRoutes);
router.use("/users/me", notificationRoutes);

export default router;
