import express, { Router } from "express";
import {
  getProfileController,
  updateProfileController,
  updateProfilePictureController,
  getUsersFavourites,
  addUsersFavourites,
  removeFromUsersFavourites,
  addToCartController,
  removeItemFromCartController,
  getCartController,
  getAllPurchaseController,
  getPurchaseController,
} from "../controllers/users.controllers.js";
import withAuth from "../middlewares/withAuth.js";
import allowRole from "../middlewares/allowRole.js";
import { uploadPicture } from "../middlewares/upload.js";
import {
  getAllOrdersController,
  getOrderController,
} from "../controllers/shared/orders.shared.controllers.js";
import {
  deleteNotificationController,
  getAllNotificationsController,
  getNotificationController,
  updateNoticationAsReadController,
} from "../controllers/shared/notification.controllers.js";

const router = Router();

// routes
router.get("/users/me", withAuth, allowRole("user"), getProfileController);
router.patch("/users/me", withAuth, allowRole("user"), updateProfileController);
router.patch(
  "/users/me/picture",
  uploadPicture,
  withAuth,
  allowRole("user"),
  updateProfilePictureController
);
// favourites
router.post(
  "/users/me/favourites",
  withAuth,
  allowRole("user"),
  addUsersFavourites
);
router.get(
  "/users/me/favourites",
  withAuth,
  allowRole("user"),
  getUsersFavourites
);
router.delete(
  "/users/me/favourites",
  withAuth,
  allowRole("user"),
  removeFromUsersFavourites
);


/* Cart routes */
router.post("/users/me/cart", withAuth, allowRole("user"), addToCartController);
router.patch(
  "/users/me/cart",
  withAuth,
  allowRole("user"),
  removeItemFromCartController
);

router.get("/users/me/cart", withAuth, allowRole("user"), getCartController);

/* Orders routes */
router.get(
  "/users/me/orders",
  withAuth,
  allowRole("user"),
  getAllOrdersController
);
router.get(
  "/users/me/orders/:id",
  withAuth,
  allowRole("user"),
  getOrderController
);

/* Purchases routes */
router.get(
  "/users/me/purchases",
  withAuth,
  allowRole("user"),
  getAllPurchaseController
);
router.get(
  "/users/me/purchases/:id",
  withAuth,
  allowRole("user"),
  getPurchaseController
);

/* Notifications routes */
router.get(
  "/users/me/notifications",
  withAuth,
  allowRole("user"),
  getAllNotificationsController
);

router.get(
  "/users/me/notifications/:id",
  withAuth,
  allowRole("user"),
  getNotificationController
);

router.patch(
  "/users/me/notifications/:id",
  withAuth,
  allowRole("user"),
  updateNoticationAsReadController
);

router.delete(
  "/users/me/notifications/:id",
  withAuth,
  allowRole("user"),
  deleteNotificationController
);

export default router;
