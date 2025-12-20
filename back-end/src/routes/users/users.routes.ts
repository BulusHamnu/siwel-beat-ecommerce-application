import express, { Router } from "express";
import withAuth from "../../middlewares/withAuth.js";
import allowRole from "../../middlewares/allowRole.js";
import { uploadPicture } from "../../middlewares/upload.js";
import * as orderController from "../../controllers/shared/orders.shared.controller.js";
import * as userController from "../../controllers/users/users.controller.js";
import favoritesRoutes from "./userFavourites.routes.js";
import cartRoutes from "./userCart.routes.js";
import notificationRoutes from "./userNotification.routes.js";

const router = Router();

/* Profile */
router.get(
  "/users/me",
  withAuth,
  allowRole("user"),
  userController.getProfileController
);
router.patch(
  "/users/me",
  withAuth,
  allowRole("user"),
  userController.updateProfileController
);
router.patch(
  "/users/me/picture",
  uploadPicture,
  withAuth,
  allowRole("user"),
  userController.updateProfilePictureController
);

/* Orders routes */
router.get(
  "/users/me/orders",
  withAuth,
  allowRole("user"),
  orderController.getAllOrdersController
);
router.get(
  "/users/me/orders/:id",
  withAuth,
  allowRole("user"),
  orderController.getOrderController
);

/* Purchases routes */
router.get(
  "/users/me/purchases",
  withAuth,
  allowRole("user"),
  userController.getAllPurchaseController
);
router.get(
  "/users/me/purchases/:id",
  withAuth,
  allowRole("user"),
  userController.getPurchaseController
);

router.use("/users/me", favoritesRoutes);
router.use("/users/me", cartRoutes);
router.use("/users/me", notificationRoutes);

export default router;
