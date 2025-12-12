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
} from "../controllers/users.controllers.js";
import withAuth from "../middlewares/withAuth.js";
import allowRole from "../middlewares/allowRole.js";
import { uploadPicture } from "../middlewares/upload.js";
import {
  getAllOrdersController,
  getOrderController,
} from "../controllers/shared/orders.shared.controllers.js";

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
// cart
router.post("/users/me/cart", withAuth, allowRole("user"), addToCartController);
router.patch(
  "/users/me/cart",
  withAuth,
  allowRole("user"),
  removeItemFromCartController
);

router.get("/users/me/cart", withAuth, allowRole("user"), getCartController);

/* Orders */
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

export default router;
